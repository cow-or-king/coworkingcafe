/**
 * MongoDB connection utility
 * Optimized for serverless with connection pooling
 * Follows performance principles from consigne.md
 */

import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global connection cache for serverless optimization
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: GlobalMongoose;
}

let cached = globalThis.mongooseCache;

if (!cached) {
  cached = globalThis.mongooseCache = {
    conn: null,
    promise: null,
  };
}

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if no promise exists
  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    cached.conn = await cached.promise;
    // MongoDB connected successfully
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    // MongoDB connection error - re-throw for proper error handling
    throw error;
  }
}

export default connectDB;