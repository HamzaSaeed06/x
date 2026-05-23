import { useEffect, useState } from 'react';
import { useParams, useRouter } from '@/hooks/useNextRouter';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { getProductById } from '@/lib/services/productService';
import { ProductForm } from '@/components/admin/ProductForm';
import { AdminSpinner } from '@/components/admin/AdminSpinner';
import type { Product } from '@/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(id as string).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AdminSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-[var(--admin-text-muted)]">Product not found.</p>
        <Link href="/admin/products" className="text-sm font-semibold text-[var(--admin-accent)] underline mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:border-[var(--admin-border-strong)] transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-[var(--admin-text-primary)]">Edit Product</h1>
          <p className="text-[12px] text-[var(--admin-text-muted)] mt-0.5 truncate max-w-xs">{product.name}</p>
        </div>
      </div>
      <ProductForm initialData={product} onSuccess={() => router.push('/admin/products')} />
    </div>
  );
}
