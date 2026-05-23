// Analytics Service - Respects user cookie preferences
const CONSENT_KEY = 'zest_cookie_consent';

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  essential: boolean;
}

function getConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed;
  } catch {
    return null;
  }
}

function canTrackAnalytics(): boolean {
  const consent = getConsent();
  return consent?.analytics ?? false;
}

function canTrackMarketing(): boolean {
  const consent = getConsent();
  return consent?.marketing ?? false;
}

function canSavePreferences(): boolean {
  const consent = getConsent();
  return consent?.preferences ?? false;
}

// Track page views
export function trackPageView(pageName: string, pageProperties?: Record<string, any>) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_path: window.location.pathname,
      ...pageProperties,
    });
  }
}

// Track custom events
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventData);
  }
}

// Track e-commerce events
export function trackAddToCart(productData: {
  productId: string;
  name: string;
  price: number;
  category?: string;
  quantity: number;
}) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'PKR',
      items: [
        {
          item_id: productData.productId,
          item_name: productData.name,
          price: productData.price,
          item_category: productData.category,
          quantity: productData.quantity,
        },
      ],
    });
  }
}

export function trackPurchase(orderData: {
  orderId: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
  tax?: number;
  shipping?: number;
}) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      currency: 'PKR',
      transaction_id: orderData.orderId,
      value: orderData.total,
      tax: orderData.tax ?? 0,
      shipping: orderData.shipping ?? 0,
      items: orderData.items.map(item => ({
        item_id: item.productId,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
        quantity: item.quantity,
      })),
    });
  }
}

export function trackProductView(productData: {
  productId: string;
  name: string;
  price: number;
  category?: string;
}) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'PKR',
      items: [
        {
          item_id: productData.productId,
          item_name: productData.name,
          price: productData.price,
          item_category: productData.category,
        },
      ],
    });
  }
}

// Marketing & Remarketing
export function trackSearch(searchQuery: string) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchQuery,
    });
  }
}

export function trackViewCart(cartValue: number, itemCount: number) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_cart', {
      currency: 'PKR',
      value: cartValue,
      items_count: itemCount,
    });
  }
}

// User behavior tracking
export function trackUserSignup(userId: string) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', {
      user_id: userId,
    });
    window.gtag('event', 'sign_up', {
      method: 'email',
    });
  }
}

export function trackUserLogin(userId: string) {
  if (!canTrackAnalytics()) return;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', {
      user_id: userId,
    });
    window.gtag('event', 'login', {
      method: 'email',
    });
  }
}

// Preference tracking (if user allows)
export function saveUserPreference(key: string, value: any) {
  if (!canSavePreferences()) return;
  
  try {
    const prefKey = `zest_pref_${key}`;
    localStorage.setItem(prefKey, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function getUserPreference(key: string) {
  if (!canSavePreferences()) return null;
  
  try {
    const prefKey = `zest_pref_${key}`;
    const stored = localStorage.getItem(prefKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Get user behavior data for personalization
export function getUserBehavior() {
  if (!canTrackAnalytics()) return null;
  
  try {
    return {
      recentSearches: JSON.parse(localStorage.getItem('zest_recent_searches') || '[]'),
      recentlyViewed: JSON.parse(localStorage.getItem('zest_recently_viewed') || '[]'),
      cartValue: localStorage.getItem('zest_cart'),
      lastVisit: localStorage.getItem('zest_last_visit'),
    };
  } catch {
    return null;
  }
}

// Initialize analytics only if user has consented
export function initializeAnalytics() {
  const consent = getConsent();
  if (!consent) return;
  
  // Load Google Analytics if available
  if (consent.analytics && typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID || ''}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GA_ID || '');
    
    (window as any).gtag = gtag;
  }
}

export { canTrackAnalytics, canTrackMarketing, canSavePreferences };
