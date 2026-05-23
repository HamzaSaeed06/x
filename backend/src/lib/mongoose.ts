import mongoose from 'mongoose';
import { logger } from './logger';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn('MONGODB_URI not set — database features will be unavailable.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info('MongoDB connected');

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB error');
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
  }
}

export { mongoose };
