import mongoose, { Schema, type Document } from 'mongoose';

const ReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  body: { type: String, required: true },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpful: { type: Number, default: 0 },
  unhelpful: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  isApproved: boolean;
  createdAt: Date;
}

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
