import { api } from './client';
import type { UsersRequested, UsersResponse } from '../types';

export const usersApi = {
  getProfile: () =>
    api.get<UsersResponse>('/users/me').then((r) => r.data),

  updateProfile: (data: UsersRequested) =>
    api.put<UsersResponse>('/users/me', data).then((r) => r.data),

  deleteAccount: () =>
    api.delete<void>('/users/me').then((r) => r.data),
};
