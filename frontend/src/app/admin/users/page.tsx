import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShoppingBag, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/utils/formatters';
import type { User as AppUser } from '@/types';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { AdminPageLoader, AdminSpinner } from '@/components/admin/AdminSpinner';
import { StatusBadge } from '@/components/admin/StatusBadge';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchUsers = async (p = 1, q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (q) params.set('q', q);
      const data = await api.get<{ users: AppUser[]; total: number }>(`/admin/users?${params}`);
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const handleRoleToggle = async (u: AppUser) => {
    if (u.id === currentUser?.id) { toast.error('You cannot change your own role'); return; }
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}`, { role: newRole });
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: newRole } : x));
      toast.success(`${u.name} is now ${newRole === 'admin' ? 'an admin' : 'a customer'}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (u: AppUser) => {
    const isActive = (u as unknown as { isActive?: boolean }).isActive ?? true;
    setUpdatingId(u.id);
    try {
      await api.patch(`/admin/users/${u.id}`, { isActive: !isActive });
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, isActive: !isActive } as unknown as AppUser : x));
      toast.success(`Account ${!isActive ? 'activated' : 'suspended'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Users</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">{total.toLocaleString()} registered customers</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-10 pr-4 py-2 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:border-[var(--admin-border-strong)] transition-colors w-60 placeholder:text-[var(--admin-text-muted)]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        {loading ? (
          <AdminPageLoader />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-2)] flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[var(--admin-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No users found</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 max-w-xs">Try a different search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--admin-surface-2)] border-b border-[var(--admin-border)]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)] hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)] hidden sm:table-cell">Orders</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)] hidden md:table-cell">Spent</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)] hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {users.map((u) => {
                  const isActive = (u as unknown as { isActive?: boolean }).isActive ?? true;
                  return (
                    <tr key={u.id} className="hover:bg-[var(--admin-surface-2)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{ background: 'var(--admin-surface-2)', color: 'var(--admin-text-secondary)' }}
                          >
                            {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate">{u.name}</p>
                            <p className="text-xs text-[var(--admin-text-muted)] truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={u.role ?? 'user'} />
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <StatusBadge status={isActive ? 'active' : 'suspended'} />
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-[var(--admin-text-secondary)]">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {u.totalOrders ?? 0}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-[var(--admin-text-primary)] font-medium">
                        {formatPrice(u.totalSpent ?? 0)}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-[var(--admin-text-muted)]">
                        {u.createdAt ? formatDate(u.createdAt as unknown as string) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {updatingId === u.id ? (
                            <AdminSpinner size="sm" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleRoleToggle(u)}
                                disabled={u.id === currentUser?.id}
                                title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                                className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] disabled:opacity-30 transition-colors"
                              >
                                <Shield className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={u.id === currentUser?.id}
                                title={isActive ? 'Suspend account' : 'Activate account'}
                                className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] disabled:opacity-30 transition-colors"
                              >
                                <UserCheck
                                  className="w-4 h-4"
                                  style={{ color: isActive ? 'var(--admin-success)' : 'var(--admin-danger)' }}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > LIMIT && !loading && (
        <div className="flex items-center justify-between text-sm text-[var(--admin-text-muted)]">
          <span>Showing {Math.min(LIMIT, users.length)} of {total}</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setPage((p) => p - 1); fetchUsers(page - 1, search); }}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] text-[var(--admin-text-primary)] text-sm font-medium rounded-lg border border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-surface-2)] disabled:opacity-40 transition-all"
            >
              Prev
            </button>
            <button
              onClick={() => { setPage((p) => p + 1); fetchUsers(page + 1, search); }}
              disabled={page * LIMIT >= total}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] text-[var(--admin-text-primary)] text-sm font-medium rounded-lg border border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-surface-2)] disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
