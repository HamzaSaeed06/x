import mongoose, { Schema, type Document } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'promo', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<Document>('Notification', NotificationSchema);
