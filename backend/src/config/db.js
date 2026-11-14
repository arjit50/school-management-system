import 'dotenv/config';
import mongoose from 'mongoose';

async function dbConnect() {
  const mongoUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/school_db';
  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

export default dbConnect;
