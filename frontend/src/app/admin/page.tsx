import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  TrendingUp, ShoppingCart, Package, Users, Clock, XCircle,
  ChevronRight, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/utils/formatters';
import type { Order } from '@/types';
import { AdminPageLoader } from '@/components/admin/AdminSpinner';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  ordersByStatus: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Analytics>('/admin/analytics')
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(analytics?.totalRevenue ?? 0),
      icon: TrendingUp,
      iconStyle: { background: 'var(--admin-success-bg)', color: 'var(--admin-success)' },
    },
    {
      label: 'Total Orders',
      value: (analytics?.totalOrders ?? 0).toLocaleString(),
      icon: ShoppingCart,
      iconStyle: { background: 'var(--admin-info-bg)', color: 'var(--admin-info)' },
    },
    {
      label: 'Products',
      value: (analytics?.totalProducts ?? 0).toLocaleString(),
      icon: Package,
      iconStyle: { background: '#f5f3ff', color: '#7c3aed' },
    },
    {
      label: 'Customers',
      value: (analytics?.totalUsers ?? 0).toLocaleString(),
      icon: Users,
      iconStyle: { background: 'var(--admin-warning-bg)', color: 'var(--admin-warning)' },
    },
    {
      label: 'Pending',
      value: (analytics?.ordersByStatus?.pending ?? 0).toLocaleString(),
      icon: Clock,
      iconStyle: { background: '#fff7ed', color: '#ea580c' },
    },
    {
      label: 'Cancelled',
      value: (analytics?.ordersByStatus?.cancelled ?? 0).toLocaleString(),
      icon: XCircle,
      iconStyle: { background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' },
    },
  ];

  const quickLinks = [
    { href: '/admin/products', icon: Package, label: 'Products', sub: 'Manage catalog & inventory' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders', sub: 'View & process orders' },
    { href: '/admin/users', icon: Users, label: 'Users', sub: 'Customer accounts' },
    { href: '/admin/coupons', icon: TrendingUp, label: 'Coupons', sub: 'Discount & promo codes' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--admin-text-muted)] mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={card.iconStyle}>
              <card.icon className="w-5 h-5" />
            </div>
            {loading ? (
              <div className="h-7 w-20 bg-[var(--admin-surface-2)] rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)]">{card.value}</p>
            )}
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <AdminPageLoader />
        ) : !analytics?.recentOrders?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-2)] flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-[var(--admin-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No orders yet</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--admin-surface-2)] border-b border-[var(--admin-border)]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Order</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Customer</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {analytics.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[var(--admin-surface-2)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-mono font-semibold text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)]">
                        #{(order.id ?? '').slice(-8).toUpperCase()}
                      </Link>
                      <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                        {order.createdAt ? new Date(order.createdAt as unknown as string).toLocaleDateString() : ''}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--admin-text-primary)]">
                      {order.address?.fullName || order.guestEmail || 'Guest'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[var(--admin-text-primary)]">
                      {formatPrice(order.total ?? 0)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5 hover:border-[var(--admin-border-strong)] hover:shadow-md transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--admin-surface-2)] flex items-center justify-center mb-3">
              <link.icon className="w-4 h-4 text-[var(--admin-text-secondary)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">{link.label}</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{link.sub}</p>
            <ChevronRight className="w-4 h-4 text-[var(--admin-text-muted)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
