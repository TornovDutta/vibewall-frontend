import { useEffect, useRef, useState } from 'react';
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const anonName = user ? generateAnonName(user.id) : '';
  const firstLetter = anonName ? anonName.charAt(0).toUpperCase() : 'U';

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  async function handleLogout() {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Floating Island Navigation Container */}
      <header className="sticky top-0 z-50 w-full px-3 pt-3 pb-1 sm:px-6 transition-all duration-300">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between rounded-2xl border border-vw-border/80 bg-vw-surface/85 px-3.5 sm:px-5 shadow-sm shadow-black/[0.03] backdrop-blur-xl dark:shadow-black/20 transition-all duration-200">
          
          {/* ── Left Zone: Brand Logo & Live Badge ── */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link to="/" className="flex items-center gap-2 focus:outline-none">
              <Logo size="md" />
            </Link>

            {/* Subtle Live Badge */}
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>

          {/* ── Center Zone: Segmented Capsule Navigation (Desktop) ── */}
          <nav className="hidden items-center gap-1 rounded-full border border-vw-border/70 bg-vw-muted/40 p-1 md:flex">
            {/* Feed Tab */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-vw-surface text-violet-600 shadow-xs dark:bg-vw-card dark:text-violet-400'
                  : 'text-vw-textMuted hover:text-vw-text'
              }`}
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Feed</span>
            </Link>

            {/* Polls Tab */}
            <Link
              to="/polls"
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive('/polls')
                  ? 'bg-vw-surface text-violet-600 shadow-xs dark:bg-vw-card dark:text-violet-400'
                  : 'text-vw-textMuted hover:text-vw-text'
              }`}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span>Polls</span>
            </Link>

            {/* Safety Tab */}
            <Link
              to="/privacy"
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive('/privacy') || isActive('/security')
                  ? 'bg-vw-surface text-violet-600 shadow-xs dark:bg-vw-card dark:text-violet-400'
                  : 'text-vw-textMuted hover:text-vw-text'
              }`}
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Safety</span>
            </Link>

            {/* Helplines Pill Button */}
            <button
              type="button"
              onClick={() => setShowSupport(true)}
              title="Crisis Support & Confidential Helplines"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-rose-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
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

          {/* ── Right Zone: Actions & Consolidated Profile Dropdown ── */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle Switch */}
            <div className="hidden sm:flex items-center">
              <ThemeToggle />
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden h-5 w-px bg-vw-border md:block" />

            {/* Authenticated Profile Dropdown (Desktop) */}
            {user ? (
              <div className="relative hidden md:block" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 rounded-full border border-vw-border bg-vw-surface/80 py-1 pl-1.5 pr-2.5 shadow-2xs transition-all duration-200 hover:border-violet-300 hover:bg-vw-muted/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:hover:border-violet-800 ${
                    profileDropdownOpen ? 'border-violet-500 ring-2 ring-violet-500/20' : ''
                  }`}
                >
                  {/* Avatar Circle */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-xs font-bold text-white shadow-xs">
                    {firstLetter}
                  </div>

                  {/* Truncated Alias Name */}
                  <span className="max-w-[110px] truncate text-xs font-semibold text-vw-text">
                    {anonName}
                  </span>

                  {/* Rotating Chevron */}
                  <svg
                    className={`h-3.5 w-3.5 text-vw-textMuted transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180 text-violet-500' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Card */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-vw-border bg-vw-surface/95 p-2 shadow-xl shadow-black/10 backdrop-blur-2xl animate-slide-up z-50 dark:bg-vw-surface/95">
                    {/* User Identity Card Header */}
                    <div className="flex items-center gap-3 rounded-xl bg-vw-muted/50 p-2.5 mb-1.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-sm font-extrabold text-white shadow-xs">
                        {firstLetter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-vw-text">{anonName}</p>
                        <p className="flex items-center gap-1 text-[10px] font-semibold text-violet-500">
                          <span>🔒</span> Anonymous & Encrypted
                        </p>
                      </div>
                      {user.role === 'ADMIN' && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-500 border border-amber-500/20">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Consolidated Menu Items */}
                    <div className="space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          isActive('/dashboard')
                            ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                            : 'text-vw-text hover:bg-vw-muted/60'
                        }`}
                      >
                        <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                        <span>Dashboard</span>
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            isActive('/admin')
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'text-vw-text hover:bg-vw-muted/60'
                          }`}
                        >
                          <span className="text-amber-500">★</span>
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to="/privacy"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-vw-text transition hover:bg-vw-muted/60"
                      >
                        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>Privacy & Safety</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowSupport(true);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-50/70 dark:hover:bg-rose-950/30"
                      >
                        <svg className="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        <span>Crisis Helplines</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="my-1.5 border-t border-vw-border" />

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-rose-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest CTA Buttons (Desktop) */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-vw-textMuted transition hover:text-vw-text hover:bg-vw-muted/40"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs shadow-violet-500/20 transition-all hover:opacity-95 active:scale-95"
                >
                  Join Anonymous
                </Link>
              </div>
            )}

            {/* Mobile Controls (Theme Toggle & Hamburger Menu) */}
            <div className="flex items-center gap-1.5 md:hidden">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-vw-border bg-vw-surface text-vw-text transition hover:bg-vw-muted/60 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-vw-border bg-vw-surface/95 p-3.5 shadow-xl backdrop-blur-2xl md:hidden animate-slide-up">
            {/* User Identity Banner in Mobile */}
            {user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-vw-border bg-vw-muted/40 p-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-xs font-bold text-white shadow-xs">
                  {firstLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-vw-text">{anonName}</p>
                  <p className="text-[10px] font-semibold text-violet-500">
                    {user.role === 'ADMIN' ? 'Admin • Active' : 'Anonymous Member'}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                    : 'text-vw-text hover:bg-vw-muted/60'
                }`}
              >
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Feed</span>
              </Link>

              <Link
                to="/polls"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isActive('/polls')
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                    : 'text-vw-text hover:bg-vw-muted/60'
                }`}
              >
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Polls & Opinions</span>
              </Link>

              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isActive('/privacy') || isActive('/security')
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                    : 'text-vw-text hover:bg-vw-muted/60'
                }`}
              >
                <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Safety & Privacy</span>
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    isActive('/dashboard')
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                      : 'text-vw-text hover:bg-vw-muted/60'
                  }`}
                >
                  <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <span className="text-amber-500">★</span>
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Mobile Helplines Trigger */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSupport(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <svg className="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span>Crisis Helplines</span>
              </button>
            </div>

            {/* Mobile Auth Actions */}
            <div className="mt-3 border-t border-vw-border pt-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-vw-border bg-vw-surface py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/30 dark:text-rose-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-vw-border bg-vw-surface py-2 text-center text-xs font-semibold text-vw-text transition hover:bg-vw-muted"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 text-center text-xs font-bold text-white shadow-xs"
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
