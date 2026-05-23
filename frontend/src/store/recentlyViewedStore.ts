import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface RecentlyViewedStore {
  items: Product[];
  addItem: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const filtered = state.items.filter((p) => p.id !== product.id);
          return { items: [product, ...filtered].slice(0, 12) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'zest-recently-viewed' }
  )
);
