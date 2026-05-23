import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Loader2, 
  RotateCcw, 
  ShieldCheck, 
  Truck, 
  Check, 
  Star, 
  Share2, 
  Eye,
  Minus,
  Plus,
  ChevronDown,
  Package,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { checkReviewEligibility } from '@/lib/services/reviewService';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { StickyBuyBar } from '@/components/product/StickyBuyBar';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import type { Product, StoreSettings } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function ProductDetailClient({
  product,
  settings,
  onDisplayImagesChange,
}: {
  product: Product;
  settings?: Pick<StoreSettings, 'deliveryEstimate' | 'returnPolicy' | 'returnPolicyDays' | 'warrantyPolicy' | 'freeDeliveryThreshold'>;
  onDisplayImagesChange?: (images: string[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [viewingCount] = useState(() => Math.floor(Math.random() * 14) + 4);
  const ctaRef = useRef<HTMLDivElement>(null);

  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { user } = useAuthStore();
  const { addItem: addToRecentlyViewed } = useRecentlyViewedStore();

  const wishlisted = isWishlisted(product.id);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.attributes?.forEach(attr => {
      initial[attr.name] = attr.values[0];
    });
    return initial;
  });

  const activeVariant = useMemo(() => {
    if (!product.hasVariants || !product.variants) return null;
    return product.variants.find(v =>
      Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value)
    );
  }, [product.variants, product.hasVariants, selectedAttributes]);

  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const basePrice = isFlashSale ? product.flashSalePrice! : (activeVariant?.price || product.price);
  const displayPrice = activeVariant?.price || basePrice;
  const comparePrice = activeVariant?.comparePrice || product.comparePrice;
  const discountPercent = comparePrice && comparePrice > displayPrice 
    ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
    : 0;

  const displayImages = useMemo(() => {
    const colorAttr = Object.keys(selectedAttributes).find(k => k.toLowerCase() === 'color');
    const selectedColor = colorAttr ? selectedAttributes[colorAttr] : null;
    
    let baseImages: string[] = [];
    if (selectedColor && product.colorImages?.[selectedColor]) {
      baseImages = product.colorImages[selectedColor];
    } else if (activeVariant?.images && activeVariant.images.length > 0) {
      baseImages = activeVariant.images;
    }

    const combined = [...baseImages, ...product.images];
    return Array.from(new Set(combined));
  }, [selectedAttributes, product.colorImages, product.images, activeVariant]);

  useEffect(() => {
    if (onDisplayImagesChange) {
      onDisplayImagesChange(displayImages.length > 0 ? displayImages : product.images);
    }
  }, [displayImages, product.images, onDisplayImagesChange]);

  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product.id]);

  useEffect(() => {
    if (!user) { setCanReview(false); return; }
    let cancelled = false;
    checkReviewEligibility(product.id).then(({ canReview, hasReviewed }) => {
      if (!cancelled) {
        setCanReview(canReview || hasReviewed);
        setHasReviewed(hasReviewed);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, product.id]);

  const handleAddToCart = () => {
    const currentStock = activeVariant?.stock ?? product.stock;
    if (currentStock === 0) return;
    setIsLoading(true);
    try {
      addItem({
        productId: product.id,
        variantId: activeVariant?.id,
        name: product.name,
        price: displayPrice,
        image: displayImages[0] || product.images[0] || '',
        qty: quantity,
        stock: currentStock,
        attributes: selectedAttributes,
      });
      toast.success('Added to cart', {
        icon: <Check size={16} className="text-green-600" />,
        style: { borderRadius: '12px' },
      });
      openCart();
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = () => {
    toggleItem(product);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      icon: wishlisted ? null : <Heart size={16} className="text-red-500 fill-red-500" />,
      style: { borderRadius: '12px' },
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Zest & Partners`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!', { style: { borderRadius: '12px' } });
      }
    } catch {}
  };

  const updateAttribute = (name: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  const currentStock = activeVariant?.stock ?? product.stock;

  const isHex = (val: string) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(val.trim());

  const accordionSections = [
    {
      id: 'description',
      title: 'Description',
      content: product.description,
    },
    ...(product.specifications?.length ? [{
      id: 'specifications',
      title: 'Specifications',
      content: product.specifications,
    }] : []),
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      content: `Free delivery on orders over ${formatPrice(settings?.freeDeliveryThreshold || 5000)}. ${settings?.returnPolicyDays || 30}-day hassle-free returns. Standard delivery: ${settings?.deliveryEstimate || '3-5 working days'}.`,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Breadcrumb / Tags */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        {product.brand && (
          <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {product.brand}
          </span>
        )}
        {isFlashSale && (
          <span className="px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-md">
            SALE
          </span>
        )}
      </div>

      {/* Product Name */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight mb-3 sm:mb-4">
        {product.name}
      </h1>

      {/* Rating & Views */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-1 sm:gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={`sm:w-4 sm:h-4 ${
                  star <= Math.round(product.rating || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-900">
            {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
          </span>
          <span className="text-xs sm:text-sm text-neutral-500">
            ({product.reviewCount || 0})
          </span>
        </button>
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-neutral-500">
          <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>{viewingCount} viewing now</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tabular-nums">
          {formatPrice(displayPrice)}
        </span>
        {comparePrice && comparePrice > displayPrice && (
          <>
            <span className="text-sm sm:text-base lg:text-lg text-neutral-400 line-through tabular-nums">
              {formatPrice(comparePrice)}
            </span>
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg">
              Save {discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Attribute Selectors */}
      {product.attributes && product.attributes.length > 0 && (
        <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
          {product.attributes.map((attr) => {
            const isColor = attr.name.toLowerCase() === 'color';
            const isSize = attr.name.toLowerCase() === 'size';
            const selectedVal = selectedAttributes[attr.name];

            return (
              <div key={attr.name}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-xs sm:text-sm font-semibold text-neutral-900">
                    {attr.name}: <span className="font-normal text-neutral-600">{selectedVal}</span>
                  </p>
                  {isSize && product.sizeGuide && Object.keys(product.sizeGuide).length > 0 && (
                    <button className="text-[10px] sm:text-xs text-neutral-500 underline hover:text-neutral-900 transition-colors">
                      Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {attr.values.map((val) => {
                    const valIsHex = isColor && isHex(val);
                    const isSelected = selectedVal === val;

                    if (isColor) {
                      return (
                        <motion.button
                          key={val}
                          onClick={() => updateAttribute(attr.name, val)}
                          title={val}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 ${
                            isSelected
                              ? 'ring-2 ring-offset-2 ring-neutral-900'
                              : 'ring-1 ring-neutral-200 hover:ring-neutral-400'
                          }`}
                          style={valIsHex ? { backgroundColor: val } : undefined}
                        >
                          {!valIsHex && (
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: val.toLowerCase().replace(/\s+/g, '') }}
                            />
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={14} className="sm:w-4 sm:h-4 text-white drop-shadow-md" />
                            </div>
                          )}
                        </motion.button>
                      );
                    }

                    return (
                      <motion.button
                        key={val}
                        onClick={() => updateAttribute(attr.name, val)}
                        whileTap={{ scale: 0.97 }}
                        className={`px-3 sm:px-5 py-2 sm:py-2.5 min-w-[2.5rem] sm:min-w-[3rem] text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {val}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Status */}
      {currentStock <= 5 && currentStock > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl mb-4 sm:mb-6"
        >
          <Sparkles size={14} className="sm:w-4 sm:h-4 text-amber-600" />
          <span className="text-xs sm:text-sm font-medium text-amber-800">
            Only {currentStock} left in stock - order soon!
          </span>
        </motion.div>
      )}
      {currentStock === 0 && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
          <Package size={14} className="sm:w-4 sm:h-4 text-red-600" />
          <span className="text-xs sm:text-sm font-medium text-red-800">
            Currently out of stock
          </span>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div ref={ctaRef} className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {/* Quantity Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm font-medium text-neutral-700">Quantity:</span>
          <div className="flex items-center border border-neutral-200 rounded-lg sm:rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={14} className="sm:w-4 sm:h-4" />
            </button>
            <span className="w-10 sm:w-12 text-center text-xs sm:text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || isLoading}
            isLoading={isLoading}
            className="flex-1 h-11 sm:h-12 lg:h-14 text-xs sm:text-sm lg:text-base font-semibold rounded-lg sm:rounded-xl"
          >
            <span className="hidden xs:inline">Add to Cart - {formatPrice(displayPrice * quantity)}</span>
            <span className="xs:hidden">Add - {formatPrice(displayPrice * quantity)}</span>
          </Button>
          <Button
            onClick={handleWishlist}
            variant="outline"
            className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 p-0 rounded-lg sm:rounded-xl flex-shrink-0 ${
              wishlisted ? 'border-red-200 text-red-500 bg-red-50' : ''
            }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} className={`sm:w-5 sm:h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 p-0 rounded-lg sm:rounded-xl flex-shrink-0 hidden xs:flex"
            aria-label="Share product"
          >
            <Share2 size={18} className="sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-neutral-50 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm mb-1.5 sm:mb-2">
            <Truck size={14} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
          </div>
          <p className="text-[9px] sm:text-[11px] font-medium text-neutral-600">Free Shipping</p>
          <p className="text-[8px] sm:text-[10px] text-neutral-400 hidden xs:block">Over PKR 5,000</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm mb-1.5 sm:mb-2">
            <RotateCcw size={14} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
          </div>
          <p className="text-[9px] sm:text-[11px] font-medium text-neutral-600">Easy Returns</p>
          <p className="text-[8px] sm:text-[10px] text-neutral-400 hidden xs:block">{settings?.returnPolicyDays || 30} Days</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm mb-1.5 sm:mb-2">
            <ShieldCheck size={14} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
          </div>
          <p className="text-[9px] sm:text-[11px] font-medium text-neutral-600">Secure Payment</p>
          <p className="text-[8px] sm:text-[10px] text-neutral-400 hidden xs:block">100% Protected</p>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="border-t border-neutral-100">
        {accordionSections.map((section) => (
          <div key={section.id} className="border-b border-neutral-100">
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between py-3 sm:py-4 text-left"
            >
              <span className="text-xs sm:text-sm font-semibold text-neutral-900">{section.title}</span>
              <motion.div
                animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="sm:w-[18px] sm:h-[18px] text-neutral-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-3 sm:pb-4">
                    {section.id === 'specifications' && Array.isArray(section.content) ? (
                      <div className="space-y-1.5 sm:space-y-2">
                        {(section.content as { key: string; value: string }[]).map((spec, i) => (
                          <div key={i} className="flex text-xs sm:text-sm">
                            <span className="w-24 sm:w-32 flex-shrink-0 font-medium text-neutral-600">{spec.key}</span>
                            <span className="text-neutral-700">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {section.content as string}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Verified Buyer Review Button */}
      {canReview && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-amber-900">You purchased this product</p>
            <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5">
              {hasReviewed ? 'Thanks for your review!' : 'Share your experience to help others.'}
            </p>
          </div>
          {hasReviewed ? (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-semibold">
              <Check size={14} />
              Reviewed
            </div>
          ) : (
            <Button
              onClick={() => setReviewModalOpen(true)}
              size="sm"
              className="rounded-xl"
            >
              <Star size={14} className="fill-current" />
              Write Review
            </Button>
          )}
        </div>
      )}

      {/* Sticky buy bar */}
      <StickyBuyBar
        productName={product.name}
        price={displayPrice}
        image={displayImages[0] || product.images[0] || ''}
        stock={currentStock}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        triggerRef={ctaRef}
      />

      {/* Review Modal */}
      {reviewModalOpen && (
        <ReviewModal
          productId={product.id}
          productName={product.name}
          productImage={product.images[0] || ''}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            setHasReviewed(true);
            setReviewModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
