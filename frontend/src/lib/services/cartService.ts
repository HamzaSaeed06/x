import { api } from '@/lib/api';
import type { CartItem } from '@/types';

export const syncCartToServer = async (
  userId: string,
  items: CartItem[]
): Promise<void> => {
  try {
    await api.put(`/users/${userId}/cart`, { items });
  } catch {}
};

export const loadCartFromServer = async (userId: string): Promise<CartItem[]> => {
  try {
    const data = await api.get<{ items: CartItem[] }>(`/users/${userId}/cart`);
    return data.items ?? [];
  } catch {
    return [];
  }
};

export const clearServerCart = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}/cart`);
  } catch {}
};
