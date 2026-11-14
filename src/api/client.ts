import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { TokenResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v3';

export const JWT_KEY = 'vw_jwt';
export const REFRESH_KEY = 'vw_refresh';

export const api = axios.create({ baseURL: BASE_URL });

// ─── Queue while refreshing ───────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

// ─── Request interceptor – attach JWT ────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(JWT_KEY);
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor – refresh on 401 ───────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(REFRESH_KEY);

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<TokenResponse>(
          `${BASE_URL}/auth/refresh`,
          { token: refreshToken }
        );
        localStorage.setItem(JWT_KEY, data.jwt);
        localStorage.setItem(REFRESH_KEY, data.refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.jwt}`;
        processQueue(null, data.jwt);
        originalRequest.headers['Authorization'] = `Bearer ${data.jwt}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Report critical client/network errors to Admin dashboard (fire-and-forget)
    if (!originalRequest?.url?.includes('/admin/logs')) {
      const isServerError = error.response && error.response.status >= 500;
      const isNetworkError = !error.response && error.code !== 'ERR_CANCELED';
      if (isServerError || isNetworkError) {
        axios.post(`${BASE_URL}/admin/logs/client`, {
          endpoint: originalRequest?.url || window.location.pathname,
          statusCode: error.response?.status,
          message: error.message || (isNetworkError ? 'Network failure: unable to connect to server' : 'Internal server error'),
          details: JSON.stringify({
            statusText: error.response?.statusText,
            method: originalRequest?.method,
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {});
      }
    }

    return Promise.reject(error);
  }
);

export function clearTokens() {
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
