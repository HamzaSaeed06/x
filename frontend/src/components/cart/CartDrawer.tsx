import { Link } from 'wouter';
import { useRouter } from '@/hooks/useNextRouter';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCartStore();
  const { user } = useAuthStore();

  const cartTotal = total();
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      closeCart();
      router.push('/auth/login');
      return;
    }
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full xs:w-[360px] sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col safe-area-inset-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center justify-center">
                  <ShoppingBag size={18} className="sm:w-5 sm:h-5 text-neutral-700" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                    Shopping Cart
                  </h2>
                  <p className="text-[10px] sm:text-xs text-neutral-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeCart} 
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-neutral-100 border-2 border-transparent hover:border-neutral-900 rounded-none transition-colors" 
                aria-label="Close cart"
              >
                <X size={18} className="sm:w-5 sm:h-5 text-neutral-600" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 border-b border-neutral-100">
                {remainingForFreeShipping > 0 ? (
                  <>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-1.5 sm:mb-2">
                      <Truck size={14} className="sm:w-4 sm:h-4 text-neutral-500" />
                      <span className="text-neutral-600">
                        Add <span className="font-semibold text-neutral-900">{formatPrice(remainingForFreeShipping)}</span> for free shipping
                      </span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${freeShippingProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-neutral-900 rounded-full"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-700">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck size={12} className="sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span className="font-medium">You qualify for free shipping!</span>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <ShoppingBag size={28} className="sm:w-8 sm:h-8 text-neutral-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1.5 sm:mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6 max-w-[180px] sm:max-w-[200px]">
                    Looks like you haven&apos;t added anything yet.
                  </p>
                  <Button asChild onClick={closeCart} size="sm" className="h-9 sm:h-10 text-xs sm:text-sm">
                    <Link href="/products">
                      Start Shopping
                      <ArrowRight size={14} className="sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${item.variantId}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-white border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-neutral-900 rounded-none overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-1">
                              {item.name}
                            </h3>
                            {item.variant && (
                              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                                {item.variant}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          {/* Quantity Control */}
                          <div className="flex items-center bg-white border-2 border-neutral-900 rounded-none">
                            <button
                              onClick={() => updateQty(item.productId, item.qty - 1, item.variantId)}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-40"
                              disabled={item.qty <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                            <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-semibold tabular-nums">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)}
                              disabled={item.qty >= item.stock}
                              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                          
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 tabular-nums">
                            {formatPrice(item.price * item.qty)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white safe-area-inset-bottom">
                {/* Promo Code */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag size={14} className="sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm border-2 border-neutral-900 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
                    Apply
                  </Button>
                </div>

                {/* Summary */}
                <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-medium text-neutral-900 tabular-nums">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    <span className={`font-medium ${remainingForFreeShipping === 0 ? 'text-green-600' : 'text-neutral-900'}`}>
                      {remainingForFreeShipping === 0 ? 'Free' : 'Calculated at checkout'}
                    </span>
                  </div>
                  <div className="h-px bg-neutral-100 my-2 sm:my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-bold text-neutral-900">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-neutral-900 tabular-nums">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button 
                  onClick={handleCheckout} 
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl"
                >
                  Checkout
                  <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] ml-1.5 sm:ml-2" />
                </Button>

                <p className="text-center text-[10px] sm:text-xs text-neutral-500">
                  Secure checkout powered by trusted payment providers
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
