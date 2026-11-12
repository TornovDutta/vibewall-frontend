export const NOTIFICATIONS_REFRESH_EVENT = 'vw_notifications_refresh';

export function triggerNotificationRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT));
  }
}
