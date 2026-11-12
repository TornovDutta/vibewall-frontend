import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { NOTIFICATIONS_REFRESH_EVENT } from '../utils/events';
import type { NotificationResponse } from '../types';

function formatTimeAgo(dateString?: string) {
  if (!dateString) return '';
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load count & notifications
  const fetchStatus = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const [count, notifs] = await Promise.allSettled([
        notificationsApi.getUnreadCount(),
        notificationsApi.getNotifications(),
      ]);
      if (count.status === 'fulfilled') setUnreadCount(count.value);
      if (notifs.status === 'fulfilled') setNotifications(notifs.value);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchStatus();

    // Poll every 6 seconds for fresh notifications
    const interval = setInterval(fetchStatus, 6000);

    // Event-driven reactive wakeup on local activity
    const handleRefreshEvent = () => fetchStatus();
    const handleVisibility = () => {
      if (!document.hidden) fetchStatus();
    };

    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
    window.addEventListener('focus', handleRefreshEvent);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
      window.removeEventListener('focus', handleRefreshEvent);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, fetchStatus]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setLoading(true);
      try {
        const notifs = await notificationsApi.getNotifications();
        setNotifications(notifs);
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (n: NotificationResponse) => {
    if (!n.read) {
      try {
        await notificationsApi.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    setIsOpen(false);
    navigate('/');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchStatus();
    } catch {
      // ignore
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'REACTION':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'COMMENT':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        );
      case 'POST_CREATED':
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Trigger Button ── */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        title="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-vw-border bg-vw-surface text-vw-textMuted transition-all duration-200 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-600 dark:hover:border-violet-800/60 dark:hover:bg-violet-950/40 dark:hover:text-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      >
        <svg
          className="h-4.5 w-4.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-extrabold text-white shadow-sm shadow-rose-500/30 ring-2 ring-vw-surface">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Notifications Popover ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-vw-border bg-vw-card shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-vw-border px-4 py-3 bg-vw-surface/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-vw-text">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-medium text-vw-textMuted hover:text-rose-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-vw-border/50">
            {loading ? (
              <div className="p-8 text-center text-xs text-vw-textMuted">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-950/40">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-vw-text">All caught up!</p>
                <p className="mt-1 text-xs text-vw-textMuted">
                  When someone reacts or comments on your confession, you will get notified here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-vw-muted/60 ${
                    !n.read
                      ? 'bg-violet-50/50 dark:bg-violet-950/20'
                      : 'bg-transparent'
                  }`}
                >
                  {/* Type icon */}
                  {getIcon(n.type)}

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-bold text-vw-text">
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-vw-textMuted">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-vw-textMuted line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  {/* Actions & Unread Indicator */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0 self-center">
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, n.id)}
                      title="Delete"
                      className="opacity-0 group-hover:opacity-100 p-1 text-vw-textMuted hover:text-rose-500 transition-opacity"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
