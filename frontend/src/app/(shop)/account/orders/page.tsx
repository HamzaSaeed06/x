import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useRouter } from '@/hooks/useNextRouter';
import { getMyOrders } from '@/lib/services/orderService';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';
import { Package, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  delivered:  { label: 'Delivered',  color: 'bg-green-50 text-green-700 border-green-200' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200' },
  returned:   { label: 'Returned',   color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login?redirect=/account/orders');
      return;
    }
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">My Orders</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Track your orders and leave reviews after delivery.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 border border-dashed border-[var(--border-default)] gap-3 sm:gap-4 rounded-lg">
          <ShoppingBag size={32} className="sm:w-10 sm:h-10 text-[var(--neutral-300)]" />
          <p className="text-[var(--text-muted)] font-medium text-xs sm:text-sm text-center px-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="px-5 sm:px-6 py-2 sm:py-2.5 bg-black text-white text-xs sm:text-sm font-bold hover:opacity-80 transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status ?? 'pending'] ?? STATUS_CONFIG.pending;
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border border-[var(--border-default)] p-3 sm:p-4 hover:border-black transition-colors rounded-lg sm:rounded-none"
              >
                <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2 mb-2 sm:mb-3">
                  <div>
                    <p className="font-semibold text-xs sm:text-sm">Order #{(order.id ?? '').slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">
                      {order.createdAt ? new Date(order.createdAt as unknown as string).toLocaleDateString() : ''}
                      {' · '}
                      {(order.items as unknown[])?.length ?? 0} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 border font-medium rounded-full ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <ChevronRight size={14} className="sm:w-4 sm:h-4 text-[var(--text-muted)] hidden xs:block" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 sm:gap-2 overflow-hidden">
                    {((order.items as unknown[]) ?? []).slice(0, 4).map((item: unknown, i) => {
                      const it = item as { image?: string; name?: string };
                      return (
                        <img
                          key={i}
                          src={it.image ?? ''}
                          alt={it.name ?? ''}
                          className="w-9 h-9 sm:w-10 sm:h-10 object-cover bg-[var(--neutral-100)] flex-shrink-0 rounded"
                        />
                      );
                    })}
                    {((order.items as unknown[])?.length ?? 0) > 4 && (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--neutral-100)] flex items-center justify-center text-[10px] sm:text-xs text-[var(--text-muted)] rounded">
                        +{((order.items as unknown[])?.length ?? 0) - 4}
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-xs sm:text-sm">{formatPrice(order.total ?? 0)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
