import { Clock } from 'lucide-react';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { ProductCard } from './ProductCard';

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { items } = useRecentlyViewedStore();
  const filtered = items.filter((p) => p.id !== excludeId);

  if (filtered.length === 0) return null;

  return (
    <section className="mb-16 border-t pt-12">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-gray-400" />
        <h2 className="text-xl font-bold text-black tracking-tight">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.slice(0, 5).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
