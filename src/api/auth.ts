import { api } from './client';
import type { TokenResponse, UsersRequested, UsersResponse } from '../types';

export const authApi = {
  register: (data: UsersRequested) =>
    api.post<UsersResponse>('/auth/register', data).then((r) => r.data),

  login: (data: UsersRequested) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => r.data),

  refresh: (token: string) =>
    api.post<TokenResponse>('/auth/refresh', { token }).then((r) => r.data),

  logout: () =>
    api.post<void>('/auth/logout').then((r) => r.data),
};
