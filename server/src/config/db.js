const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/scribble3d";
  try {
    await mongoose.connect(uri);
    console.log("[db] MongoDB connected:", uri);
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    console.error("[db] The server will keep running, but scenes will not persist.");
  }
}

module.exports = connectDB;
