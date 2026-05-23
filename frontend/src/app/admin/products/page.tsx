import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Plus, Search, Package, ExternalLink, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { getProducts, deleteProduct } from '@/lib/services/productService';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { AdminPageLoader } from '@/components/admin/AdminSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { products: data } = await getProducts({ pageSize: 100 });
        setProducts(data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? It will be hidden from the store.`)) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product archived');
    } catch {
      toast.error('Failed to archive product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-text-primary)]">Products</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">Manage your catalog, variants and inventory.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          placeholder="Search by name, brand or category..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg focus:outline-none focus:border-[var(--admin-border-strong)] transition-colors placeholder:text-[var(--admin-text-muted)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <AdminPageLoader />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--admin-surface-2)] flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[var(--admin-text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No products found</p>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 max-w-xs">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "You haven't added any products yet."}
            </p>
            {!searchTerm && (
              <div className="mt-5">
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create First Product
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--admin-surface-2)] border-b border-[var(--admin-border)]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Product</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Price</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Stock</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--admin-surface-2)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-0.5 flex-shrink-0 overflow-hidden">
                          <img
                            src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--admin-text-primary)] truncate">{product.name}</p>
                          <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{product.brand ?? 'Zest Collection'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-[var(--admin-surface-2)] text-[var(--admin-text-secondary)] px-2 py-0.5 rounded-md font-medium capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[var(--admin-text-primary)] font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      {product.stock <= product.lowStockThreshold ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ color: 'var(--admin-danger)', background: 'var(--admin-danger-bg)' }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {product.stock} low
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--admin-text-secondary)]">{product.stock} in stock</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.slug}`}
                          className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-all"
                          title="View on Store"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 rounded-lg text-[var(--admin-text-muted)] transition-all"
                          style={{ '--hover-bg': 'var(--admin-danger-bg)' } as React.CSSProperties}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--admin-danger-bg)';
                            e.currentTarget.style.color = 'var(--admin-danger)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '';
                            e.currentTarget.style.color = '';
                          }}
                          title="Archive Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
