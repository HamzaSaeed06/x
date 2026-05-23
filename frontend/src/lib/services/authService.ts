import { api, setToken, clearToken } from '@/lib/api';
import type { User } from '@/types';

const LOYALTY_SIGNUP = 100;

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const data = await api.post<{ user: User; token: string }>('/auth/register', {
    email,
    password,
    name,
    loyaltyPoints: LOYALTY_SIGNUP,
  });
  setToken(data.token);
  return data.user;
};

export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  const data = await api.post<{ user: User; token: string }>('/auth/login', {
    email,
    password,
  });
  setToken(data.token);
  return data.user;
};

export const signInWithGoogle = async (access_token: string): Promise<User> => {
  const data = await api.post<{ user: User; token: string }>('/auth/google', { access_token });
  setToken(data.token);
  return data.user;
};

export const signOut = async (): Promise<void> => {
  try { await api.post('/auth/logout'); } catch {}
  clearToken();
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    return await api.get<User>('/auth/me');
  } catch {
    return null;
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    return await api.get<User>(`/users/${uid}`);
  } catch {
    return null;
  }
};

export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  return api.patch<User>('/auth/profile', data);
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.post('/auth/change-password', { currentPassword, newPassword });
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An error occurred.';
};
