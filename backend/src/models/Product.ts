import mongoose, { Schema, type Document } from 'mongoose';

const VariantSchema = new Schema({
  id: String,
  sku: String,
  attributes: Schema.Types.Mixed,
  price: Number,
  comparePrice: Number,
  images: [String],
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const ProductSchema = new Schema({
  name: { type: String, required: true },
  brand: String,
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  material: String,
  price: { type: Number, required: true },
  comparePrice: Number,
  images: [String],
  colorImages: Schema.Types.Mixed,
  videoUrl: String,
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  tags: [String],
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  sold: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: Number,
  flashSaleEndsAt: Date,
  bundleIds: [String],
  weight: Number,
  dimensions: {
    l: Number,
    w: Number,
    h: Number,
  },
  hasVariants: { type: Boolean, default: false },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  attributes: [{
    name: String,
    values: [String],
  }],
  variants: [VariantSchema],
  sizeGuide: Schema.Types.Mixed,
  specifications: [{
    key: String,
    value: String,
  }],
}, { timestamps: true });

// Text search index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isFlashSale: 1, isActive: 1 });
ProductSchema.index({ sold: -1 });
ProductSchema.index({ createdAt: -1 });
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  brand?: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  tags: string[];
  stock: number;
  sold: number;
  views: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndsAt?: Date;
  hasVariants: boolean;
  variants?: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
