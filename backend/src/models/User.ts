import mongoose, { Schema, type Document } from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new Schema({
  id: String,
  label: String,
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  province: String,
  postalCode: String,
  country: { type: String, default: 'Pakistan' },
  isDefault: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  name: { type: String, required: true },
  displayName: { type: String },
  photoURL: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String, default: '' },
  loyaltyPoints: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  preferredCategories: [String],
  addresses: [AddressSchema],
  isActive: { type: Boolean, default: true },
  fcmToken: String,
  wishlist: [String],
  cart: [{ type: Schema.Types.Mixed }],
  googleId: { type: String, default: '' },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password as string, 12);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password as string);
};

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  displayName?: string;
  photoURL: string;
  role: 'user' | 'admin';
  phone: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  preferredCategories: string[];
  addresses: unknown[];
  isActive: boolean;
  wishlist: string[];
  cart: unknown[];
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export const User = mongoose.model<IUser>('User', UserSchema);
