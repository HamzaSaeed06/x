import { api } from '@/lib/api';
import type { StoreSettings } from '@/types';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Zest & Partners',
  storeTagline: 'Editorial E-Commerce',
  freeDeliveryThreshold: 5000,
  standardShippingCost: 299,
  returnPolicyDays: 30,
  returnPolicy: '30-day hassle-free returns on all unused items.',
  warrantyPolicy: '1-year manufacturer warranty on all products.',
  deliveryEstimate: '3–5 working days',
  announcementBar: 'Free delivery on orders over PKR 5,000!',
  announcementBarActive: true,
  banners: [
    {
      id: 'default-1',
      title: 'Curated Excellence',
      subtitle: 'Editorial products for the modern lifestyle.',
      ctaText: 'Explore Collection',
      ctaLink: '/products',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400',
      isActive: true,
      order: 0,
    },
  ],
  flashSaleBannerTitle: 'Flash Sale: Up to 70% Off',
  flashSaleBannerSubtitle: 'Grab these deals before they are gone!',
  flashSaleBannerActive: true,
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  paymentMethods: {
    cod: true,
    stripe: false,
    jazzcash: false,
    easypaisa: false,
  },
} as StoreSettings;

let cachedSettings: StoreSettings | null = null;

export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (cachedSettings) return cachedSettings;
  try {
    const data = await api.get<StoreSettings>('/settings');
    cachedSettings = { ...DEFAULT_SETTINGS, ...data };
    return cachedSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const updateStoreSettings = async (
  data: Partial<StoreSettings>
): Promise<StoreSettings> => {
  cachedSettings = null;
  return api.patch<StoreSettings>('/admin/settings', data);
};
