import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth';
import { JWT_KEY, REFRESH_KEY, clearTokens, decodeJWT } from '../api/client';
import type { AuthUser, UsersRequested } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (data: UsersRequested) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: UsersRequested) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromJWT(token: string): AuthUser | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  return {
    id: payload.id as string,
    username: (payload.name ?? payload.username ?? payload.sub) as string,
    role: payload.role as 'USER' | 'ADMIN',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(JWT_KEY);
    if (token) {
      const decoded = userFromJWT(token);
      if (decoded) {
        const nowSec = Date.now() / 1000;
        const payload = decodeJWT(token);
        if (payload && payload.exp > nowSec) {
          setUser(decoded);
        } else {
          // JWT expired – attempt refresh immediately
          const refresh = localStorage.getItem(REFRESH_KEY);
          if (refresh) {
            authApi
              .refresh(refresh)
              .then(({ jwt, refresh: newRefresh }) => {
                localStorage.setItem(JWT_KEY, jwt);
                localStorage.setItem(REFRESH_KEY, newRefresh);
                setUser(userFromJWT(jwt));
              })
              .catch(() => clearTokens())
              .finally(() => setIsLoading(false));
            return;
          }
          clearTokens();
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: UsersRequested) => {
    const { jwt, refresh } = await authApi.login(data);
    localStorage.setItem(JWT_KEY, jwt);
    localStorage.setItem(REFRESH_KEY, refresh);
    setUser(userFromJWT(jwt));
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const { jwt, refresh } = await authApi.loginWithGoogle(idToken);
    localStorage.setItem(JWT_KEY, jwt);
    localStorage.setItem(REFRESH_KEY, refresh);
    setUser(userFromJWT(jwt));
  }, []);

  const register = useCallback(async (data: UsersRequested) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed even if server-side logout fails
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, loginWithGoogle, register, logout }),
    [user, isLoading, login, loginWithGoogle, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
