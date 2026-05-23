import { useState, useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useParams } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProviders } from '@/providers/AppProviders';
import { Loader2 } from 'lucide-react';

import NotFound from '@/app/not-found';

// Layouts
import ShopLayout from '@/app/(shop)/layout';
import AdminLayout from '@/app/admin/layout';

// Shop pages (client components)
import HomePage from '@/app/(shop)/page';
import CartPage from '@/app/(shop)/cart/page';
import CheckoutPage from '@/app/(shop)/checkout/page';
import WishlistPage from '@/app/(shop)/wishlist/page';
import AccountOrdersPage from '@/app/(shop)/account/orders/page';
import AccountProfilePage from '@/app/(shop)/account/profile/page';
import OrderConfirmationClient from '@/app/(shop)/order-confirmation/OrderConfirmationClient';
import { ProductsClient } from '@/app/(shop)/products/ProductsClient';
import { ProductPageClient } from '@/app/(shop)/products/[slug]/ProductPageClient';

// Auth pages
import LoginPage from '@/app/auth/login/page';
import SignupPage from '@/app/auth/signup/page';
import ForgotPasswordPage from '@/app/auth/forgot-password/page';

// Admin pages
import AdminDashboard from '@/app/admin/page';
import AdminProductsPage from '@/app/admin/products/page';
import AdminNewProductPage from '@/app/admin/products/new/page';
import AdminOrdersPage from '@/app/admin/orders/page';
import AdminUsersPage from '@/app/admin/users/page';
import AdminAnalyticsPage from '@/app/admin/analytics/page';
import AdminCouponsPage from '@/app/admin/coupons/page';
import AdminSettingsPage from '@/app/admin/settings/page';

// Services for route-level data fetching
import { getProductBySlug, getProducts } from '@/lib/services/productService';
import { getStoreSettings } from '@/lib/services/storeSettingsService';
import { getOrderById } from '@/lib/services/orderService';
import type { Product, StoreSettings, Order } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

// ─── Route-level data wrappers ───────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)]" />
    </div>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sp = new URLSearchParams(window.location.search);
  const category = sp.get('category') ?? undefined;
  const sort = sp.get('sort') ?? undefined;
  const q = sp.get('q') ?? undefined;

  useEffect(() => {
    setLoading(true);
    getProducts({ category, sort, pageSize: 24, q })
      .then(({ products }) => setProducts(products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, q]);

  return (
    <ProductsClient
      products={products}
      initialCategory={category}
      initialSort={sort}
      query={q}
    />
  );
}

function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProductBySlug(slug), getStoreSettings()])
      .then(([p, s]) => { setProduct(p); setSettings(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Spinner />;
  if (!product)
    return <div className="text-center py-24 text-[var(--text-muted)]">Product not found.</div>;
  return <ProductPageClient product={product} settings={settings ?? undefined} />;
}

function AccountOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.orderId) return;
    getOrderById(params.orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [params.orderId]);

  if (loading) return <Spinner />;
  if (!order) return <div className="text-center py-24 text-[var(--text-muted)]">Order not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Status</span>
          <span className="font-medium capitalize">{order.status}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Total</span>
          <span className="font-medium">PKR {order.total?.toLocaleString()}</span>
        </div>
        {order.items?.map((item, i) => (
          <div key={i} className="flex gap-3 border-t pt-4">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-[var(--neutral-100)]" />
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-[var(--text-muted)]">Qty: {item.qty} · PKR {item.price?.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Layout HOCs ─────────────────────────────────────────────────────────────

function withShop<P extends object>(Comp: React.ComponentType<P>) {
  return function ShopRouteWrapper(props: P) {
    return <ShopLayout><Comp {...props} /></ShopLayout>;
  };
}

function withAdmin<P extends object>(Comp: React.ComponentType<P>) {
  return function AdminRouteWrapper(props: P) {
    return <AdminLayout><Comp {...props} /></AdminLayout>;
  };
}

// ─── Pre-built route components ──────────────────────────────────────────────

const ShopHome = withShop(HomePage);
const ShopProducts = withShop(ProductsPage);
const ShopProductDetail = withShop(ProductDetailPage);
const ShopCart = withShop(CartPage);
const ShopCheckout = withShop(CheckoutPage);
const ShopOrderConfirmation = withShop(OrderConfirmationClient as React.ComponentType);
const ShopAccountOrders = withShop(AccountOrdersPage);
const ShopAccountOrderDetail = withShop(AccountOrderDetailPage);
const ShopAccountProfile = withShop(AccountProfilePage);
const ShopWishlist = withShop(WishlistPage);

const AdminDash = withAdmin(AdminDashboard);
const AdminProducts = withAdmin(AdminProductsPage);
const AdminNewProduct = withAdmin(AdminNewProductPage);
const AdminOrders = withAdmin(AdminOrdersPage);
const AdminUsers = withAdmin(AdminUsersPage);
const AdminAnalytics = withAdmin(AdminAnalyticsPage);
const AdminCoupons = withAdmin(AdminCouponsPage);
const AdminSettings = withAdmin(AdminSettingsPage);

function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const [Comp, setComp] = useState<React.ComponentType<{ id?: string }> | null>(null);

  useEffect(() => {
    import('@/app/admin/products/[id]/edit/page').then((m) =>
      setComp(() => m.default as React.ComponentType<{ id?: string }>)
    );
  }, []);

  if (!Comp) return <Spinner />;
  return <AdminLayout><Comp id={params.id} /></AdminLayout>;
}

function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const [Comp, setComp] = useState<React.ComponentType<{ orderId?: string }> | null>(null);

  useEffect(() => {
    import('@/app/admin/orders/[orderId]/page').then((m) =>
      setComp(() => m.default as React.ComponentType<{ orderId?: string }>)
    );
  }, []);

  if (!Comp) return <Spinner />;
  return <AdminLayout><Comp orderId={params.orderId} /></AdminLayout>;
}

// ─── Router ──────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      {/* Shop routes */}
      <Route path="/" component={ShopHome} />
      <Route path="/products" component={ShopProducts} />
      <Route path="/products/:slug" component={ShopProductDetail} />
      <Route path="/cart" component={ShopCart} />
      <Route path="/checkout" component={ShopCheckout} />
      <Route path="/order-confirmation" component={ShopOrderConfirmation} />
      <Route path="/account/orders" component={ShopAccountOrders} />
      <Route path="/account/orders/:orderId" component={ShopAccountOrderDetail} />
      <Route path="/account/profile" component={ShopAccountProfile} />
      <Route path="/wishlist" component={ShopWishlist} />

      {/* Auth routes */}
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/signup" component={SignupPage} />
      <Route path="/auth/forgot-password" component={ForgotPasswordPage} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDash} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={AdminNewProduct} />
      <Route path="/admin/products/:id/edit" component={AdminEditProductPage} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/orders/:orderId" component={AdminOrderDetailPage} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </AppProviders>
    </QueryClientProvider>
  );
}
