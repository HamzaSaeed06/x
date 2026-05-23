import { useEffect, useState } from 'react';
import { useParams, useRouter } from '@/hooks/useNextRouter';
import { Link } from 'wouter';
import { subscribeToOrder } from '@/lib/services/orderService';
import { hasUserReviewedProduct } from '@/lib/services/reviewService';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import {
  ChevronLeft, Package, Star, Loader2, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { OrderTimeline } from '@/components/orders/OrderTimeline';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  confirmed:  { label: 'Confirmed',  bg: 'bg-blue-50',    text: 'text-blue-700' },
  processing: { label: 'Processing', bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  shipped:    { label: 'Shipped',    bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  delivered:  { label: 'Delivered',  bg: 'bg-green-50',   text: 'text-green-700' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-50',     text: 'text-red-700' },
  returned:   { label: 'Returned',   bg: 'bg-gray-50',    text: 'text-gray-700' },
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ productId: string; productName: string } | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }

    const unsub = subscribeToOrder(orderId, (o) => {
      setOrder(o);
      setLoading(false);
    });
    return unsub;
  }, [user, authLoading, orderId]);

  useEffect(() => {
    if (!order || !user) return;
    const items = (order.items as unknown as Array<{ productId?: string }>) ?? [];
    Promise.all(
      items.map(async (item) => {
        if (!item.productId) return null;
        const reviewed = await hasUserReviewedProduct(item.productId, user.id);
        return reviewed ? item.productId : null;
      })
    ).then((results) => {
      setReviewedProducts(new Set(results.filter(Boolean) as string[]));
    });
  }, [order, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Package size={48} className="text-[var(--neutral-300)] mx-auto mb-4" />
        <h2 className="font-bold text-lg mb-2">Order not found</h2>
        <Link href="/account/orders" className="text-sm underline">Back to orders</Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status ?? 'pending'] ?? STATUS_CONFIG.pending;
  const address = order.address as unknown as Record<string, string> | undefined;
  const items = (order.items as unknown as Array<{
    productId?: string;
    name?: string;
    image?: string;
    price?: number;
    qty?: number;
    size?: string;
    color?: string;
  }>) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/account/orders" className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-black transition-colors">
          <ChevronLeft size={14} /> Back to orders
        </Link>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Order #{(order.id ?? '').slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Placed {order.createdAt ? new Date(order.createdAt as unknown as string).toLocaleDateString() : ''}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 font-semibold uppercase ${cfg.bg} ${cfg.text} rounded-full`}>
          {cfg.label}
        </span>
      </div>

      {/* Order Timeline */}
      <OrderTimeline status={order.status ?? 'pending'} />

      {/* Items */}
      <div className="border border-[var(--border-default)]">
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          <h2 className="font-semibold text-sm">Items ({items.length})</h2>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-3 border-b border-[var(--border-default)] last:border-0">
            <img src={item.image ?? ''} alt={item.name ?? ''} className="w-14 h-14 object-cover bg-[var(--neutral-100)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {[item.size, item.color].filter(Boolean).join(' · ')} × {item.qty ?? 1}
              </p>
              <p className="text-sm font-bold mt-1">{formatPrice((item.price ?? 0) * (item.qty ?? 1))}</p>
            </div>
            {order.status === 'delivered' && item.productId && !reviewedProducts.has(item.productId) && (
              <button
                onClick={() => setReviewModal({ productId: item.productId!, productName: item.name ?? '' })}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-black border border-[var(--border-default)] hover:border-black px-2 py-1 transition-colors flex-shrink-0"
              >
                <Star size={12} /> Review
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Summary + Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-[var(--border-default)] p-4 space-y-2">
          <h2 className="font-semibold text-sm mb-3">Order Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(order.subtotal ?? 0)}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{(order.shipping ?? 0) === 0 ? 'Free' : formatPrice(order.shipping ?? 0)}</span></div>
          {(order.discount ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-green-700"><span>Discount</span><span>-{formatPrice(order.discount ?? 0)}</span></div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-[var(--border-default)] pt-2 mt-2">
            <span>Total</span><span>{formatPrice(order.total ?? 0)}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] pt-1 capitalize">
            Payment: {(order.paymentMethod as string) ?? 'COD'} ·{' '}
            <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
              {order.paymentStatus ?? 'Pending'}
            </span>
          </div>
        </div>

        {address && (
          <div className="border border-[var(--border-default)] p-4">
            <h2 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
              <MapPin size={14} /> Delivery Address
            </h2>
            <div className="text-sm space-y-0.5 text-[var(--text-muted)]">
              <p className="text-[var(--text-primary)] font-medium">{address.name}</p>
              <p>{address.address}</p>
              {address.area && <p>{address.area}</p>}
              <p>{[address.city, address.province].filter(Boolean).join(', ')}</p>
              {address.phone && <p>📞 {address.phone}</p>}
            </div>
          </div>
        )}
      </div>

      {reviewModal && (
        <ReviewModal
          productId={reviewModal.productId}
          productName={reviewModal.productName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => {
            setReviewedProducts((prev) => new Set([...prev, reviewModal.productId]));
            setReviewModal(null);
          }}
        />
      )}
    </div>
  );
}
