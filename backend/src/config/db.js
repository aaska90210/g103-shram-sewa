import mongoose from "mongoose";

// Connect to a persistent MongoDB. Fail fast if connection cannot be made.
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MONGO_URI is not defined in environment");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    console.log("Connection URI:", uri.split('@')[0] + "@..."); // log without password
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
