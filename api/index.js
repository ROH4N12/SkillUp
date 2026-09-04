import app from '../server/app.js';
import connectDB from '../server/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB in serverless function:', error);
  }
  return app(req, res);
}
