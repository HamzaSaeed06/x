import mongoose, { Schema, type Document } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  description: String,
  usedBy: [String],
}, { timestamps: true });

export interface ICoupon extends Document {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: Date;
  description?: string;
}

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
