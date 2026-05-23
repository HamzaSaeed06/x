import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Search, ShoppingCart, Eye, Package, ChevronDown } from 'lucide-react';
import { getAllOrders, getOrdersByStatus, updateOrderStatus } from '@/lib/services/orderService';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';
import toast from 'react-hot-toast';
import { AdminPageLoader } from '@/components/admin/AdminSpinner';
import { StatusBadge } from '@/components/admin/StatusBadge';

type StatusFilter = 'all' | Order['status'];

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ORDER_STATUSES: Order['status'][] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
];

function InlineStatusSelect({
  orderId,
  currentStatus,
  onChanged,
}: {
  orderId: string;
  currentStatus: Order['status'];
  onChanged: (id: string, status: Order['status']) => void;
}) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Order['status'];
    if (next === currentStatus) return;
    setSaving(true);
    try {
      await updateOrderStatus(orderId, next);
      onChanged(orderId, next);
      toast.success(`Order status → ${next}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <StatusBadge status={currentStatus} />
      <div className="relative ml-1">
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={saving}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          title="Change status"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="flex items-center justify-center w-6 h-6 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] hover:bg-[var(--admin-border)] transition-colors"
          disabled={saving}
          title="Change status"
        >
          {saving ? (
            <span
              className="w-3 h-3 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'var(--admin-border-strong)',
                borderTopColor: 'var(--admin-accent)',
              }}
            />
          ) : (
            <ChevronDown className="w-3 h-3 text-[var(--admin-text-muted)]" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const fetchOrders = async (tab: StatusFilter) => {
    setLoading(true);
    try {
      const data =
        tab === 'all'
          ? await getAllOrders(100)
          : await getOrdersByStatus(tab as Order['status'], 100);
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(activeTab); }, [activeTab]);

  const handleStatusChange = (id: string, next: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o))
    );
  };

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.address?.fullName?.toLowerCase().includes(q) ||
      o.guestEmail?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Orders</h1>
        <p className="text-sm text-[var(--admin-text-muted)] mt-1">
          Manage and track all customer orders. Click the <strong>▾</strong> next to a status badge to update it inline.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-[var(--admin-border)] overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-[var(--admin-accent)] text-[var(--admin-text-primary)]'
                : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          placeholder="Search by order ID or customer name..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:border-[var(--admin-border-strong)] transition-colors placeholder:text-[var(--admin-text-muted)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        {loading ? (
          <AdminPageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-2)] flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-[var(--admin-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No orders found</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 max-w-xs">
              {search ? `No results for "${search}"` : 'No orders in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--admin-surface-2)] border-b border-[var(--admin-border)]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Order</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Customer</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Items</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Date</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--admin-surface-2)] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-mono font-semibold text-[var(--admin-text-primary)]">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-[var(--admin-text-muted)] mt-0.5 capitalize">
                        {order.paymentMethod?.toUpperCase()} ·{' '}
                        <span style={{ color: order.paymentStatus === 'paid' ? 'var(--admin-success)' : 'var(--admin-warning)' }}>
                          {order.paymentStatus}
                        </span>
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-[var(--admin-text-primary)]">
                        {order.address?.fullName || order.guestEmail || 'Guest'}
                      </p>
                      <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                        {order.address?.city || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="w-9 h-9 rounded-lg border-2 border-[var(--admin-surface)] bg-[var(--admin-surface-2)] relative overflow-hidden flex-shrink-0"
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <Package className="w-3.5 h-3.5 m-auto text-[var(--admin-text-muted)]" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-9 h-9 rounded-lg border-2 border-[var(--admin-surface)] bg-[var(--admin-surface-2)] flex items-center justify-center text-xs font-semibold text-[var(--admin-text-secondary)]">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-[var(--admin-text-primary)]">
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <InlineStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                        onChanged={handleStatusChange}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[var(--admin-text-muted)]">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-accent)] text-white text-xs font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary row */}
      {!loading && filtered.length > 0 && (
        <p className="text-sm text-[var(--admin-text-muted)]">
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} · {formatPrice(totalRevenue)} total
        </p>
      )}
    </div>
  );
}
