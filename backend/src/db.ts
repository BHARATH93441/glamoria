import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || "glamoria";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB, serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log(`✅ MongoDB connected — db: ${MONGODB_DB}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", (err as Error).message);
    console.log("🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/)...");
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/", { dbName: MONGODB_DB, serverSelectionTimeoutMS: 3000 });
      isConnected = true;
      console.log(`✅ MongoDB connected locally — db: ${MONGODB_DB}`);
    } catch (localErr) {
      console.error("❌ Local MongoDB fallback failed:", (localErr as Error).message);
      console.error("💡 Make sure your IP is whitelisted in MongoDB Atlas Network Access, or that a local MongoDB service is running.");
    }
  }
}
