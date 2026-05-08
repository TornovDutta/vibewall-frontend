import { api } from './client';
import type { ConfessionRequested, ConfessionResponse } from '../types';

export const confessionsApi = {
  create: (data: ConfessionRequested) =>
    api.post<ConfessionResponse>('/users/confession', data).then((r) => r.data),

  update: (id: string, data: ConfessionRequested) =>
    api.put<ConfessionResponse>(`/users/confession/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete<void>(`/users/confession/${id}`).then((r) => r.data),
};
