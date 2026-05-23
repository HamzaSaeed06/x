import { Link } from 'wouter';
import { usePathname, useRouter } from '@/hooks/useNextRouter';
import {
  LayoutDashboard, Package, ShoppingCart, Tag, Users, BarChart2,
  Settings, ChevronRight, Menu, X, Bell, ArrowLeft, LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AdminFullScreenLoader } from '@/components/admin/AdminSpinner';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/admin/settings', icon: Settings, label: 'Store Settings' },
];

function useFormattedDate() {
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () =>
      setDate(
        new Date().toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
        })
      );
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);
  return date;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const formattedDate = useFormattedDate();

  if (isLoading) return <AdminFullScreenLoader />;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)]">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-2)] flex items-center justify-center mb-4 mx-auto">
            <Settings className="w-6 h-6 text-[var(--admin-text-muted)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--admin-text-primary)]">Sign In Required</h2>
          <p className="text-sm text-[var(--admin-text-secondary)]">You must be signed in to access the admin panel.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all w-full justify-center"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)]">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--admin-danger-bg)] flex items-center justify-center mb-4 mx-auto">
            <X className="w-6 h-6 text-[var(--admin-danger)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--admin-text-primary)]">Access Denied</h2>
          <p className="text-sm text-[var(--admin-text-secondary)]">You don't have permission to access the admin panel.</p>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all w-full">
            Go to Store
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + '/');

  const currentSection = adminNavItems.find((n) => isActive(n.path, n.exact))?.label ?? 'Admin';
  const initial = (user.displayName ?? user.email ?? 'A').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[var(--admin-bg)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--admin-surface)] border-r border-[var(--admin-border)] z-30 flex flex-col transform transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border)]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--admin-accent)] flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--admin-text-primary)] tracking-tight">Zest</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-[var(--admin-surface-2)]">
            <X className="w-4 h-4 text-[var(--admin-text-secondary)]" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {adminNavItems.map(({ path, icon: Icon, label, exact }) => (
            <Link
              key={path}
              href={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                isActive(path, exact)
                  ? 'bg-[var(--admin-accent)] text-white'
                  : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {isActive(path, exact) && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--admin-border)]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors">
            <div className="w-9 h-9 rounded-lg bg-[var(--admin-accent)] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--admin-text-primary)] truncate">{user.displayName ?? 'Admin'}</p>
              <p className="text-xs text-[var(--admin-text-muted)] truncate">{user.email}</p>
            </div>
            <button onClick={() => logout?.()} title="Sign out" className="p-1 rounded hover:bg-[var(--admin-border)] transition-colors">
              <LogOut className="w-4 h-4 text-[var(--admin-text-muted)]" />
            </button>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center gap-1.5 px-2 text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4 text-[var(--admin-text-secondary)]" />
            </button>
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-[var(--admin-text-muted)]">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
              <span className="font-medium text-[var(--admin-text-primary)]">{currentSection}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--admin-text-muted)] hidden sm:block">{formattedDate}</span>
            <button className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors">
              <Bell className="w-4 h-4 text-[var(--admin-text-secondary)]" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
