import { api } from '@/lib/api';
import type { Order, Address, CartItem } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/services/storeSettingsService';

export interface CreateOrderPayload {
  userId?: string;
  guestEmail?: string;
  items: CartItem[];
  address: Address;
  paymentMethod: string;
  couponCode?: string;
  discount?: number;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<string> => {
  const data = await api.post<{ orderId: string }>('/orders', payload);
  return data.orderId;
};

export const getMyOrders = async (): Promise<Order[]> => {
  try {
    const data = await api.get<{ orders: Order[] }>('/orders/my');
    return data.orders ?? [];
  } catch {
    return [];
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    return await api.get<Order>(`/orders/${orderId}`);
  } catch {
    return null;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const data = await api.get<{ orders: Order[] }>(`/users/${userId}/orders`);
    return data.orders ?? [];
  } catch {
    return [];
  }
};

// Alias for backward compatibility
export const getOrdersByUser = getUserOrders;

// Polls order by ID (for real-time-like updates)
export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order | null) => void,
  intervalMs = 30_000
): (() => void) => {
  let active = true;
  const fetchOrder = () => {
    getOrderById(orderId)
      .then((o) => { if (active) callback(o); })
      .catch(() => { if (active) callback(null); });
  };
  fetchOrder();
  const timer = setInterval(fetchOrder, intervalMs);
  return () => { active = false; clearInterval(timer); };
};

export const hasUserPurchasedProduct = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const orders = await getUserOrders(userId);
    return orders.some((order) =>
      order.status === 'delivered' &&
      ((order.items as unknown as Array<{ productId?: string }>) ?? []).some((item) => item.productId === productId)
    );
  } catch {
    return false;
  }
};

export const getOrdersByStatus = async (status: string, limitCount = 100): Promise<Order[]> => {
  try {
    const data = await api.get<{ orders: Order[] }>(`/admin/orders?status=${status}&limit=${limitCount}`);
    return data.orders ?? [];
  } catch {
    return [];
  }
};

export const cancelOrder = async (orderId: string): Promise<void> => {
  await api.patch(`/orders/${orderId}/cancel`, {});
};

export const getAllOrders = async (filters?: { status?: string; page?: number; limit?: number }): Promise<Order[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    const data = await api.get<{ orders: Order[] }>(`/admin/orders${qs ? `?${qs}` : ''}`);
    return data.orders ?? [];
  } catch {
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: string, note?: string): Promise<Order> => {
  return await api.patch<Order>(`/admin/orders/${orderId}/status`, { status, note });
};

export const getOrderStats = async (): Promise<{
  revenue: number;
  orders: number;
  pending: number;
  today: number;
}> => {
  try {
    const data = await api.get<{ totalRevenue: number; totalOrders: number; ordersByStatus: Record<string, number> }>('/admin/analytics');
    const today = 0; // would need date filter
    return {
      revenue: data.totalRevenue,
      orders: data.totalOrders,
      pending: data.ordersByStatus?.pending ?? 0,
      today,
    };
  } catch {
    return { revenue: 0, orders: 0, pending: 0, today: 0 };
  }
};
