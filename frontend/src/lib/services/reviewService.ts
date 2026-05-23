import { api } from '@/lib/api';
import type { Review } from '@/types';

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const data = await api.get<{ reviews: Review[] }>(`/reviews/product/${productId}`);
    return data.reviews ?? [];
  } catch {
    return [];
  }
};

export const addReview = async (
  productId: string,
  payload: { rating: number; title?: string; body: string; userName?: string; userAvatar?: string; images?: string[] }
): Promise<Review> => {
  return await api.post<Review>(`/reviews/product/${productId}`, payload);
};

export const updateReview = async (reviewId: string, payload: { rating?: number; title?: string; body?: string }): Promise<Review> => {
  return await api.patch<Review>(`/reviews/${reviewId}`, payload);
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const data = await api.get<{ reviews: Review[] }>(`/reviews/user/${userId}`);
    return data.reviews ?? [];
  } catch {
    return [];
  }
};

export const getReviewsByProduct = async (productId: string, _sort?: string): Promise<Review[]> => {
  return getProductReviews(productId);
};

export const markReviewHelpful = async (reviewId: string, type: 'helpful' | 'unhelpful' = 'helpful'): Promise<{ helpful: number; unhelpful: number } | void> => {
  try {
    return await api.post<{ helpful: number; unhelpful: number }>(`/reviews/${reviewId}/helpful`, { type });
  } catch {
    // non-critical
  }
};

export const hasUserReviewedProduct = async (productId: string, userId: string): Promise<boolean> => {
  try {
    const reviews = await getUserReviews(userId);
    return reviews.some((r) => r.productId === productId || (r as unknown as { productId: string }).productId === productId);
  } catch {
    return false;
  }
};

export const checkReviewEligibility = async (productId: string): Promise<{ canReview: boolean; hasPurchased: boolean; hasReviewed: boolean }> => {
  try {
    return await api.get<{ canReview: boolean; hasPurchased: boolean; hasReviewed: boolean }>(`/reviews/check/${productId}`);
  } catch {
    return { canReview: false, hasPurchased: false, hasReviewed: false };
  }
};
