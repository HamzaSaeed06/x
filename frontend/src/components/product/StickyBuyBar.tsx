import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/utils/formatters';

export function StickyBuyBar({
  productName,
  price,
  image,
  stock,
  isLoading,
  onAddToCart,
  triggerRef,
}: {
  productName: string;
  price: number;
  image: string;
  stock: number;
  isLoading: boolean;
  onAddToCart: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-t border-gray-200 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 hidden sm:block">
              <img
                src={image}
                alt={productName}
                className="w-full h-full object-contain p-1 mix-blend-multiply"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black truncate leading-tight">{productName}</p>
              <p className="text-base font-extrabold text-black tabular-nums">{formatPrice(price)}</p>
            </div>
            <button
              onClick={onAddToCart}
              disabled={stock === 0 || isLoading}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 bg-black text-white text-[13px] font-bold rounded-xl hover:bg-gray-900 disabled:opacity-50 transition-all active:scale-95 flex-shrink-0 shadow-md"
            >
              {isLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <ShoppingBag size={14} />
              }
              {stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
