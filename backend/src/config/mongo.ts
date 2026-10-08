import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable buffering so Mongoose calls instantly fail-fast if DB is offline instead of hanging
mongoose.set('bufferCommands', false);

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/paypulse_audit';

export const connectMongo = async () => {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ MongoDB Connected via Mongoose (Audit Log Store)');
  } catch (error) {
    console.warn('⚠️ MongoDB connection unavailable. Running in graceful offline audit mode.');
  }
};
