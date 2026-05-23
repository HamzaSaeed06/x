import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useRouter } from '@/hooks/useNextRouter';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { StoreSettings } from '@/types';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [freeThreshold, setFreeThreshold] = useState(5000);
  const [shippingCost, setShippingCost] = useState(299);

  useEffect(() => {
    api.get<Partial<StoreSettings>>('/settings').then((s) => {
      if (s.freeDeliveryThreshold) setFreeThreshold(s.freeDeliveryThreshold);
      if (s.standardShippingCost) setShippingCost(s.standardShippingCost);
    }).catch(() => {});
  }, []);

  const subtotal = total();
  const remaining = Math.max(0, freeThreshold - subtotal);
  const progressPct = Math.min(100, (subtotal / freeThreshold) * 100);
  const isFreeShipping = subtotal >= freeThreshold;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center">
        <ShoppingCart size={48} className="sm:w-16 sm:h-16 mx-auto text-[var(--neutral-200)] mb-4 sm:mb-6" strokeWidth={1} />
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight mb-3 sm:mb-4">Your Basket is Empty</h1>
        <p className="text-sm sm:text-base text-[var(--neutral-500)] mb-6 sm:mb-8">Add some items to get started.</p>
        <Button asChild variant="hero-cta" className="w-full xs:w-auto">
          <Link href="/products">
            Start Shopping <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black tracking-tight">
          Your Basket <span className="text-[var(--neutral-400)] font-medium">({items.length})</span>
        </h1>
        <Button onClick={clearCart} variant="text-link" className="self-start xs:self-auto">
          Clear All
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-neutral-900 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <Link href={`/products/${item.productId}`} className="w-20 h-20 sm:w-24 sm:h-24 relative bg-white flex-shrink-0 rounded-none border-2 border-neutral-900 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <h3 className="text-[13px] sm:text-[14px] font-bold text-black tracking-tight line-clamp-2 sm:line-clamp-1">{item.name}</h3>
                  <Button 
                    onClick={() => removeItem(item.productId, item.variantId)} 
                    variant="ghost" 
                    size="icon"
                    className="text-[var(--neutral-300)] hover:text-black flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9" 
                    aria-label="Remove"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} />
                  </Button>
                </div>
                {item.variant && <p className="text-[11px] sm:text-[12px] text-[var(--neutral-500)] mt-0.5 sm:mt-1">{item.variant}</p>}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mt-2 sm:mt-3">
                  <div className="flex items-center">
                    <button 
                      onClick={() => updateQty(item.productId, item.qty - 1, item.variantId)} 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-neutral-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center p-0 font-bold transition-all text-neutral-900"
                    >
                      <Minus size={10} className="sm:w-3 sm:h-3" />
                    </button>
                    <span className="px-3 sm:px-5 text-[13px] sm:text-[14px] font-extrabold tabular-nums border-y-2 border-neutral-900 h-8 sm:h-[36px] flex items-center bg-white">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)} 
                      disabled={item.qty >= item.stock}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-neutral-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center p-0 font-bold transition-all text-neutral-900 disabled:opacity-45"
                    >
                      <Plus size={10} className="sm:w-3 sm:h-3" />
                    </button>
                  </div>
                  <span className="text-[14px] sm:text-[16px] font-extrabold text-black tabular-nums">{formatPrice(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 h-fit space-y-3 sm:space-y-4 lg:sticky lg:top-24 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <h2 className="text-[13px] sm:text-[14px] font-bold text-black">Order Summary</h2>

          {/* Free Delivery Progress Bar */}
          <div className="bg-neutral-50 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-3.5 rounded-none">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 text-green-600">
                <Package size={14} className="sm:w-[15px] sm:h-[15px] flex-shrink-0" />
                <span className="text-[12px] sm:text-[13px] font-bold">You qualify for FREE delivery!</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-[12px] text-gray-500 font-medium">
                    Add <span className="font-bold text-black">{formatPrice(remaining)}</span> for free delivery
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-400">{Math.round(progressPct)}%</span>
                </div>
                <div className="h-2 sm:h-2.5 bg-neutral-200 border border-neutral-900 rounded-none overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-none transition-all duration-700 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2 border-b border-[var(--border-default)] pb-3 sm:pb-4 max-h-40 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-[12px] sm:text-[13px]">
                <span className="text-[var(--neutral-500)] truncate max-w-[120px] sm:max-w-[160px]">{item.name} x{item.qty}</span>
                <span className="font-medium tabular-nums">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[12px] sm:text-[13px] font-bold">
            <span className="text-[var(--neutral-500)]">Delivery</span>
            <span className={isFreeShipping ? 'text-green-600 font-extrabold' : ''}>
              {isFreeShipping ? 'FREE' : formatPrice(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between text-[16px] sm:text-[18px] font-extrabold text-black tracking-tighter border-t border-[var(--border-default)] pt-3 sm:pt-4">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(isFreeShipping ? subtotal : subtotal + shippingCost)}</span>
          </div>
          <Button 
            onClick={handleCheckout} 
            className="w-full h-11 sm:h-12 text-[13px] sm:text-sm bg-neutral-900 text-white border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none font-bold gap-2 flex items-center justify-center transition-all"
          >
            Proceed to Checkout <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </Button>
          <Button asChild variant="link" className="w-full text-center py-1.5 sm:py-2 h-auto text-[12px] sm:text-[13px]">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
