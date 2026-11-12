import { api } from './client';
import type { NotificationResponse } from '../types';

export const notificationsApi = {
  async getNotifications(): Promise<NotificationResponse[]> {
    const res = await api.get<NotificationResponse[]>('/users/notifications');
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ unreadCount: number }>('/users/notifications/unread-count');
    return res.data.unreadCount;
  },

  async markAsRead(id: string): Promise<NotificationResponse> {
    const res = await api.patch<NotificationResponse>(`/users/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/users/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/users/notifications/${id}`);
  },

  async clearAll(): Promise<void> {
    await api.delete('/users/notifications');
  },
};
