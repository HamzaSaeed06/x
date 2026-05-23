import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Copy, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Coupon } from '@/types';
import toast from 'react-hot-toast';
import { AdminPageLoader, AdminSpinner } from '@/components/admin/AdminSpinner';

const inputCls =
  'w-full px-3 py-2 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-border-strong)] transition-colors placeholder:text-[var(--admin-text-muted)]';

const EMPTY_FORM: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'> = {
  code: '',
  type: 'percent',
  value: 10,
  minOrderAmount: 0,
  maxDiscount: undefined,
  usageLimit: undefined,
  expiresAt: undefined,
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<{ coupons: Coupon[] }>('/coupons/admin/list')
      .then((d) => setCoupons(d.coupons ?? []))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    : coupons;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code) { toast.error('Coupon code is required'); return; }
    setSubmitting(true);
    try {
      const created = await api.post<Coupon>('/coupons/admin', form);
      setCoupons((prev) => [created, ...prev]);
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      toast.success(`Coupon ${created.code} created`);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Failed to create coupon';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await api.patch(`/coupons/admin/${coupon.id}`, { isActive: !coupon.isActive });
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/coupons/admin/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success('Code copied!'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Coupons</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] active:scale-[0.98] transition-all"
        >
          {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close Form' : 'New Coupon'}
        </button>
      </div>

      {/* Create form — slide-down panel */}
      {showForm && (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
            <Tag className="w-4 h-4 text-[var(--admin-text-secondary)]" />
            <h2 className="text-sm font-semibold text-[var(--admin-text-primary)]">Create New Coupon</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={inputCls}
                  placeholder="e.g. SAVE20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
                  className={inputCls}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed Amount (PKR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Value ({form.type === 'percent' ? '%' : 'PKR'})</label>
                <input type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Min Order (PKR)</label>
                <input type="number" min={0} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className={inputCls} />
              </div>
              {form.type === 'percent' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Max Discount (PKR, optional)</label>
                  <input type="number" min={0} value={form.maxDiscount ?? ''} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} placeholder="No limit" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Usage Limit (optional)</label>
                <input type="number" min={1} value={form.usageLimit ?? ''} onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })} className={inputCls} placeholder="Unlimited" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-1.5">Expires At (optional)</label>
                <input type="date" value={form.expiresAt ? new Date(form.expiresAt).toISOString().split('T')[0] : ''} onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value) : undefined })} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <AdminSpinner size="sm" /> : <Plus className="w-4 h-4" />}
                Create Coupon
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] text-[var(--admin-text-primary)] text-sm font-medium rounded-lg border border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-surface-2)] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupons…"
          className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:border-[var(--admin-border-strong)] transition-colors placeholder:text-[var(--admin-text-muted)]"
        />
      </div>

      {/* Coupon cards */}
      {loading ? (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
          <AdminPageLoader />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-2)] flex items-center justify-center mb-4">
              <Tag className="w-6 h-6 text-[var(--admin-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No coupons found</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 max-w-xs">Create your first coupon to start offering discounts.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5 shadow-sm"
            >
              {/* Code row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-[var(--admin-text-primary)]">{coupon.code}</span>
                  <button onClick={() => copyCode(coupon.code)} title="Copy code" className="p-1 rounded hover:bg-[var(--admin-surface-2)] transition-colors">
                    <Copy className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
                  </button>
                </div>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    color: coupon.type === 'percent' ? 'var(--admin-info)' : 'var(--admin-warning)',
                    background: coupon.type === 'percent' ? 'var(--admin-info-bg)' : 'var(--admin-warning-bg)',
                  }}
                >
                  {coupon.type === 'percent' ? '%' : 'PKR'}
                </span>
              </div>

              {/* Value */}
              <p className="text-2xl font-semibold text-[var(--admin-text-primary)] mb-1">
                {coupon.type === 'percent' ? `${coupon.value}% off` : formatPrice(coupon.value)}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                {coupon.minOrderAmount > 0 && (
                  <span className="text-xs text-[var(--admin-text-muted)]">Min {formatPrice(coupon.minOrderAmount)}</span>
                )}
                {coupon.expiresAt && (
                  <span className="text-xs text-[var(--admin-text-muted)]">Expires {formatDate(coupon.expiresAt as unknown as string)}</span>
                )}
                <span className="text-xs text-[var(--admin-text-muted)]">
                  Used {coupon.usedCount ?? 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}x
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--admin-border)]">
                <button
                  onClick={() => handleToggle(coupon)}
                  className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                  style={{ color: coupon.isActive ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}
                >
                  <div
                    className="w-7 h-4 rounded-full relative transition-colors flex-shrink-0"
                    style={{ background: coupon.isActive ? 'var(--admin-success)' : 'var(--admin-border-strong)' }}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all"
                      style={{ left: coupon.isActive ? '14px' : '2px' }}
                    />
                  </div>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </button>
                {deletingId === coupon.id ? (
                  <AdminSpinner size="sm" />
                ) : (
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="p-1.5 rounded-lg transition-colors text-[var(--admin-text-muted)] hover:bg-[var(--admin-danger-bg)] hover:text-[var(--admin-danger)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
