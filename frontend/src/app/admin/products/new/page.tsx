import { ProductForm } from '@/components/admin/ProductForm';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)] transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Create Product</h1>
          <p className="text-[13px] text-[var(--admin-text-muted)] mt-0.5">Add a new item to your catalog with variants and images.</p>
        </div>
      </div>

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm">
        <ProductForm />
      </div>
    </div>
  );
}
