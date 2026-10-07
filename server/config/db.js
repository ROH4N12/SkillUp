import mongoose from 'mongoose';

const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    const errorMsg = 'MONGO_URI environment variable is not configured in Vercel. Please add your MongoDB Atlas connection string in Vercel Project Settings -> Environment Variables.';
    console.error(errorMsg);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    }
    // Fallback for local development
    return mongoose.connect('mongodb://localhost:27017/skillup');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default connectDB;
