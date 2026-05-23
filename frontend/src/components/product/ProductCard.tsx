import { Link } from 'wouter';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart, Star, ShoppingBag, Eye, Plus, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, discountPercent } from '@/utils/formatters';
import { QuickViewModal } from './QuickViewModal';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const displayPrice = isFlashSale ? product.flashSalePrice! : product.price;
  const comparePrice = isFlashSale ? product.price : product.comparePrice;
  const discount = comparePrice ? discountPercent(comparePrice, displayPrice) : 0;

  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    
    setIsLoading(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price: displayPrice,
        image: images[0],
        qty: 1,
        stock: product.stock,
      });
      setIsAdded(true);
      toast.success('Added to cart', {
        icon: <Check size={16} className="text-green-600" />,
        style: {
          borderRadius: '12px',
          padding: '12px 16px',
        },
      });
      setTimeout(() => setIsAdded(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      icon: wishlisted ? null : <Heart size={16} className="text-red-500 fill-red-500" />,
      style: {
        borderRadius: '12px',
        padding: '12px 16px',
      },
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <Link href={`/products/${product.slug}`}>
        <motion.article
          className="group relative flex flex-col bg-white rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border border-neutral-100 hover:border-neutral-300 transition-all duration-300 product-card-hover h-full shadow-sm hover:shadow-lg"
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
            {/* Skeleton loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-neutral-100 animate-shimmer" />
            )}
            
            {/* Main Image */}
            <img 
              src={images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 product-image-zoom ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />

            {/* Second image on hover (if available) - Only on desktop */}
            {images[1] && (
              <img 
                src={images[1]}
                alt={`${product.name} - alternate view`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"
                loading="lazy"
              />
            )}

            {/* Badges Container - Top Left */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10">
              {isFlashSale && discount > 0 && (
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold tracking-wide rounded-md sm:rounded-lg shadow-lg">
                  -{Math.round(discount)}%
                </span>
              )}
              {product.stock === 0 && (
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-md sm:rounded-lg">
                  Sold Out
                </span>
              )}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold rounded-md sm:rounded-lg">
                  Low Stock
                </span>
              )}
            </div>

            {/* Wishlist Button - Top Right */}
            <motion.button
              onClick={handleWishlist}
              className={`absolute top-2 sm:top-3 right-2 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
                wishlisted 
                  ? 'bg-red-50 text-red-500 border border-red-100' 
                  : 'bg-white/90 backdrop-blur-sm text-neutral-400 hover:text-red-500 border border-neutral-100'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={14}
                className={`sm:w-4 sm:h-4 transition-all ${wishlisted ? 'fill-red-500' : ''}`}
              />
            </motion.button>

            {/* Hover Actions - Bottom (Hidden on small mobile, visible on tablet+) */}
            <div className="absolute left-2 right-2 sm:left-3 sm:right-3 bottom-2 sm:bottom-3 z-20 flex gap-1.5 sm:gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 product-actions">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isLoading}
                className={`flex-1 h-9 sm:h-10 lg:h-11 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs tracking-wide shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAdded 
                    ? 'bg-green-500 text-white' 
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 size={12} className="sm:w-3.5 sm:h-3.5 animate-spin" />
                ) : isAdded ? (
                  <>
                    <Check size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">{product.stock === 0 ? 'Sold Out' : 'Add to Cart'}</span>
                    <span className="xs:hidden">{product.stock === 0 ? 'Sold' : 'Add'}</span>
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={handleQuickView}
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex items-center justify-center bg-white text-neutral-700 rounded-lg sm:rounded-xl shadow-lg border border-neutral-100 hover:bg-neutral-50 transition-all hidden sm:flex"
                whileTap={{ scale: 0.95 }}
                aria-label="Quick view"
              >
                <Eye size={14} className="sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            {/* Mobile Add to Cart - Always visible on touch devices */}
            <div className="sm:hidden absolute bottom-2 left-2 right-2 z-20">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isLoading}
                className={`w-full h-8 flex items-center justify-center gap-1.5 rounded-lg font-semibold text-[10px] tracking-wide shadow-md transition-all disabled:opacity-50 ${
                  isAdded 
                    ? 'bg-green-500 text-white' 
                    : 'bg-neutral-900/90 backdrop-blur-sm text-white'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isAdded ? (
                  <>
                    <Check size={12} />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag size={12} />
                    {product.stock === 0 ? 'Sold Out' : 'Add'}
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col p-2.5 sm:p-3 lg:p-4 flex-1">
            {/* Brand & Rating Row */}
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate pr-1">
                {product.brand || 'ZEST'}
              </span>
              {product.rating > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  <Star size={10} className="sm:w-3 sm:h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] sm:text-xs font-semibold text-neutral-700">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-neutral-400 hidden xs:inline">
                    ({product.reviewCount || 0})
                  </span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug mb-2 sm:mb-3 group-hover:text-neutral-700 transition-colors min-h-[2.25rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-auto flex-wrap">
              <span className="text-sm sm:text-base font-bold text-neutral-900 tabular-nums">
                {formatPrice(displayPrice)}
              </span>
              {comparePrice && comparePrice > displayPrice && (
                <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-neutral-400 line-through tabular-nums">
                  {formatPrice(comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-green-600 bg-green-50 px-1 sm:px-1.5 py-0.5 rounded hidden xs:inline">
                  Save {Math.round(discount)}%
                </span>
              )}
            </div>

            {/* Color Options Preview */}
            {product.attributes?.find(a => a.name.toLowerCase() === 'color')?.values && (
              <div className="flex items-center gap-1 sm:gap-1.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-neutral-100">
                {product.attributes
                  .find(a => a.name.toLowerCase() === 'color')!
                  .values.slice(0, 4)
                  .map((color, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full border border-neutral-200 shadow-sm"
                      style={{ 
                        backgroundColor: color.startsWith('#') ? color : color.toLowerCase() 
                      }}
                      title={color}
                    />
                  ))}
                {(product.attributes.find(a => a.name.toLowerCase() === 'color')?.values.length ?? 0) > 4 && (
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">
                    +{(product.attributes.find(a => a.name.toLowerCase() === 'color')?.values.length ?? 0) - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.article>
      </Link>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewOpen && (
          <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
