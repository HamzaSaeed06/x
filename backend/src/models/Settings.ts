import mongoose, { Schema, type Document } from 'mongoose';

const BannerSchema = new Schema({
  id: String,
  title: String,
  subtitle: String,
  ctaText: String,
  ctaLink: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { _id: false });

const SettingsSchema = new Schema({
  _key: { type: String, default: 'store', unique: true },
  storeName: { type: String, default: 'Zest & Partners' },
  storeTagline: { type: String, default: 'Editorial E-Commerce' },
  storeLogo: String,
  storeFavicon: String,
  storeEmail: String,
  storePhone: String,
  storeAddress: String,
  freeDeliveryThreshold: { type: Number, default: 5000 },
  standardShippingCost: { type: Number, default: 299 },
  returnPolicyDays: { type: Number, default: 30 },
  returnPolicy: { type: String, default: '30-day hassle-free returns on all unused items.' },
  warrantyPolicy: { type: String, default: '1-year manufacturer warranty on all products.' },
  deliveryEstimate: { type: String, default: '3–5 working days' },
  announcementBar: { type: String, default: 'Free delivery on orders over PKR 5,000!' },
  announcementBarActive: { type: Boolean, default: true },
  banners: [BannerSchema],
  flashSaleBannerTitle: { type: String, default: 'Flash Sale: Up to 70% Off' },
  flashSaleBannerSubtitle: String,
  flashSaleBannerActive: { type: Boolean, default: true },
  socialFacebook: String,
  socialInstagram: String,
  socialTwitter: String,
  socialYoutube: String,
  socialTiktok: String,
  paymentMethods: {
    cod: { type: Boolean, default: true },
    stripe: { type: Boolean, default: false },
    jazzcash: { type: Boolean, default: false },
    easypaisa: { type: Boolean, default: false },
  },
  maintenanceMode: { type: Boolean, default: false },
  taxRate: { type: Number, default: 0 },
  currency: { type: String, default: 'PKR' },
}, { timestamps: true });

export interface ISettings extends Document {
  storeName: string;
  freeDeliveryThreshold: number;
  standardShippingCost: number;
  returnPolicyDays: number;
  announcementBar: string;
  announcementBarActive: boolean;
  banners: unknown[];
  paymentMethods: {
    cod: boolean;
    stripe: boolean;
    jazzcash: boolean;
    easypaisa: boolean;
  };
}

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
