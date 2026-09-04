import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillup';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In standard node environments, log; in serverless, don't exit process
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Continuing without active MongoDB connection (fallback mode)');
    }
  }

  return cached.conn;
};

export default connectDB;
