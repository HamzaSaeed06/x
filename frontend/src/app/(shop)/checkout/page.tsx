import { useState, useEffect } from 'react';
import { useRouter } from '@/hooks/useNextRouter';
import { Link } from 'wouter';
import { ArrowLeft, Truck, CreditCard, Wallet, CheckCircle2, Loader2, Lock, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatters';
import { createOrder } from '@/lib/services/orderService';
import { createNotification } from '@/lib/services/notificationService';
import { api } from '@/lib/api';
import type { Address, StoreSettings } from '@/types';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PaymentMethod = 'cod' | 'card' | 'wallet';

const defaultAddress: Omit<Address, 'id' | 'isDefault'> = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Pakistan',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [address, setAddress] = useState(defaultAddress);
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(5000);
  const [standardShippingCost, setStandardShippingCost] = useState(299);

  useEffect(() => {
    api.get<Partial<StoreSettings>>('/settings').then((s) => {
      if (s.freeDeliveryThreshold) setFreeDeliveryThreshold(s.freeDeliveryThreshold);
      if (s.standardShippingCost) setStandardShippingCost(s.standardShippingCost);
    }).catch(() => {});
  }, []);

  const subtotal = total();
  const shipping = subtotal >= freeDeliveryThreshold ? 0 : standardShippingCost;
  const grandTotal = subtotal + shipping;

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const required: (keyof typeof address)[] = ['fullName', 'phone', 'line1', 'city', 'province', 'postalCode'];
    for (const field of required) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^03\d{9}$/.test(address.phone)) {
      toast.error('Phone must be a valid Pakistani number (03XXXXXXXXX)');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const fullAddress: Address = { ...address, id: crypto.randomUUID(), isDefault: false };
      const orderId = await createOrder({
        userId: user.uid,
        items,
        address: fullAddress,
        paymentMethod: payment,
      });

      // Notify user that order was placed
      createNotification({
        targetUserId: user.uid,
        type: 'order',
        title: 'Order Placed Successfully!',
        message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been placed. We'll notify you when it's confirmed.`,
        link: `/account/orders/${orderId}`,
      }).catch(() => {});

      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Package size={28} className="sm:w-8 sm:h-8 text-neutral-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
        <p className="text-neutral-500 text-sm mb-6">Add some products to your cart first.</p>
        <Button onClick={() => router.push('/products')} className="inline-flex items-center">
          Shop Now
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10">
        <Link href="/cart" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[12px] font-bold text-neutral-400 hover:text-black transition-colors">
          <ArrowLeft size={12} className="sm:w-3.5 sm:h-3.5" /> Back to Cart
        </Link>
        <div className="hidden sm:block flex-1 h-px bg-neutral-200" />
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">

          {/* Delivery Address */}
          <section>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Truck size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
              <h2 className="text-xs sm:text-[14px] font-bold">Delivery Address</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {([ 
                { name: 'fullName',   label: 'Full Name',    placeholder: 'Ahmed Ali' },
                { name: 'phone',      label: 'Phone',        placeholder: '03001234567' },
                { name: 'line1',      label: 'Address Line 1', placeholder: 'House / Street', span: true },
                { name: 'line2',      label: 'Address Line 2 (optional)', placeholder: 'Apartment, Floor...', span: true },
                { name: 'city',       label: 'City',         placeholder: 'Karachi' },
                { name: 'province',   label: 'Province',     placeholder: 'Sindh' },
                { name: 'postalCode', label: 'Postal Code',  placeholder: '75500' },
              ] as const).map(({ name, label, placeholder, span }) => (
                <div key={name} className={span ? 'sm:col-span-2' : ''}>
                  <Input
                    label={label}
                    name={name}
                    value={(address as any)[name]}
                    onChange={handleField}
                    placeholder={placeholder}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />
              <h2 className="text-xs sm:text-[14px] font-bold">Payment Method</h2>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-4">
              {([
                { id: 'cod',    label: 'Cash on Delivery', icon: Truck },
                { id: 'card',   label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPayment(id)}
                  className={`flex flex-row xs:flex-col items-center xs:justify-center gap-2 sm:gap-2 p-3 sm:p-5 border-2 border-neutral-900 text-left xs:text-center transition-all rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                    payment === id
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0'
                      : 'bg-white text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-[10px] sm:text-[12px] font-bold">{label}</span>
                </button>
              ))}
            </div>
            {payment === 'card' && (
              <p className="mt-3 sm:mt-4 text-[10px] sm:text-[12px] text-neutral-900 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4 bg-amber-50">
                <Lock size={12} className="inline mr-1.5 mb-0.5" />
                Secure card processing coming soon. Use COD for now.
              </p>
            )}
          </section>
        </div>

        {/* Right: Summary */}
        <div className="border-2 border-neutral-900 bg-white p-4 sm:p-6 h-fit lg:sticky lg:top-24 space-y-4 sm:space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <h2 className="text-xs sm:text-[14px] font-bold">Order Summary</h2>

          {/* Items */}
          <div className="space-y-2.5 sm:space-y-3 border-b border-neutral-100 pb-4 sm:pb-5 max-h-[200px] overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 relative border border-neutral-100 flex-shrink-0 bg-neutral-50 rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-bold text-black truncate">{item.name}</p>
                  <p className="text-[9px] sm:text-[11px] text-neutral-500">x{item.qty}</p>
                </div>
                <span className="text-[11px] sm:text-[13px] font-bold tabular-nums">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-[13px]">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span className={`font-medium tabular-nums ${shipping === 0 ? 'text-green-600' : ''}`}>
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-base sm:text-[18px] font-extrabold text-black tracking-tighter border-t border-neutral-100 pt-3 sm:pt-4 mb-3 sm:mb-4">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(grandTotal)}</span>
          </div>

          <Button 
            onClick={handlePlaceOrder} 
            disabled={loading} 
            isLoading={loading}
            className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-lg sm:rounded-xl"
          >
            <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px] mr-1.5 sm:mr-2" /> Place Order
          </Button>

          <p className="text-[9px] sm:text-[11px] text-center text-neutral-400 mt-3 sm:mt-4">
            By placing your order you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
