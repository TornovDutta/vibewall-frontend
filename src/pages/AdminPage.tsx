import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { ReportResponse, UsersRequested, UsersResponse } from '../types';

type Tab = 'users' | 'reports' | 'pending' | 'profile';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('reports');

  // Users state
  const [users, setUsers] = useState<UsersResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState<UsersRequested>({ name: '', password: '' });
  const [adminMsg, setAdminMsg] = useState('');

  // Reports state
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [pendingReports, setPendingReports] = useState<ReportResponse[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  // Admin profile state
  const [profileName, setProfileName] = useState(user?.username ?? '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const [all, pending] = await Promise.all([
        adminApi.getAllReports(),
        adminApi.getPendingReports(),
      ]);
      setReports(all);
      setPendingReports(pending);
    } catch {
      // ignore
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'reports' || tab === 'pending') loadReports();
  }, [tab, loadUsers, loadReports]);

  async function handleCreateAdmin() {
    if (!newAdmin.name || !newAdmin.password) return;
    setAdminMsg('');
    try {
      await adminApi.createAdmin(newAdmin);
      setAdminMsg('Admin account created successfully.');
      setNewAdmin({ name: '', password: '' });
      loadUsers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setAdminMsg(err?.response?.data?.msg ?? 'Failed to create admin');
    }
  }

  async function handleResolve(id: string, status: string) {
    setResolving(id);
    try {
      await adminApi.resolveReport(id, status);
      await loadReports();
    } catch {
      // ignore
    } finally {
      setResolving(null);
    }
  }

  async function handleSaveProfile() {
    if (!profileName.trim()) return;
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await adminApi.updateAdminProfile({ name: profileName.trim(), password: profilePassword });
      setProfileMsg('Profile updated.');
      setProfilePassword('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setProfileMsg(err?.response?.data?.msg ?? 'Update failed.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleDeleteAdminAccount() {
    if (!confirm('Permanently delete this admin account?')) return;
    try {
      await adminApi.deleteAdminAccount();
      await logout();
      navigate('/login');
    } catch {
      // ignore
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'reports', label: 'All Reports' },
    { key: 'pending', label: 'Pending' },
    { key: 'users', label: 'Users' },
    { key: 'profile', label: 'Admin Profile' },
  ];

  const statusColor: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    RESOLVED: 'text-green-400 bg-green-500/10 border-green-500/30',
    DISMISSED: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-vw-bg">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-gray-500">@{user?.username} — ADMIN</p>
          </div>
          <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
            ADMIN
          </span>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-vw-border bg-vw-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                tab === t.key
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
              {t.key === 'pending' && pendingReports.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {pendingReports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── All Reports ─────────────────────────────────────────── */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reportsLoading ? (
              <LoadingSpinner />
            ) : reports.length === 0 ? (
              <div className="rounded-xl border border-vw-border bg-vw-card p-10 text-center text-gray-500">
                No reports found.
              </div>
            ) : (
              reports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  resolving={resolving}
                  statusColor={statusColor}
                  onResolve={handleResolve}
                />
              ))
            )}
          </div>
        )}

        {/* ─── Pending Reports ─────────────────────────────────────── */}
        {tab === 'pending' && (
          <div className="space-y-3">
            {reportsLoading ? (
              <LoadingSpinner />
            ) : pendingReports.length === 0 ? (
              <div className="rounded-xl border border-vw-border bg-vw-card p-10 text-center text-gray-500">
                No pending reports.
              </div>
            ) : (
              pendingReports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  resolving={resolving}
                  statusColor={statusColor}
                  onResolve={handleResolve}
                  showActions
                />
              ))
            )}
          </div>
        )}

        {/* ─── Users ───────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div className="space-y-6">
            {/* Create admin */}
            <div className="rounded-xl border border-vw-border bg-vw-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-300">Create Admin Account</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Username</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                    placeholder="admin_username"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                    className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {adminMsg && (
                <p className={`mt-2 text-xs ${adminMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                  {adminMsg}
                </p>
              )}
              <button
                onClick={handleCreateAdmin}
                className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Create Admin
              </button>
            </div>

            {/* Users list */}
            <div className="rounded-xl border border-vw-border bg-vw-card">
              <div className="flex items-center justify-between border-b border-vw-border px-5 py-4">
                <h3 className="text-sm font-semibold text-gray-300">All Users</h3>
                <button
                  onClick={loadUsers}
                  className="text-xs text-gray-500 transition hover:text-violet-400"
                >
                  Refresh
                </button>
              </div>
              {usersLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className="divide-y divide-vw-border">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-white">@{u.name}</p>
                        <p className="text-xs text-gray-600">{u.id}</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="px-5 py-6 text-center text-sm text-gray-500">No users found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Admin Profile ───────────────────────────────────────── */}
        {tab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-vw-border bg-vw-card p-6">
              <h3 className="mb-5 text-sm font-semibold text-gray-300">Update Admin Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">Username</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">New Password</label>
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                {profileMsg && (
                  <p className={`text-xs ${profileMsg.includes('updated') ? 'text-green-400' : 'text-red-400'}`}>
                    {profileMsg}
                  </p>
                )}
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <h3 className="mb-2 text-sm font-semibold text-red-400">Danger Zone</h3>
              <p className="mb-4 text-xs text-gray-500">
                Permanently delete this admin account.
              </p>
              <button
                onClick={handleDeleteAdminAccount}
                className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                Delete Admin Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────
interface ReportCardProps {
  report: ReportResponse;
  resolving: string | null;
  statusColor: Record<string, string>;
  onResolve: (id: string, status: string) => void;
  showActions?: boolean;
}

function ReportCard({ report, resolving, statusColor, onResolve, showActions = true }: ReportCardProps) {
  const [selectedStatus, setSelectedStatus] = useState('RESOLVED');
  const color = statusColor[report.status] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/30';

  return (
    <div className="rounded-xl border border-vw-border bg-vw-card p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="text-sm text-gray-300">{report.reportContent}</p>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
          {report.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vw-border pt-3">
        <div className="text-xs text-gray-600">
          ID: {report.id}
          {report.dateTime && <span className="ml-3">{new Date(report.dateTime).toLocaleString()}</span>}
        </div>

        {showActions && report.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded border border-vw-border bg-vw-surface px-2 py-1 text-xs text-gray-300 focus:outline-none"
            >
              {['RESOLVED', 'DISMISSED', 'REJECTED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => onResolve(report.id, selectedStatus)}
              disabled={resolving === report.id}
              className="rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-600 disabled:opacity-40"
            >
              {resolving === report.id ? '…' : 'Submit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
