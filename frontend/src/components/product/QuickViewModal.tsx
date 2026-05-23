import { useState } from 'react';
import { X, ShoppingBag, Heart, ArrowRight, Loader2, Star } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, discountPercent } from '@/utils/formatters';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const isFlashSale = !!(product.isFlashSale && product.flashSalePrice);
  const price = isFlashSale ? product.flashSalePrice! : product.price;
  const comparePrice = isFlashSale ? product.price : product.comparePrice;
  const discount = comparePrice ? discountPercent(comparePrice, price) : 0;
  const images = product.images?.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'];

  const handleAdd = async () => {
    if (product.stock === 0) return;
    setIsLoading(true);
    try {
      addItem({
        productId: product.id,
        name: product.name,
        price,
        image: images[0],
        qty: 1,
        stock: product.stock,
      });
      toast.success('Added to bag!');
      openCart();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden w-full sm:max-w-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

        <div className="flex flex-col sm:flex-row max-h-[90vh] overflow-y-auto">
          {/* Image */}
          <div className="sm:w-[44%] bg-gray-50 aspect-square relative flex-shrink-0">
            <img
              src={images[selectedImg] || images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-6"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                -{Math.round(discount)}%
              </span>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`rounded-full transition-all duration-200 ${
                      selectedImg === i ? 'w-4 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[11px] font-bold text-gray-400 tracking-[0.15em]">
                {product.brand?.toUpperCase() || 'ZEST & CO.'}
              </p>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 -mt-0.5"
              >
                <X size={15} />
              </button>
            </div>

            <h2 className="text-[17px] font-extrabold text-black leading-snug mb-2">
              {product.name}
            </h2>

            {product.rating > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-gray-500">
                  {product.rating.toFixed(1)} ({product.reviewCount || 0})
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-extrabold text-black tabular-nums">
                {formatPrice(price)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-sm text-gray-400 line-through tabular-nums">
                  {formatPrice(comparePrice)}
                </span>
              )}
              {isFlashSale && (
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">
                  SALE
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 mb-4">
                {product.description}
              </p>
            )}

            {product.stock === 0 ? (
              <p className="text-sm font-bold text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-3">
                Currently Out of Stock
              </p>
            ) : product.stock <= 5 ? (
              <p className="text-sm font-bold text-orange-500 mb-3">
                ⚡ Only {product.stock} left in stock!
              </p>
            ) : null}

            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0 || isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white text-[13px] font-bold rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <ShoppingBag size={14} />
                }
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button
                onClick={() => {
                  toggleItem(product);
                  toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all ${
                  wishlisted
                    ? 'border-red-400 text-red-500 bg-red-50'
                    : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                <Heart size={16} className={wishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 mt-3 py-2 text-[12px] text-gray-400 hover:text-black transition-colors border-t border-gray-100"
            >
              View Full Details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
