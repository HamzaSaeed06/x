import mongoose, { Schema, type Document } from 'mongoose';

const AddressSchema = new Schema({
  label: String,
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  province: String,
  postalCode: String,
  country: { type: String, default: 'Pakistan' },
}, { _id: false });

const OrderItemSchema = new Schema({
  productId: String,
  name: String,
  price: Number,
  image: String,
  qty: Number,
  variant: String,
  attributes: Schema.Types.Mixed,
}, { _id: false });

const StatusUpdateSchema = new Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: String,
}, { _id: false });

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  guestEmail: { type: String, default: null },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: String,
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'wallet', 'jazzcash', 'easypaisa', 'stripe'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentIntentId: String,
  address: AddressSchema,
  timeline: [StatusUpdateSchema],
  invoiceUrl: String,
  notes: String,
  trackingNumber: String,
  courier: String,
}, { timestamps: true });

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  guestEmail: string | null;
  items: unknown[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  address: unknown;
  timeline: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
