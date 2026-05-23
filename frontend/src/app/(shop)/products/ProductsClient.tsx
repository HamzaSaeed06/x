import { useState } from 'react';
import { useRouter } from '@/hooks/useNextRouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  Search, 
  Grid3X3, 
  LayoutGrid, 
  X,
  ChevronDown,
  Filter,
  List,
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

const CATEGORIES = [
  { value: '', label: 'All Products', icon: LayoutGrid },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

interface ProductsClientProps {
  products: Product[];
  initialCategory?: string;
  initialSort?: string;
  query?: string;
}

export function ProductsClient({
  products,
  initialCategory,
  initialSort,
  query,
}: ProductsClientProps) {
  const router = useRouter();
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = initialCategory || initialSort || query;

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
              {initialCategory
                ? CATEGORIES.find(c => c.value === initialCategory)?.label || initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)
                : 'All Products'}
            </h1>
            {query && (
              <p className="text-neutral-600 text-base sm:text-lg">
                Showing results for{' '}
                <span className="font-semibold text-neutral-950">&ldquo;{query}&rdquo;</span>
                {' '}&mdash; <span className="font-medium">{products.length} {products.length === 1 ? 'product' : 'products'}</span> found
              </p>
            )}
            {!query && (
              <p className="text-neutral-600 text-base sm:text-lg">
                <span className="font-medium">{products.length}</span> {products.length === 1 ? 'product' : 'products'} available
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          {/* Left: Category Pills (Desktop) */}
          <div className="hidden lg:flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = (initialCategory ?? '') === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => updateFilter('category', cat.value)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-250 whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-lg'
                      : 'bg-neutral-150 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Mobile: Filter Button + Sort */}
          <div className="flex items-center gap-2 sm:gap-3 lg:hidden w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 sm:flex-none h-10 text-xs sm:text-sm"
            >
              <Filter size={14} className="sm:w-4 sm:h-4" />
              <span className="ml-1.5">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                  {[initialCategory, initialSort, query].filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* Sort Dropdown - Mobile/Tablet */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={initialSort ?? ''}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none w-full text-xs sm:text-sm font-medium border border-neutral-200 pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 bg-white rounded-lg sm:rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all cursor-pointer"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="sm:w-4 sm:h-4 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Right: Sort & Grid Controls (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={initialSort ?? ''}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none text-sm font-medium border border-neutral-200 pl-4 pr-10 py-2.5 bg-white rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-all cursor-pointer"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>

            {/* Grid Toggle */}
            <div className="flex items-center gap-1 border border-neutral-200 rounded-xl p-1">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols as 2 | 3 | 4)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                    gridCols === cols
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                  aria-label={`${cols} columns`}
                >
                  {cols === 2 && <LayoutGrid size={16} />}
                  {cols === 3 && <Grid3X3 size={16} />}
                  {cols === 4 && <SlidersHorizontal size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-200"
          >
            <span className="text-xs font-semibold text-neutral-600 mr-2">Active Filters:</span>
            {initialCategory && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg">
                {CATEGORIES.find(c => c.value === initialCategory)?.label || initialCategory}
                <button
                  onClick={() => updateFilter('category', '')}
                  className="hover:text-neutral-950 transition-colors"
                  aria-label="Remove category filter"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {initialSort && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg">
                {SORT_OPTIONS.find(o => o.value === initialSort)?.label}
                <button
                  onClick={() => updateFilter('sort', '')}
                  className="hover:text-neutral-950 transition-colors"
                  aria-label="Remove sort filter"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {query && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg">
                <span className="truncate max-w-[120px] sm:max-w-[200px]">Search: {query}</span>
                <button
                  onClick={() => updateFilter('q', '')}
                  className="hover:text-neutral-950 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors ml-2 px-3 py-1 rounded hover:bg-neutral-100"
            >
              Clear All
            </button>
          </motion.div>
        )}

        {/* Product Grid */}
        {products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24 lg:py-32 text-center px-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Search size={24} className="sm:w-8 sm:h-8 text-neutral-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1 sm:mb-2">No products found</h2>
            <p className="text-neutral-500 text-xs sm:text-sm max-w-xs sm:max-w-sm mb-4 sm:mb-6">
              We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search query.
            </p>
            <Button onClick={clearFilters} variant="outline" size="sm" className="h-9 sm:h-10 text-xs sm:text-sm">
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className={`grid gap-3 sm:gap-4 lg:gap-6 ${
              gridCols === 2 
                ? 'grid-cols-2' 
                : gridCols === 3 
                  ? 'grid-cols-2 md:grid-cols-3' 
                  : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.04 },
              },
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  },
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[280px] sm:max-w-sm bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-neutral-100 rounded-lg sm:rounded-xl transition-colors"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 mb-2 sm:mb-3">Category</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {CATEGORIES.map((cat) => {
                        const isActive = (initialCategory ?? '') === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => {
                              updateFilter('category', cat.value);
                              setMobileFiltersOpen(false);
                            }}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all ${
                              isActive
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 mb-2 sm:mb-3">Sort By</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {SORT_OPTIONS.map((option) => {
                        const isActive = (initialSort ?? '') === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              updateFilter('sort', option.value);
                              setMobileFiltersOpen(false);
                            }}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all ${
                              isActive
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t border-neutral-100 bg-white safe-area-inset-bottom">
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10 sm:h-11 text-xs sm:text-sm"
                      onClick={() => {
                        clearFilters();
                        setMobileFiltersOpen(false);
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-10 sm:h-11 text-xs sm:text-sm"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      View {products.length} Products
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
