import mongoose from "mongoose";
import { env } from "../utils/env";

async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("> Database connected");
  } catch (error) {
    console.error("[DB] Error connecting to database:", error);
    process.exit(1);
  }
}

export { connectDB };
