import { api } from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'restock' | 'flash_sale' | 'loyalty' | 'abandoned_cart' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: Date | string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const data = await api.get<{ notifications: Notification[] }>('/notifications');
    return data.notifications ?? [];
  } catch {
    return [];
  }
};

export const createNotification = async (payload: {
  title: string;
  message: string;
  type?: Notification['type'];
  link?: string;
  targetUserId?: string;
}): Promise<Notification> => {
  return await api.post<Notification>('/notifications', payload);
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await api.patch(`/notifications/${notificationId}/read`, {});
  } catch {
    // non-critical
  }
};

// Aliases for backward compatibility
export const markNotificationRead = markAsRead;

export const markAllAsRead = async (): Promise<void> => {
  try {
    await api.post('/notifications/read-all', {});
  } catch {
    // non-critical
  }
};

// Alias for backward compatibility
export const markAllNotificationsRead = markAllAsRead;

// Polling-based subscription (replaces Firebase realtime)
export const subscribeToNotifications = (
  callback: (notifs: Notification[]) => void,
  intervalMs = 60_000
): (() => void) => {
  let active = true;
  const fetch = () => {
    getNotifications()
      .then((n) => { if (active) callback(n); })
      .catch(() => {});
  };
  fetch();
  const timer = setInterval(fetch, intervalMs);
  return () => { active = false; clearInterval(timer); };
};

// Alias for backward compatibility
export const subscribeToUserNotifications = (
  _userId: string,
  callback: (notifs: Notification[]) => void,
  intervalMs = 60_000
): (() => void) => subscribeToNotifications(callback, intervalMs);
