export function AdminSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
  };
  return (
    <div
      className={`${cls[size]} border-[var(--admin-border-strong)] border-t-[var(--admin-accent)] rounded-full animate-spin`}
    />
  );
}

export function AdminPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <AdminSpinner size="md" />
      <p className="text-xs text-[var(--admin-text-muted)]">Loading...</p>
    </div>
  );
}

export function AdminFullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg)]">
      <AdminSpinner size="md" />
    </div>
  );
}
