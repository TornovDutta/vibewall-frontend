import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAnonName } from '../utils/generateAnonName';
import CrisisSupportModal from './CrisisSupportModal';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSupport, setShowSupport] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const anonName = user ? generateAnonName(user.id) : '';
  const firstLetter = anonName ? anonName.charAt(0).toUpperCase() : 'U';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-vw-border bg-vw-surface/85 backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ── Brand Logo & Live Badge (Left) ── */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo size="md" />

            {/* Live Indicator Badge */}
            <span className="hidden items-center gap-1.5 rounded-full border border-violet-200/60 bg-violet-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600 dark:bg-violet-400" />
              Live · 12h
            </span>
          </div>

          {/* ── Main Navigation Links (Center / Desktop) ── */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {/* Feed Link */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                  : 'text-vw-textMuted hover:bg-vw-muted/60 hover:text-vw-text'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Feed</span>
            </Link>

            {/* Polls Link */}
            <Link
              to="/polls"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive('/polls')
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                  : 'text-vw-textMuted hover:bg-vw-muted/60 hover:text-vw-text'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Polls</span>
            </Link>

            {/* Safety & Privacy Link */}
            <Link
              to="/privacy"
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive('/privacy') || isActive('/security')
                  ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                  : 'text-vw-textMuted hover:bg-vw-muted/60 hover:text-vw-text'
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Safety & Privacy</span>
            </Link>

            {/* Helplines Button */}
            <button
              type="button"
              onClick={() => setShowSupport(true)}
              title="Confidential Helplines & Mental Wellness Resources"
              className="flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-100 hover:shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
            >
              <svg
                className="h-3.5 w-3.5 text-rose-500 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span>Helplines</span>
            </button>
          </nav>

          {/* ── User Actions & Controls (Right) ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              /* Authenticated User Navigation */
              <div className="hidden items-center gap-2 md:flex">
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                      : 'text-vw-textMuted hover:bg-vw-muted/60 hover:text-vw-text'
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                {/* Admin Link if Admin */}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40 ${
                      isActive('/admin') ? 'bg-violet-50 dark:bg-violet-950/50' : ''
                    }`}
                  >
                    <span className="text-amber-500">★</span>
                    <span>Admin</span>
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* Anonymous Alias Badge Pill */}
                <div className="flex items-center gap-2 rounded-full border border-vw-border bg-vw-surface px-2.5 py-1 shadow-xs">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-[10px] font-bold text-white">
                    {firstLetter}
                  </div>
                  <span className="text-xs font-semibold text-vw-text">
                    {anonName}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center gap-1.5 rounded-xl border border-vw-border bg-vw-surface px-3 py-1.5 text-xs font-semibold text-vw-textMuted transition-all duration-200 hover:border-rose-300 hover:bg-rose-50/70 hover:text-rose-600 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Guest / Unauthenticated Navigation */
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-vw-textMuted transition-all duration-200 hover:bg-vw-muted/60 hover:text-vw-text"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-violet-500/25 transition-all duration-200 hover:opacity-95 hover:shadow-md hover:shadow-violet-500/35 active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Desktop Theme Switch Toggle */}
            <div className="hidden border-l border-vw-border pl-2.5 sm:flex md:items-center">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Hamburger Button & Utilities */}
            <div className="flex items-center gap-2 md:hidden">
              {user && <NotificationBell />}
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-vw-border bg-vw-surface text-vw-text transition hover:bg-vw-muted/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div className="border-b border-vw-border bg-vw-surface/95 px-4 pt-3 pb-5 backdrop-blur-xl md:hidden animate-slide-up">
            {/* Authenticated user info card in mobile drawer */}
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-vw-border bg-vw-card/80 p-3 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-sm">
                  {firstLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-vw-text">{anonName}</p>
                  <p className="text-[11px] font-semibold text-violet-500">
                    {user.role === 'ADMIN' ? 'Admin • Active' : 'Anonymous Member'}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1.5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                    : 'text-vw-text hover:bg-vw-muted/60'
                }`}
              >
                <svg
                  className="h-5 w-5 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span>Feed</span>
              </Link>

              <Link
                to="/polls"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive('/polls')
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                    : 'text-vw-text hover:bg-vw-muted/60'
                }`}
              >
                <svg
                  className="h-5 w-5 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Polls & Opinions</span>
              </Link>

              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive('/privacy') || isActive('/security')
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                    : 'text-vw-text hover:bg-vw-muted/60'
                }`}
              >
                <svg
                  className="h-5 w-5 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Safety & Privacy</span>
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive('/dashboard')
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                      : 'text-vw-text hover:bg-vw-muted/60'
                  }`}
                >
                  <svg
                    className="h-5 w-5 text-violet-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive('/admin')
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                      : 'text-violet-600 dark:text-violet-400 hover:bg-violet-50/50'
                  }`}
                >
                  <span className="text-amber-500">★</span>
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Mobile Helplines Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSupport(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-3.5 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <svg
                  className="h-5 w-5 text-rose-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span>Confidential Helplines</span>
              </button>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="mt-4 border-t border-vw-border pt-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-vw-border bg-vw-surface py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30 dark:text-rose-400"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Log Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-vw-border bg-vw-surface py-2.5 text-center text-sm font-semibold text-vw-text transition hover:bg-vw-muted"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 py-2.5 text-center text-sm font-bold text-white shadow-sm shadow-violet-500/20 transition hover:opacity-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Helplines Modal */}
      <CrisisSupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </>
  );
}
