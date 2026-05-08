import { api } from './client';
import type { ReportRequested, ReportResponse } from '../types';

export const reportsApi = {
  list: () =>
    api.get<ReportResponse[]>('/users/report/').then((r) => r.data),

  submit: (data: ReportRequested) =>
    api.post<ReportResponse>('/users/report/', data).then((r) => r.data),

  update: (reportId: string, data: ReportRequested) =>
    api.put<ReportResponse>(`/users/report/${reportId}`, data).then((r) => r.data),

  delete: (reportId: string) =>
    api.delete<void>(`/users/report/${reportId}`).then((r) => r.data),
};
