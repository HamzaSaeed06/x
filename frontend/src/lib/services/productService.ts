import { api } from '@/lib/api';
import type { Product } from '@/types';

export interface GetProductsOptions {
  category?: string;
  subcategory?: string;
  sort?: string;
  pageSize?: number;
  page?: number;
  q?: string;
}

export const getProducts = async (
  options: GetProductsOptions = {}
): Promise<{ products: Product[]; lastDoc: null; total?: number }> => {
  const params = new URLSearchParams();
  if (options.category) params.set('category', options.category);
  if (options.subcategory) params.set('subcategory', options.subcategory);
  if (options.sort) params.set('sort', options.sort);
  if (options.pageSize) params.set('limit', String(options.pageSize));
  if (options.page) params.set('page', String(options.page));
  if (options.q) params.set('q', options.q);

  try {
    const data = await api.get<{ products: Product[]; total?: number }>(
      `/products?${params}`
    );
    return { products: data.products ?? [], lastDoc: null, total: data.total };
  } catch {
    return { products: [], lastDoc: null };
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await api.get<Product>(`/products/${id}`);
  } catch {
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    return await api.get<Product>(`/products/slug/${slug}`);
  } catch {
    return null;
  }
};

export const getFeaturedProducts = async (limit = 4): Promise<Product[]> => {
  try {
    const data = await api.get<{ products: Product[] }>(
      `/products/featured?limit=${limit}`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
};

export const getTrendingProducts = async (limit = 8): Promise<Product[]> => {
  try {
    const data = await api.get<{ products: Product[] }>(
      `/products/trending?limit=${limit}`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
};

export const getNewArrivals = async (limit = 4): Promise<Product[]> => {
  try {
    const data = await api.get<{ products: Product[] }>(
      `/products/new-arrivals?limit=${limit}`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
};

export const getFlashSaleProducts = async (limit = 8): Promise<Product[]> => {
  try {
    const data = await api.get<{ products: Product[] }>(
      `/products/flash-sale?limit=${limit}`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
};

export const incrementProductViews = async (id: string): Promise<void> => {
  try { await api.post(`/products/${id}/view`); } catch {}
};

// Admin
export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  return api.post<Product>('/admin/products', data);
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  return api.patch<Product>(`/admin/products/${id}`, data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

export const getAllAdminProducts = async (
  options: GetProductsOptions = {}
): Promise<{ products: Product[]; total: number }> => {
  const params = new URLSearchParams();
  if (options.category) params.set('category', options.category);
  if (options.sort) params.set('sort', options.sort);
  if (options.pageSize) params.set('limit', String(options.pageSize));
  if (options.page) params.set('page', String(options.page));
  if (options.q) params.set('q', options.q);

  try {
    const data = await api.get<{ products: Product[]; total: number }>(
      `/admin/products?${params}`
    );
    return { products: data.products ?? [], total: data.total ?? 0 };
  } catch {
    return { products: [], total: 0 };
  }
};

export const getRelatedProducts = async (productId: string, limit = 4): Promise<Product[]> => {
  try {
    const data = await api.get<{ products: Product[] }>(`/products?limit=${limit}`);
    return (data.products ?? []).filter((p) => p.id !== productId).slice(0, limit);
  } catch {
    return [];
  }
};

export const subscribeToProducts = (
  _options: GetProductsOptions,
  callback: (products: Product[]) => void
): (() => void) => {
  getProducts(_options).then(({ products }) => callback(products));
  return () => {};
};
