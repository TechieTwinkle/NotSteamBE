// db.js - CLEAN VERSION
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected ✓");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Remove process.exit(1) — it crashes nodemon loop
    setTimeout(connectDB, 5000); // retry after 5s instead
  }
};

module.exports = connectDB;