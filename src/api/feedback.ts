import { api } from './client';
import type { FeedbackRequested, ConfessionResponse } from '../types';

export const feedbackApi = {
  add: (confessionId: string, data: FeedbackRequested) =>
    api.post<ConfessionResponse>(`/users/feedback/${confessionId}`, data).then((r) => r.data),

  update: (confessionId: string, feedbackId: number, data: FeedbackRequested) =>
    api
      .put<ConfessionResponse>(`/users/feedback/${confessionId}/${feedbackId}`, data)
      .then((r) => r.data),

  delete: (confessionId: string, feedbackId: number) =>
    api.delete<void>(`/users/feedback/${confessionId}/${feedbackId}`).then((r) => r.data),
};
