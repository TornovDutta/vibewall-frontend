import { api } from './client';
import type {
  AiStatusResponse,
  ClientErrorRequest,
  ReportResponse,
  SystemLogResponse,
  UsersRequested,
  UsersResponse,
} from '../types';

export const adminApi = {
  // Users & Moderation
  getAllUsers: () =>
    api.get<UsersResponse[]>('/admin').then((r) => r.data),

  unbanUser: (userId: string, restorePoints: number = 100) =>
    api
      .post<UsersResponse>(`/admin/users/${userId}/unban`, null, {
        params: { restorePoints },
      })
      .then((r) => r.data),

  banUser: (userId: string, reason: string = 'Banned by administrator') =>
    api
      .post<UsersResponse>(`/admin/users/${userId}/ban`, null, {
        params: { reason },
      })
      .then((r) => r.data),

  adjustUserPoints: (userId: string, points: number) =>
    api
      .put<UsersResponse>(`/admin/users/${userId}/points`, null, {
        params: { points },
      })
      .then((r) => r.data),

  createAdmin: (data: UsersRequested) =>
    api.post<UsersResponse>('/admin', data).then((r) => r.data),

  updateAdminProfile: (data: UsersRequested) =>
    api.put<UsersResponse>('/admin/me', data).then((r) => r.data),

  deleteAdminAccount: () =>
    api.delete<void>('/admin/me').then((r) => r.data),

  // Reports
  getAllReports: () =>
    api.get<ReportResponse[]>('/admin/report').then((r) => r.data),

  getReportById: (id: string) =>
    api.get<ReportResponse>(`/admin/report/${id}`).then((r) => r.data),

  getPendingReports: () =>
    api.get<ReportResponse[]>('/admin/report/pending').then((r) => r.data),

  getPendingReportById: (id: string) =>
    api.get<ReportResponse>(`/admin/report/pending/${id}`).then((r) => r.data),

  resolveReport: (id: string, status: string) =>
    api
      .patch<ReportResponse>(`/admin/report/Reviewed/${id}`, null, { params: { status } })
      .then((r) => r.data),

  // System Error Logs
  getLogs: () =>
    api.get<SystemLogResponse[]>('/admin/logs').then((r) => r.data),

  clearLogs: () =>
    api.delete<void>('/admin/logs').then((r) => r.data),

  logClientError: (data: ClientErrorRequest) =>
    api.post<void>('/admin/logs/client', data).then((r) => r.data),

  // AI Health & Diagnostics
  getAiStatus: () =>
    api.get<AiStatusResponse>('/admin/ai-status').then((r) => r.data),

  testAiConnection: () =>
    api.post<AiStatusResponse>('/admin/ai-test').then((r) => r.data),
};
