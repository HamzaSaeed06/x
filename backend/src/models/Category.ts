import mongoose, { Schema, type Document } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  description: String,
}, { timestamps: true });

export interface ICategory extends Document {
  name: string;
  slug: string;
  image: string;
  icon: string;
  parentId: mongoose.Types.ObjectId | null;
  order: number;
  isActive: boolean;
}

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
