import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateAnonName } from '../utils/generateAnonName';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const anonName = user ? generateAnonName(user.id) : '';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-vw-border bg-vw-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            VibeWall
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            Feed
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-gray-400 transition hover:text-white"
              >
                Dashboard
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="text-sm text-violet-400 transition hover:text-violet-300"
                >
                  Admin
                </Link>
              )}
              <div className="ml-2 flex items-center gap-2">
                <span className="hidden text-xs text-violet-400 sm:block">
                  {anonName}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-vw-border px-3 py-1.5 text-sm text-gray-400 transition hover:border-red-500/50 hover:text-red-400"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-vw-border px-3 py-1.5 text-sm text-gray-400 transition hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
