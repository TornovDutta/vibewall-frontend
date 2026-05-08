import { api } from './client';
import type { ReportResponse, UsersRequested, UsersResponse } from '../types';

export const adminApi = {
  // Users
  getAllUsers: () =>
    api.get<UsersResponse[]>('/admin').then((r) => r.data),

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
};
