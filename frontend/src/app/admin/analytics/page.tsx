import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Package, DollarSign,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { getAllOrders } from '@/lib/services/orderService';
import { formatPrice, toDate } from '@/utils/formatters';
import type { Order } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { AdminPageLoader } from '@/components/admin/AdminSpinner';

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-[var(--admin-text-primary)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: 'var(--admin-text-secondary)' }}>
          {p.name}: <span className="font-semibold text-[var(--admin-text-primary)]">{p.name === 'Revenue' ? formatPrice(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders(500).then((data) => { setOrders(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">Sales overview and performance metrics.</p>
        </div>
        <AdminPageLoader />
      </div>
    );
  }

  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = toDate(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = orders.filter((o) => {
    const d = toDate(o.createdAt);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const thisMonthRevenue = thisMonth.reduce((s, o) => s + (o.total || 0), 0);
  const lastMonthRevenue = lastMonth.reduce((s, o) => s + (o.total || 0), 0);
  const revenueChange = lastMonthRevenue > 0
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const monthOrders = orders.filter((o) => {
      const od = toDate(o.createdAt);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    return {
      month,
      revenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: monthOrders.length,
    };
  });

  const statusData = [
    { name: 'Pending',   value: orders.filter((o) => o.status === 'pending').length,    color: 'var(--status-pending-fg)' },
    { name: 'Confirmed', value: orders.filter((o) => o.status === 'confirmed').length,  color: 'var(--status-confirmed-fg)' },
    { name: 'Shipped',   value: orders.filter((o) => o.status === 'shipped').length,    color: 'var(--status-shipped-fg)' },
    { name: 'Delivered', value: orders.filter((o) => o.status === 'delivered').length,  color: 'var(--status-delivered-fg)' },
    { name: 'Cancelled', value: orders.filter((o) => o.status === 'cancelled').length,  color: 'var(--status-cancelled-fg)' },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      sub: `${formatPrice(thisMonthRevenue)} this month`,
      icon: DollarSign,
      iconStyle: { background: 'var(--admin-success-bg)', color: 'var(--admin-success)' },
      change: revenueChange,
    },
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      sub: `${thisMonth.length} this month`,
      icon: ShoppingBag,
      iconStyle: { background: 'var(--admin-info-bg)', color: 'var(--admin-info)' },
      change: null as number | null,
    },
    {
      label: 'Avg. Order Value',
      value: formatPrice(avgOrderValue),
      sub: `${deliveredOrders} delivered`,
      icon: TrendingUp,
      iconStyle: { background: '#f5f3ff', color: '#7c3aed' },
      change: null as number | null,
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      sub: 'Awaiting confirmation',
      icon: Package,
      iconStyle: { background: '#fff7ed', color: '#ea580c' },
      change: null as number | null,
    },
  ];

  const axisStyle = { fontSize: 12, fill: 'var(--admin-text-muted)' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--admin-text-muted)] mt-1">Sales overview and performance metrics.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--admin-text-muted)]">{stat.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={stat.iconStyle}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)] mb-1">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.change !== null ? (
                  <>
                    {stat.change >= 0
                      ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'var(--admin-success)' }} />
                      : <ArrowDownRight className="w-3.5 h-3.5" style={{ color: 'var(--admin-danger)' }} />}
                    <span className="text-xs font-semibold" style={{ color: stat.change >= 0 ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-xs text-[var(--admin-text-muted)]">vs last month</span>
                  </>
                ) : (
                  <span className="text-xs text-[var(--admin-text-muted)]">{stat.sub}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Monthly Revenue</h2>
            <span className="text-xs text-[var(--admin-text-muted)]">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--admin-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[var(--admin-text-primary)] mb-4">Order Status</h2>
          <div className="space-y-4">
            {statusData.map((s) => {
              const pct = orders.length > 0 ? (s.value / orders.length) * 100 : 0;
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[var(--admin-text-secondary)] font-medium">{s.name}</span>
                    <span className="font-semibold text-[var(--admin-text-primary)]">{s.value}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--admin-surface-2)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Trend */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[var(--admin-text-primary)] mb-4">Orders per Month</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke="var(--admin-accent)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--admin-accent)', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
