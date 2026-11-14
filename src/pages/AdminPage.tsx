import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type {
  AiStatusResponse,
  ReportResponse,
  SystemLogResponse,
  UsersRequested,
  UsersResponse,
} from '../types';
import { generateAnonName } from '../utils/generateAnonName';

type Tab = 'overview' | 'pending' | 'reports' | 'logs' | 'ai' | 'users' | 'profile';

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  RESOLVED:  'text-green-400 bg-green-500/10 border-green-500/30',
  DISMISSED: 'text-gray-700  bg-gray-500/10  border-gray-300',
  REJECTED:  'text-red-400   bg-red-500/10   border-red-500/30',
};

const LOG_LEVEL_COLOR: Record<string, string> = {
  ERROR:    'text-red-400 bg-red-500/10 border-red-500/30',
  CRITICAL: 'text-red-500 bg-red-600/15 border-red-500/50',
  WARN:     'text-amber-400 bg-amber-500/10 border-amber-500/30',
  INFO:     'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const anonName = user ? generateAnonName(user.id) : '';

  const [tab, setTab] = useState<Tab>('overview');

  // Data
  const [users, setUsers]                   = useState<UsersResponse[]>([]);
  const [reports, setReports]               = useState<ReportResponse[]>([]);
  const [pendingReports, setPendingReports] = useState<ReportResponse[]>([]);
  const [logs, setLogs]                     = useState<SystemLogResponse[]>([]);
  const [aiStatus, setAiStatus]             = useState<AiStatusResponse | null>(null);

  // Loading states
  const [usersLoading, setUsersLoading]     = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [logsLoading, setLogsLoading]       = useState(false);
  const [aiLoading, setAiLoading]           = useState(false);
  const [testingAi, setTestingAi]           = useState(false);
  const [testAiMsg, setTestAiMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [resolving, setResolving]           = useState<string | null>(null);
  const [clearingLogs, setClearingLogs]     = useState(false);

  // Logs filters and expand
  const [logSearch, setLogSearch]           = useState('');
  const [logFilter, setLogFilter]           = useState<'ALL' | '5XX' | '422' | '503' | '4XX' | 'CLIENT'>('ALL');
  const [expandedLogId, setExpandedLogId]   = useState<string | null>(null);

  // Create admin form
  const [newAdmin, setNewAdmin]             = useState<UsersRequested>({ name: '', password: '' });
  const [adminMsg, setAdminMsg]             = useState('');

  // Profile form
  const [profileName, setProfileName]       = useState(user?.username ?? '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileMsg, setProfileMsg]         = useState('');

  // User moderation
  const [userSearch, setUserSearch]           = useState('');
  const [userFilter, setUserFilter]           = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');
  const [userActionMsg, setUserActionMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // ── Loaders ────────────────────────────────────────────────────────────────
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

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await adminApi.getLogs();
      setLogs(res);
    } catch { /* ignore */ }
    finally { setLogsLoading(false); }
  }, []);

  const loadAiStatus = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await adminApi.getAiStatus();
      setAiStatus(res);
    } catch { /* ignore */ }
    finally { setAiLoading(false); }
  }, []);

  // Initial load
  useEffect(() => {
    loadReports();
    loadUsers();
    loadLogs();
    loadAiStatus();
  }, [loadReports, loadUsers, loadLogs, loadAiStatus]);

  // Tab switch reload
  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'reports' || tab === 'pending' || tab === 'overview') loadReports();
    if (tab === 'logs' || tab === 'overview') loadLogs();
    if (tab === 'ai' || tab === 'overview') loadAiStatus();
  }, [tab, loadUsers, loadReports, loadLogs, loadAiStatus]);

  // ── Actions ────────────────────────────────────────────────────────────────
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

  async function handleClearLogs() {
    if (!confirm('Are you sure you want to clear all error logs?')) return;
    setClearingLogs(true);
    try {
      await adminApi.clearLogs();
      setLogs([]);
    } catch { /* ignore */ }
    finally { setClearingLogs(false); }
  }

  async function handleTestAi() {
    setTestingAi(true);
    setTestAiMsg(null);
    try {
      const res = await adminApi.testAiConnection();
      setAiStatus(res);
      if (res.status === 'HEALTHY') {
        setTestAiMsg({
          type: 'ok',
          text: `AI Connection Healthy! Ping response: ${res.latencyMs ?? 0}ms (${res.provider} / ${res.model})`,
        });
      } else {
        setTestAiMsg({
          type: 'err',
          text: `AI Test Failed (${res.status}): ${res.lastError ?? res.message}`,
        });
      }
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { message?: string } } };
      setTestAiMsg({
        type: 'err',
        text: err.response?.data?.message || err.message || 'AI connection ping failed',
      });
    } finally {
      setTestingAi(false);
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

  // ── User Moderation Handlers ───────────────────────────────────────────────
  async function handleUnbanUser(userId: string) {
    setActionLoadingId(userId);
    setUserActionMsg(null);
    try {
      const updated = await adminApi.unbanUser(userId, 100);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setUserActionMsg({
        type: 'ok',
        text: `User @${updated.name} successfully unbanned! 100 points restored.`,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setUserActionMsg({
        type: 'err',
        text: err?.response?.data?.msg ?? 'Failed to unban user.',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleBanUser(userId: string) {
    const reason = prompt('Reason for suspension:', 'Violation of community safety guidelines');
    if (!reason) return;
    setActionLoadingId(userId);
    setUserActionMsg(null);
    try {
      const updated = await adminApi.banUser(userId, reason);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setUserActionMsg({
        type: 'ok',
        text: `User @${updated.name} has been suspended.`,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setUserActionMsg({
        type: 'err',
        text: err?.response?.data?.msg ?? 'Failed to ban user.',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleAdjustPoints(userId: string, currentPoints: number) {
    const input = prompt(`Enter new reputation points for this user:`, String(currentPoints));
    if (input === null) return;
    const pts = parseInt(input, 10);
    if (isNaN(pts)) {
      alert('Please enter a valid numeric value.');
      return;
    }
    setActionLoadingId(userId);
    setUserActionMsg(null);
    try {
      const updated = await adminApi.adjustUserPoints(userId, pts);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setUserActionMsg({
        type: 'ok',
        text: `User @${updated.name} points updated to ${pts} pts.`,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setUserActionMsg({
        type: 'err',
        text: err?.response?.data?.msg ?? 'Failed to update user points.',
      });
    } finally {
      setActionLoadingId(null);
    }
  }

  // ── Filtered Logs ──────────────────────────────────────────────────────────
  const filteredLogs = logs.filter((log) => {
    // Search query match
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const match =
        log.message.toLowerCase().includes(q) ||
        log.endpoint.toLowerCase().includes(q) ||
        (log.userAlias && log.userAlias.toLowerCase().includes(q)) ||
        (log.userId && log.userId.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category filter
    if (logFilter === '5XX') return log.statusCode && log.statusCode >= 500 && log.statusCode !== 503;
    if (logFilter === '503') return log.statusCode === 503;
    if (logFilter === '422') return log.statusCode === 422;
    if (logFilter === '4XX') return log.statusCode && log.statusCode >= 400 && log.statusCode < 500 && log.statusCode !== 422;
    if (logFilter === 'CLIENT') return log.source === 'CLIENT';
    return true;
  });

  const errorCount = logs.filter((l) => l.level === 'ERROR' || (l.statusCode && l.statusCode >= 500)).length;
  const isAiDown = aiStatus && (aiStatus.status === 'OFFLINE' || aiStatus.status === 'DEGRADED');
  const bannedCount = users.filter((u) => u.banned).length;

  const filteredUsers = users.filter((u) => {
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.banReason && u.banReason.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (userFilter === 'ACTIVE') return !u.banned;
    if (userFilter === 'BANNED') return !!u.banned;
    return true;
  });

  // ── Sidebar nav config ──────────────────────────────────────────────────────
  const navItems: { key: Tab; label: string; icon: React.ReactNode; badge?: number; alertDot?: boolean }[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      key: 'logs',
      label: 'Error Logs',
      badge: errorCount > 0 ? errorCount : undefined,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      key: 'ai',
      label: 'AI Diagnostics',
      alertDot: isAiDown ?? false,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'pending',
      label: 'Pending',
      badge: pendingReports.length || undefined,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      key: 'reports',
      label: 'All Reports',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'users',
      label: 'Users & Bans',
      badge: bannedCount > 0 ? bannedCount : undefined,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
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
      <aside className="hidden w-60 flex-col border-r border-vw-border bg-vw-surface lg:flex">
        {/* Sidebar header */}
        <div className="border-b border-vw-border px-5 py-5">
          <p className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-base font-extrabold text-transparent">
            VibeWall
          </p>
          <span className="mt-1 inline-block rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-red-400">
            Admin Panel
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
                  ? 'bg-violet-600/20 text-violet-300 font-medium'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-800'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.alertDot && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="AI Service Degraded/Offline" />
              )}
              {item.badge ? (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* AI Quick Indicator in Sidebar */}
        <div className="mx-3 mb-3 rounded-xl border border-vw-border bg-vw-card/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">AI Service</span>
            <span
              className={`h-2 w-2 rounded-full ${
                aiStatus?.status === 'HEALTHY'
                  ? 'bg-green-500'
                  : aiStatus?.status === 'DEGRADED' || aiStatus?.status === 'OFFLINE'
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gray-400'
              }`}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-gray-800 truncate">
            {aiStatus?.status ?? 'CHECKING…'}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {aiStatus?.provider ?? 'Provider unavailable'}
          </p>
        </div>

        {/* Admin identity */}
        <div className="border-t border-vw-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
              {anonName[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-violet-400">{anonName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
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
            <h1 className="text-lg font-bold text-gray-900">
              {navItems.find((n) => n.key === tab)?.label ?? 'Admin Panel'}
            </h1>
            <p className="text-xs text-gray-500">VibeWall system management and diagnostics</p>
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
                    tab === item.key ? 'bg-violet-600/20 text-violet-400' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {item.icon}
                  {item.badge ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                  {item.alertDot && !item.badge && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">

          {/* ── Overview ─────────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="space-y-6">

              {/* AI Health Banner in Overview */}
              <div
                className={`rounded-2xl border p-5 transition ${
                  aiStatus?.status === 'HEALTHY'
                    ? 'border-green-500/20 bg-green-500/5'
                    : aiStatus?.status === 'DEGRADED' || aiStatus?.status === 'OFFLINE'
                    ? 'border-red-500/30 bg-red-500/10'
                    : 'border-vw-border bg-vw-card'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${
                        aiStatus?.status === 'HEALTHY'
                          ? 'border-green-500/30 bg-green-500/10 text-green-400'
                          : aiStatus?.status === 'DEGRADED' || aiStatus?.status === 'OFFLINE'
                          ? 'border-red-500/30 bg-red-500/20 text-red-400'
                          : 'border-vw-border bg-vw-surface text-gray-500'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-gray-900">
                          AI Engine Status:{' '}
                          <span
                            className={
                              aiStatus?.status === 'HEALTHY'
                                ? 'text-green-500'
                                : aiStatus?.status === 'DEGRADED' || aiStatus?.status === 'OFFLINE'
                                ? 'text-red-500'
                                : 'text-gray-500'
                            }
                          >
                            {aiStatus?.status ?? 'Connecting…'}
                          </span>
                        </h2>
                        {aiStatus?.activeFallback && (
                          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.2 text-[10px] font-semibold text-amber-400">
                            Fallback Active
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Provider: <strong className="text-gray-700">{aiStatus?.provider || 'Unknown'}</strong>
                        {aiStatus?.model && <span> ({aiStatus.model})</span>}
                        {aiStatus?.latencyMs != null && (
                          <span className="ml-2 font-mono text-[11px] text-violet-400">
                            ⚡ {aiStatus.latencyMs}ms
                          </span>
                        )}
                      </p>
                      {aiStatus?.lastError && (
                        <p className="mt-1 text-xs text-red-400 font-mono line-clamp-1">
                          ⚠️ {aiStatus.lastError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={handleTestAi}
                      disabled={testingAi}
                      className="rounded-lg border border-vw-border bg-vw-surface px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:border-violet-500 hover:text-violet-400 disabled:opacity-50"
                    >
                      {testingAi ? 'Testing…' : 'Ping Test'}
                    </button>
                    <button
                      onClick={() => setTab('ai')}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700"
                    >
                      Diagnostics →
                    </button>
                  </div>
                </div>

                {testAiMsg && (
                  <div
                    className={`mt-3 rounded-lg px-3 py-2 text-xs font-mono ${
                      testAiMsg.type === 'ok'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {testAiMsg.text}
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <StatCard
                  label="Recent Error Logs"
                  value={logsLoading ? '…' : String(logs.length)}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  color="red"
                  highlight={errorCount > 0}
                />
              </div>

              {/* Quick view of Recent User Errors */}
              <div className="rounded-2xl border border-vw-border bg-vw-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      Live Error Feed ({logs.length} logged)
                    </h2>
                    <p className="text-xs text-gray-500">
                      Recent exceptions encountered by users while browsing or posting
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('logs')}
                    className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                  >
                    View all logs →
                  </button>
                </div>

                {logsLoading ? (
                  <LoadingSpinner />
                ) : logs.length === 0 ? (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-6 py-6 text-center">
                    <p className="text-sm font-medium text-green-400">Zero System Errors</p>
                    <p className="mt-1 text-xs text-gray-500">No runtime errors or client exceptions reported.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {logs.slice(0, 3).map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col gap-2 rounded-xl border border-vw-border bg-vw-surface p-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-mono font-bold ${
                                log.statusCode && log.statusCode >= 500
                                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {log.statusCode ?? log.level}
                            </span>
                            <span className="truncate font-mono text-xs font-semibold text-gray-700">
                              {log.endpoint}
                            </span>
                            {log.userAlias && (
                              <span className="hidden rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-400 sm:inline-block">
                                @{log.userAlias}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-900 line-clamp-1">{log.message}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-gray-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
            </div>
          )}

          {/* ── System & User Error Logs ─────────────────────────────────────── */}
          {tab === 'logs' && (
            <div className="space-y-6">
              {/* Header and Controls */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">System & User Error Logs</h2>
                  <p className="text-xs text-gray-500">
                    Live capture of backend exceptions, AI failures, and client-side runtime errors
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadLogs}
                    className="flex items-center gap-1.5 rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-violet-500 hover:text-violet-400"
                  >
                    <svg className={`h-3.5 w-3.5 ${logsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                  <button
                    onClick={handleClearLogs}
                    disabled={clearingLogs || logs.length === 0}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                  >
                    Clear Logs
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search by endpoint, error message, user alias..."
                    className="w-full rounded-xl border border-vw-border bg-vw-card px-4 py-2.5 text-xs text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                  {logSearch && (
                    <button
                      onClick={() => setLogSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-gray-800"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { key: 'ALL', label: `All (${logs.length})` },
                      { key: '5XX', label: '500 Server' },
                      { key: '503', label: '503 AI Outage' },
                      { key: '422', label: '422 Moderation' },
                      { key: '4XX', label: '400 Client' },
                      { key: 'CLIENT', label: 'Frontend Only' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setLogFilter(f.key)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        logFilter === f.key
                          ? 'bg-violet-600 text-white'
                          : 'border border-vw-border bg-vw-card text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logs List */}
              {logsLoading ? (
                <LoadingSpinner />
              ) : filteredLogs.length === 0 ? (
                <div className="rounded-2xl border border-vw-border bg-vw-card p-12 text-center text-gray-500">
                  <svg className="mx-auto mb-3 h-10 w-10 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-700">No error logs match your filter</p>
                  <p className="mt-1 text-xs text-gray-500">All user requests are completing successfully.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const levelClass = LOG_LEVEL_COLOR[log.level] ?? 'text-gray-500 bg-gray-500/10 border-gray-400';
                    const is5xx = log.statusCode && log.statusCode >= 500;

                    return (
                      <div
                        key={log.id}
                        className={`rounded-xl border bg-vw-card transition ${
                          is5xx ? 'border-red-500/30' : 'border-vw-border'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-md border px-2 py-0.5 text-xs font-mono font-bold ${levelClass}`}>
                                {log.statusCode ? `HTTP ${log.statusCode}` : log.level}
                              </span>
                              <span className="rounded-md border border-vw-border bg-vw-surface px-2 py-0.5 font-mono text-xs font-semibold text-violet-400">
                                {log.source}
                              </span>
                              <span className="font-mono text-xs font-bold text-gray-900">
                                {log.endpoint}
                              </span>
                            </div>

                            <span className="text-xs text-gray-500 font-mono">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 break-words">
                                {log.message}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span>
                                  User:{' '}
                                  <strong className="text-violet-400 font-mono">
                                    {log.userAlias ? `@${log.userAlias}` : 'Guest / System'}
                                  </strong>
                                </span>
                                {log.userId && (
                                  <span className="font-mono text-[11px] text-gray-400">
                                    (ID: {log.userId.slice(0, 10)}…)
                                  </span>
                                )}
                              </div>
                            </div>

                            {log.details && (
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="shrink-0 rounded-lg border border-vw-border bg-vw-surface px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:border-violet-500 hover:text-violet-400"
                              >
                                {isExpanded ? 'Hide Details' : 'View Trace'}
                              </button>
                            )}
                          </div>

                          {/* Accordion Details */}
                          {isExpanded && log.details && (
                            <div className="mt-4 rounded-lg border border-vw-border bg-vw-surface p-3 font-mono text-xs text-gray-800">
                              <div className="mb-2 flex items-center justify-between text-[11px] text-gray-500 border-b border-vw-border pb-1">
                                <span>Diagnostics & Stack Info</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(log.details ?? '')}
                                  className="text-violet-400 hover:underline"
                                >
                                  Copy Trace
                                </button>
                              </div>
                              <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed">
                                {log.details}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── AI System Diagnostics ────────────────────────────────────────── */}
          {tab === 'ai' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">AI Health & Diagnostics</h2>
                  <p className="text-xs text-gray-500">
                    Live telemetry for the VibeWall AI moderation, sentiment, and summarization pipelines
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAiStatus}
                    className="flex items-center gap-1.5 rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-violet-500 hover:text-violet-400"
                  >
                    <svg className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                  <button
                    onClick={handleTestAi}
                    disabled={testingAi}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    {testingAi ? 'Pinging Provider…' : 'Run Ping Test'}
                  </button>
                </div>
              </div>

              {testAiMsg && (
                <div
                  className={`rounded-xl p-4 text-xs font-mono border ${
                    testAiMsg.type === 'ok'
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}
                >
                  <p className="font-bold">{testAiMsg.type === 'ok' ? '✓ Ping Test Passed' : '✗ Ping Test Failed'}</p>
                  <p className="mt-1">{testAiMsg.text}</p>
                </div>
              )}

              {/* Status Overview Card */}
              <div className="rounded-2xl border border-vw-border bg-vw-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-vw-border pb-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        aiStatus?.status === 'HEALTHY'
                          ? 'bg-green-500'
                          : aiStatus?.status === 'DEGRADED' || aiStatus?.status === 'OFFLINE'
                          ? 'bg-red-500 animate-ping'
                          : 'bg-gray-400'
                      }`}
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Status:{' '}
                        <span
                          className={
                            aiStatus?.status === 'HEALTHY'
                              ? 'text-green-500'
                              : aiStatus?.status === 'DEGRADED' || aiStatus?.status === 'OFFLINE'
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }
                        >
                          {aiStatus?.status ?? 'UNKNOWN'}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">{aiStatus?.message}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        aiStatus?.activeFallback
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-green-500/30 bg-green-500/10 text-green-400'
                      }`}
                    >
                      {aiStatus?.activeFallback ? '⚠️ Fallback Heuristics Engaged' : '✓ Full Model Active'}
                    </span>
                  </div>
                </div>

                {/* Grid of properties */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-vw-border bg-vw-surface p-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Provider</p>
                    <p className="mt-1 text-sm font-bold text-gray-900">{aiStatus?.provider || 'Not configured'}</p>
                  </div>
                  <div className="rounded-xl border border-vw-border bg-vw-surface p-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Model</p>
                    <p className="mt-1 text-sm font-bold text-gray-900 truncate">{aiStatus?.model || 'None'}</p>
                  </div>
                  <div className="rounded-xl border border-vw-border bg-vw-surface p-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Last Latency</p>
                    <p className="mt-1 text-sm font-mono font-bold text-violet-400">
                      {aiStatus?.latencyMs != null ? `${aiStatus.latencyMs} ms` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-vw-border bg-vw-surface p-4 sm:col-span-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Endpoint</p>
                    <p className="mt-1 text-xs font-mono text-gray-700 truncate">{aiStatus?.endpoint || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-vw-border bg-vw-surface p-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Last Health Check</p>
                    <p className="mt-1 text-xs font-mono text-gray-700">
                      {aiStatus?.lastChecked ? new Date(aiStatus.lastChecked).toLocaleTimeString() : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Error diagnostics section */}
                {aiStatus?.lastError && (
                  <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Last Reported AI Error</p>
                    <p className="mt-1 font-mono text-xs text-red-300 break-words">{aiStatus.lastError}</p>
                  </div>
                )}
              </div>

              {/* AI Features Health Card */}
              <div className="rounded-2xl border border-vw-border bg-vw-card p-6">
                <h3 className="text-sm font-bold text-gray-900">AI Service Capabilities</h3>
                <p className="text-xs text-gray-500">Feature degradation matrix and fallback coverage</p>

                <div className="mt-4 divide-y divide-vw-border">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Content Moderation</p>
                      <p className="text-[11px] text-gray-500">Automated toxic content and NSFW filter</p>
                    </div>
                    <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                      {aiStatus?.status === 'HEALTHY' ? 'Live LLM Active' : 'Fallback Heuristics'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Sentiment & Vibe Detection</p>
                      <p className="text-[11px] text-gray-500">Extracts emotional tone from confessions</p>
                    </div>
                    <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                      {aiStatus?.status === 'HEALTHY' ? 'Live LLM Active' : 'Fallback Heuristics'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">AI Weekly Summaries</p>
                      <p className="text-[11px] text-gray-500">Synthesizes confession trends across campus</p>
                    </div>
                    <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                      {aiStatus?.status === 'HEALTHY' ? 'Live LLM Active' : 'Fallback Heuristics'}
                    </span>
                  </div>
                </div>
              </div>
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
                <h3 className="mb-1 text-sm font-semibold text-gray-800">Create Admin Account</h3>
                <p className="mb-4 text-xs text-gray-500">New admin accounts have full panel access.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-700">Username</label>
                    <input
                      type="text"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
                      placeholder="admin_username"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-700">Password</label>
                    <input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                      className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
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

              {/* Moderation Alert Banner */}
              {userActionMsg && (
                <div
                  className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between transition-all ${
                    userActionMsg.type === 'ok'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/30 bg-red-500/10 text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{userActionMsg.type === 'ok' ? '✓' : '⚠️'}</span>
                    <span>{userActionMsg.text}</span>
                  </div>
                  <button
                    onClick={() => setUserActionMsg(null)}
                    className="text-gray-400 hover:text-gray-200 text-xs ml-4"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Users Moderation & Points Table */}
              <div className="rounded-2xl border border-vw-border bg-vw-card overflow-hidden">
                <div className="border-b border-vw-border px-5 py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">User Moderation & Reputation</h3>
                      <p className="text-xs text-gray-500">
                        {users.length} registered • {bannedCount} suspended (auto-banned when points &lt; 0)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={loadUsers}
                        className="flex items-center gap-1.5 rounded-lg border border-vw-border bg-vw-surface px-3 py-1.5 text-xs text-gray-600 transition hover:border-violet-500 hover:text-violet-400"
                      >
                        <svg className={`h-3.5 w-3.5 ${usersLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Search and Filter Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, ID, or ban reason…"
                        className="w-full rounded-lg border border-vw-border bg-vw-surface pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:border-violet-500 focus:outline-none"
                      />
                      <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-1 self-start sm:self-auto">
                      <button
                        onClick={() => setUserFilter('ALL')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          userFilter === 'ALL'
                            ? 'bg-violet-600 text-white'
                            : 'border border-vw-border bg-vw-surface text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        All ({users.length})
                      </button>
                      <button
                        onClick={() => setUserFilter('ACTIVE')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          userFilter === 'ACTIVE'
                            ? 'bg-emerald-600 text-white'
                            : 'border border-vw-border bg-vw-surface text-gray-600 hover:text-emerald-500'
                        }`}
                      >
                        Active ({users.filter((u) => !u.banned).length})
                      </button>
                      <button
                        onClick={() => setUserFilter('BANNED')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          userFilter === 'BANNED'
                            ? 'bg-red-600 text-white'
                            : 'border border-vw-border bg-vw-surface text-gray-600 hover:text-red-500'
                        }`}
                      >
                        Banned ({bannedCount})
                      </button>
                    </div>
                  </div>
                </div>

                {usersLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="divide-y divide-vw-border">
                    {filteredUsers.map((u, idx) => {
                      const userPoints = u.points ?? 100;
                      const isBanned = !!u.banned;
                      const isPendingAction = actionLoadingId === u.id;

                      return (
                        <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-vw-surface/40 transition">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-900/30 text-xs font-bold text-violet-400">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm text-gray-900 truncate">@{u.name}</p>
                                <span className="text-[11px] text-gray-400 font-mono">({generateAnonName(u.id)})</span>
                                {u.role === 'ADMIN' && (
                                  <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-bold text-amber-500">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-gray-400 font-mono">{u.id}</p>
                              {isBanned && (
                                <p className="mt-0.5 text-xs text-red-500 font-medium flex items-center gap-1">
                                  <span>🚫 Suspended:</span>
                                  <span>{u.banReason || 'Negative points threshold violation'}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                            {/* Points badge */}
                            <div
                              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                                userPoints < 0
                                  ? 'border-red-500/30 bg-red-500/10 text-red-500'
                                  : userPoints < 50
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                              }`}
                              title={`Reputation score: ${userPoints} points`}
                            >
                              ✨ {userPoints} pts
                            </div>

                            {/* Status badge */}
                            {isBanned ? (
                              <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-500">
                                BANNED
                              </span>
                            ) : (
                              <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-500">
                                ACTIVE
                              </span>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              {isBanned ? (
                                <button
                                  onClick={() => handleUnbanUser(u.id)}
                                  disabled={isPendingAction}
                                  className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs font-semibold shadow-xs transition disabled:opacity-50"
                                  title="Unban user and restore 100 points"
                                >
                                  {isPendingAction ? 'Restoring…' : '🔓 Unban User'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanUser(u.id)}
                                  disabled={isPendingAction}
                                  className="rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 px-2.5 py-1 text-xs font-medium transition disabled:opacity-50"
                                >
                                  {isPendingAction ? '…' : 'Suspend'}
                                </button>
                              )}

                              <button
                                onClick={() => handleAdjustPoints(u.id, userPoints)}
                                disabled={isPendingAction}
                                className="rounded-lg border border-vw-border bg-vw-surface hover:border-violet-500 hover:text-violet-500 px-2 py-1 text-xs text-gray-700 transition disabled:opacity-50"
                                title="Adjust points manually"
                              >
                                Points ✎
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <p className="px-5 py-8 text-center text-sm text-gray-500">No users match your criteria.</p>
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
                    {anonName[0] || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{anonName}</p>
                    <p className="text-xs text-red-400">Administrator</p>
                  </div>
                </div>

                <h3 className="mb-4 text-sm font-semibold text-gray-800">Update Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-gray-900 placeholder-gray-600 focus:border-violet-500 focus:outline-none"
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
  color: 'violet' | 'blue' | 'amber' | 'red';
  highlight?: boolean;
}

function StatCard({ label, value, icon, color, highlight }: StatCardProps) {
  const palette = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    blue:   'text-blue-400   bg-blue-500/10   border-blue-500/20',
    amber:  'text-amber-400  bg-amber-500/10  border-amber-500/20',
    red:    'text-red-400    bg-red-500/10    border-red-500/20',
  };
  return (
    <div className={`rounded-2xl border bg-vw-card p-5 ${highlight ? 'border-red-500/40 ring-1 ring-red-500/20' : 'border-vw-border'}`}>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${palette[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
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
  const color = STATUS_COLOR[report.status] ?? 'text-gray-700 bg-gray-500/10 border-gray-300';

  return (
    <div className="rounded-xl border border-vw-border bg-vw-card p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="text-sm leading-relaxed text-gray-800">{report.reportContent}</p>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
          {report.status}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-vw-border pt-3">
        <div className="text-xs text-gray-500">
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
              className="rounded-lg border border-vw-border bg-vw-surface px-2 py-1.5 text-xs text-gray-800 focus:outline-none"
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
