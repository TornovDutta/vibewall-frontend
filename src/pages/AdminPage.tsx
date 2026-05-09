import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { ReportResponse, UsersRequested, UsersResponse } from '../types';
import { generateAnonName } from '../utils/generateAnonName';

type Tab = 'overview' | 'pending' | 'reports' | 'users' | 'profile';

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  RESOLVED:  'text-green-400 bg-green-500/10 border-green-500/30',
  DISMISSED: 'text-gray-400  bg-gray-500/10  border-gray-500/30',
  REJECTED:  'text-red-400   bg-red-500/10   border-red-500/30',
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const anonName = user ? generateAnonName(user.id) : '';

  const [tab, setTab] = useState<Tab>('overview');

  // Data
  const [users, setUsers]                 = useState<UsersResponse[]>([]);
  const [reports, setReports]             = useState<ReportResponse[]>([]);
  const [pendingReports, setPendingReports] = useState<ReportResponse[]>([]);

  // Loading states
  const [usersLoading, setUsersLoading]     = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [resolving, setResolving]           = useState<string | null>(null);

  // Create admin form
  const [newAdmin, setNewAdmin] = useState<UsersRequested>({ name: '', password: '' });
  const [adminMsg, setAdminMsg] = useState('');

  // Profile form
  const [profileName, setProfileName]       = useState(user?.username ?? '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileMsg, setProfileMsg]         = useState('');

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try { setUsers(await adminApi.getAllUsers()); }
    catch { /* ignore */ }
    finally { setUsersLoading(false); }
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
    } catch { /* ignore */ }
    finally { setReportsLoading(false); }
  }, []);

  // Load data on mount and on tab switch
  useEffect(() => {
    loadReports();
    loadUsers();
  }, [loadReports, loadUsers]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'reports' || tab === 'pending' || tab === 'overview') loadReports();
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
    } catch { /* ignore */ }
    finally { setResolving(null); }
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
    } finally { setProfileSaving(false); }
  }

  async function handleDeleteAdminAccount() {
    if (!confirm('Permanently delete this admin account?')) return;
    try {
      await adminApi.deleteAdminAccount();
      await logout();
      navigate('/admin/login');
    } catch { /* ignore */ }
  }

  // ── Sidebar nav config ──────────────────────────────────────────────────────
  const navItems: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      key: 'overview', label: 'Overview',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      key: 'pending', label: 'Pending',
      badge: pendingReports.length || undefined,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      key: 'reports', label: 'All Reports',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'users', label: 'Users',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'profile', label: 'Profile',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-vw-bg">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="hidden w-56 flex-col border-r border-vw-border bg-vw-surface lg:flex">
        {/* Sidebar header */}
        <div className="border-b border-vw-border px-5 py-5">
          <p className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-base font-extrabold text-transparent">
            VibeWall
          </p>
          <span className="mt-1 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-red-400">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                tab === item.key
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Admin identity */}
        <div className="border-t border-vw-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
              {anonName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-violet-400">{anonName}</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/admin/login'); }}
            className="mt-3 w-full rounded-lg border border-vw-border px-3 py-1.5 text-xs text-gray-500 transition hover:border-red-500/40 hover:text-red-400"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Top bar (mobile + desktop) */}
        <header className="flex items-center justify-between border-b border-vw-border bg-vw-surface px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">
              {navItems.find((n) => n.key === tab)?.label ?? 'Admin Panel'}
            </h1>
            <p className="text-xs text-gray-600">VibeWall control centre</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 sm:block">
              ADMIN
            </span>
            {/* Mobile nav */}
            <div className="flex gap-1 lg:hidden">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  title={item.label}
                  className={`relative rounded-lg p-2 transition ${
                    tab === item.key ? 'bg-violet-600/20 text-violet-400' : 'text-gray-600 hover:text-gray-300'
                  }`}
                >
                  {item.icon}
                  {item.badge ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">

          {/* ── Overview ─────────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Stats row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Total Users"
                  value={usersLoading ? '…' : String(users.length)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  color="violet"
                />
                <StatCard
                  label="Total Reports"
                  value={reportsLoading ? '…' : String(reports.length)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  color="blue"
                />
                <StatCard
                  label="Pending Review"
                  value={reportsLoading ? '…' : String(pendingReports.length)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                  color="amber"
                  highlight={pendingReports.length > 0}
                />
              </div>

              {/* Quick-action pending */}
              {pendingReports.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-amber-400">
                      Needs Attention — {pendingReports.length} pending
                    </h2>
                    <button
                      onClick={() => setTab('pending')}
                      className="text-xs text-violet-400 transition hover:text-violet-300"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {pendingReports.slice(0, 3).map((r) => (
                      <ReportCard
                        key={r.id}
                        report={r}
                        resolving={resolving}
                        onResolve={handleResolve}
                        showActions
                      />
                    ))}
                  </div>
                </div>
              )}

              {pendingReports.length === 0 && !reportsLoading && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-8 text-center">
                  <svg className="mx-auto mb-3 h-10 w-10 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-green-400">All clear</p>
                  <p className="mt-1 text-xs text-gray-500">No pending reports to review.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Pending Reports ───────────────────────────────────────────────── */}
          {tab === 'pending' && (
            <div className="space-y-3">
              {reportsLoading ? (
                <LoadingSpinner />
              ) : pendingReports.length === 0 ? (
                <div className="rounded-xl border border-vw-border bg-vw-card p-12 text-center text-gray-500">
                  No pending reports.
                </div>
              ) : (
                pendingReports.map((r) => (
                  <ReportCard key={r.id} report={r} resolving={resolving} onResolve={handleResolve} showActions />
                ))
              )}
            </div>
          )}

          {/* ── All Reports ───────────────────────────────────────────────────── */}
          {tab === 'reports' && (
            <div className="space-y-3">
              {reportsLoading ? (
                <LoadingSpinner />
              ) : reports.length === 0 ? (
                <div className="rounded-xl border border-vw-border bg-vw-card p-12 text-center text-gray-500">
                  No reports found.
                </div>
              ) : (
                reports.map((r) => (
                  <ReportCard key={r.id} report={r} resolving={resolving} onResolve={handleResolve} />
                ))
              )}
            </div>
          )}

          {/* ── Users ─────────────────────────────────────────────────────────── */}
          {tab === 'users' && (
            <div className="space-y-6">
              {/* Create admin */}
              <div className="rounded-2xl border border-vw-border bg-vw-card p-6">
                <h3 className="mb-1 text-sm font-semibold text-gray-200">Create Admin Account</h3>
                <p className="mb-4 text-xs text-gray-500">New admin accounts have full panel access.</p>
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
                  className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  Create Admin
                </button>
              </div>

              {/* Users table */}
              <div className="rounded-2xl border border-vw-border bg-vw-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-vw-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">All Users</h3>
                    <p className="text-xs text-gray-500">{users.length} registered</p>
                  </div>
                  <button
                    onClick={loadUsers}
                    className="flex items-center gap-1.5 text-xs text-gray-500 transition hover:text-violet-400"
                  >
                    <svg className={`h-3.5 w-3.5 ${usersLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                {usersLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="divide-y divide-vw-border">
                    {users.map((u, idx) => (
                      <div key={u.id} className="flex items-center gap-4 px-5 py-3">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-900/30 text-xs font-bold text-violet-400">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">@{u.name}</p>
                          <p className="truncate text-xs text-gray-600">{u.id}</p>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="px-5 py-8 text-center text-sm text-gray-500">No users found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Profile ───────────────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <div className="rounded-2xl border border-vw-border bg-vw-card p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-base font-bold text-white">
                    {anonName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{anonName}</p>
                    <p className="text-xs text-red-400">Administrator</p>
                  </div>
                </div>

                <h3 className="mb-4 text-sm font-semibold text-gray-300">Update Profile</h3>
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

              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <h3 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h3>
                <p className="mb-4 text-xs text-gray-500">Permanently delete this admin account. This cannot be undone.</p>
                <button
                  onClick={handleDeleteAdminAccount}
                  className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  Delete Admin Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'violet' | 'blue' | 'amber';
  highlight?: boolean;
}

function StatCard({ label, value, icon, color, highlight }: StatCardProps) {
  const palette = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    blue:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
    amber:  'text-amber-400  bg-amber-500/10  border-amber-500/20',
  };
  return (
    <div className={`rounded-2xl border bg-vw-card p-5 ${highlight ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-vw-border'}`}>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${palette[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────────
interface ReportCardProps {
  report: ReportResponse;
  resolving: string | null;
  onResolve: (id: string, status: string) => void;
  showActions?: boolean;
}

function ReportCard({ report, resolving, onResolve, showActions = false }: ReportCardProps) {
  const [selectedStatus, setSelectedStatus] = useState('RESOLVED');
  const color = STATUS_COLOR[report.status] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/30';

  return (
    <div className="rounded-xl border border-vw-border bg-vw-card p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-gray-300">{report.reportContent}</p>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
          {report.status}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vw-border pt-3">
        <div className="text-xs text-gray-600">
          <span className="font-mono">{report.id.slice(0, 12)}…</span>
          {report.dateTime && (
            <span className="ml-3">{new Date(report.dateTime).toLocaleString()}</span>
          )}
        </div>
        {showActions && report.status === 'PENDING' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-vw-border bg-vw-surface px-2 py-1.5 text-xs text-gray-300 focus:outline-none"
            >
              {['RESOLVED', 'DISMISSED', 'REJECTED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => onResolve(report.id, selectedStatus)}
              disabled={resolving === report.id}
              className="rounded-lg bg-violet-600/80 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-600 disabled:opacity-40"
            >
              {resolving === report.id ? '…' : 'Submit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
