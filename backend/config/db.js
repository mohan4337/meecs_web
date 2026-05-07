const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
  // If already connected in serverless environment, reuse connection
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    // Set mongoose connection options for serverless
    await mongoose.connect(process.env.MONGO_URI, {
      // These options help with serverless deployments
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log("✅ MongoDB Connected");
    cachedConnection = mongoose.connection;
    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

// Reset connection on unexpected close (for serverless)
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  cachedConnection = null;
});

module.exports = connectDB;
 