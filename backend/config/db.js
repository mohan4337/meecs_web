const mongoose = require("mongoose");

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  // Return cached connection if already connected
  if (cachedConnection) {
    return cachedConnection;
  }

  // If a connection is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start new connection
  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    family: 4,
    // Connection pooling for serverless
    maxPoolSize: 10,
    minPoolSize: 1
  });

  try {
    await connectionPromise;
    console.log("✅ MongoDB Connected");
    cachedConnection = mongoose.connection;
    
    // Reset connectionPromise but keep cachedConnection
    connectionPromise = null;
    
    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // Reset promise on failure
    connectionPromise = null;
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
  cachedConnection = null;
});

// Export both function and state
module.exports = connectDB;
 