import type { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '../api/feed';
import { reportsApi } from '../api/reports';
import { usersApi } from '../api/users';
import ConfessionCard from '../components/ConfessionCard';
import CreateConfessionModal, {
  getOwnedConfessionIds,
  removeOwnedConfession,
} from '../components/CreateConfessionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse, OwnedReport } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateAnonName } from '../utils/generateAnonName';

const OWNED_REPORTS_KEY = 'vw_owned_reports';

function getOwnedReports(): OwnedReport[] {
  try {
    return JSON.parse(localStorage.getItem(OWNED_REPORTS_KEY) ?? '[]');
  } catch { return []; }
}

function removeOwnedReport(id: string) {
  const existing = getOwnedReports().filter((r) => r.id !== id);
  localStorage.setItem(OWNED_REPORTS_KEY, JSON.stringify(existing));
}

type Tab = 'my' | 'feed' | 'reports' | 'profile';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const anonName = user ? generateAnonName(user.id) : '';
  const [tab, setTab] = useState<Tab>('my');
  const [confessions, setConfessions] = useState<ConfessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [ownedReports, setOwnedReports] = useState<OwnedReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [reportActionError, setReportActionError] = useState('');
  const [accountError, setAccountError] = useState('');

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.username ?? '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setFeedError('');
    try {
      const data = await feedApi.getFeed();
      setConfessions(data ?? []);
      setOwnedIds(getOwnedConfessionIds());
    } catch {
      setFeedError('Failed to load feed. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const data = await reportsApi.list();
      const mapped: OwnedReport[] = data.map((r) => ({
        id: r.id,
        content: r.reportContent,
        createdAt: r.dateTime ?? new Date().toISOString(),
      }));
      setOwnedReports(mapped);
    } catch {
      setOwnedReports(getOwnedReports());
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (tab === 'reports') loadReports();
  }, [tab, loadReports]);

  function handleUpdate(updated: ConfessionResponse) {
    setConfessions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(id: string) {
    setConfessions((prev) => prev.filter((c) => c.id !== id));
    removeOwnedConfession(id);
    setOwnedIds((prev) => prev.filter((i) => i !== id));
  }

  function handleCreated(c: ConfessionResponse) {
    setConfessions((prev) => [c, ...prev]);
    setOwnedIds((prev) => [c.id, ...prev]);
  }

  async function handleDeleteReport(id: string) {
    setReportActionError('');
    try {
      await reportsApi.delete(id);
      removeOwnedReport(id);
      await loadReports();
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setReportActionError(err?.response?.data?.message ?? 'Failed to withdraw report.');
    }
  }

  async function handleSaveProfile() {
    if (!profileName.trim()) return;
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await usersApi.updateProfile({ name: profileName.trim(), password: profilePassword });
      setProfileMsg('Profile updated successfully.');
      setProfilePassword('');
    } catch (e: unknown) {
      const err = e as AxiosError<{ msg?: string }>;
      setProfileMsg(err?.response?.data?.msg ?? 'Update failed.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Permanently delete your account? This cannot be undone.')) return;
    setAccountError('');
    try {
      await usersApi.deleteAccount();
      await logout();
      navigate('/login');
    } catch {
      setAccountError('Failed to delete account. Please try again.');
    }
  }

  const myConfessions = confessions.filter((c) => ownedIds.includes(c.id));
  const allFeed = confessions;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'my', label: 'My Confessions' },
    { key: 'feed', label: 'All Feed' },
    { key: 'reports', label: 'My Reports' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-vw-bg">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, <span className="text-violet-600 font-medium">{anonName}</span></p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Confess
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="flex flex-col gap-1 rounded-2xl border border-vw-border bg-vw-card p-2 shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    tab === t.key
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {feedError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {feedError}
              </div>
            )}
            
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="animate-fade-in">
                {tab === 'my' && (
                  <div className="space-y-4">
                    {myConfessions.length === 0 ? (
                      <div className="rounded-2xl border border-vw-border bg-vw-card p-12 text-center shadow-sm">
                        <div className="mb-4 flex justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
                            <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                        </div>
                        <p className="mb-2 text-lg font-medium text-gray-900">No confessions yet</p>
                        <p className="mb-6 text-sm text-gray-500">You haven't posted anything to the wall.</p>
                        <button
                          onClick={() => setShowCreate(true)}
                          className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-violet-700"
                        >
                          Post your first confession
                        </button>
                      </div>
                    ) : (
                      myConfessions.map((c) => (
                        <ConfessionCard
                          key={c.id}
                          confession={c}
                          isOwned
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>
                )}

                {tab === 'feed' && (
                  <div className="space-y-4">
                    {allFeed.length === 0 ? (
                      <div className="rounded-2xl border border-vw-border bg-vw-card p-12 text-center text-gray-500 shadow-sm">
                        No confessions in the feed yet.
                      </div>
                    ) : (
                      allFeed.map((c) => (
                        <ConfessionCard
                          key={c.id}
                          confession={c}
                          isOwned={ownedIds.includes(c.id)}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </div>
                )}

                {tab === 'reports' && (
                  <div className="space-y-4">
                    <div className="flex justify-end mb-6">
                      <button
                        onClick={() => setShowReport(true)}
                        className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-700 transition hover:border-amber-300"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        New Report
                      </button>
                    </div>

                    {reportActionError && (
                      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {reportActionError}
                      </div>
                    )}
                    {reportsLoading ? (
                      <LoadingSpinner />
                    ) : ownedReports.length === 0 ? (
                      <div className="rounded-2xl border border-vw-border bg-vw-card p-12 text-center shadow-sm">
                        <div className="mb-4 flex justify-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                            <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-gray-900">No reports submitted</p>
                        <p className="mt-2 text-sm text-gray-500">You haven't submitted any reports yet.</p>
                      </div>
                    ) : (
                      ownedReports.map((r) => (
                        <div key={r.id} className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 leading-relaxed line-clamp-3">{r.content}</p>
                              <p className="mt-3 text-xs font-medium text-gray-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteReport(r.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === 'profile' && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-vw-border bg-vw-card p-8 shadow-sm">
                      <h3 className="mb-6 text-lg font-bold text-gray-900">Update Profile</h3>
                      <div className="max-w-md space-y-5">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                          <input
                            type="password"
                            value={profilePassword}
                            onChange={(e) => setProfilePassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                        {profileMsg && (
                          <div className={`rounded-xl p-3 text-sm font-medium ${profileMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {profileMsg}
                          </div>
                        )}
                        <button
                          onClick={handleSaveProfile}
                          disabled={profileSaving}
                          className="w-full md:w-auto rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white shadow-md transition hover:bg-violet-700 disabled:opacity-50"
                        >
                          {profileSaving ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
                      <h3 className="mb-2 text-lg font-bold text-red-600">Danger Zone</h3>
                      <p className="mb-6 text-sm text-gray-600">
                        Permanently delete your account. All confessions will be removed. This cannot be undone.
                      </p>
                      {accountError && (
                        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{accountError}</p>
                      )}
                      <button
                        onClick={handleDeleteAccount}
                        className="rounded-xl border-2 border-red-100 bg-red-50 px-6 py-2.5 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateConfessionModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {showReport && (
        <ReportModal onClose={() => {
          setShowReport(false);
          loadReports();
        }} />
      )}
    </div>
  );
}
