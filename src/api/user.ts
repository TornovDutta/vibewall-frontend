import { api } from './client';
import type { UsersRequested, UsersResponse } from '../types';

export const userApi = {
  getProfile: () =>
    api.get<UsersResponse>('/users/me').then((r) => r.data),

  updateProfile: (data: UsersRequested) =>
    api.put<UsersResponse>('/users/me', data).then((r) => r.data),

  getUserById: (id: string) =>
    api.get<UsersResponse>(`/users/${id}`).then((r) => r.data),
};
