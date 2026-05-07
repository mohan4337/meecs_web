const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose"); // For DB status check

dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Middleware
const rateLimit = require("./middleware/rateLimit");
const logger = require("./middleware/logger");

const app = express();

// =================================
// REONSE TIMEOUT & BODY LIMITS
// =================================

// Increase JSON body limit for file uploads if needed
app.use(express.json({ 
  limit: '10mb',
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// =================================
// REQUEST LOGGING
// =================================
app.use(logger);

// =================================
// SECURITY HEADERS
// =================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// =================================
// CORS CONFIGURATION
// =================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://www.middleeastengg.com",
  "https://middleeastengg.com",
  "https://meecs-web.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn("CORS blocked origin:", origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// =================================
// RATE LIMITING
// =================================
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests. Please try again later."
}));

// =================================
// REQUEST TIMEOUT (30 seconds)
// =================================

app.use((req, res, next) => {
  req.setTimeout(25000, () => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        message: "Request timeout - server took too long to respond"
      });
    }
  });
  
  req.on('close', () => {
    if (!res.headersSent) {
      console.log('Request aborted by client');
    }
  });
  
  next();
});

// =================================
// HEALTH CHECK & WARMUP ENDPOINTS
// =================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Warmup endpoint for Vercel
app.get("/_vercel/warmup", (req, res) => {
  res.status(200).send("OK");
});

// Status endpoint with DB check
app.get("/api/status", (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      status: isConnected ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      db: isConnected ? "connected" : "disconnected",
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// =================================
// ROUTES
// =================================

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// Mount CORS preflight handler at the end to handle all routes
app.options('*', cors(corsOptions));

// =================================
// 404 HANDLER
// =================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
});

// =================================
// ERROR HANDLER
// =================================

app.use((err, req, res, next) => {
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection?.remoteAddress,
    timestamp: new Date().toISOString()
  });

  // Status code logic
  let statusCode = 500;
  if (err.status) {
    statusCode = err.status;
  } else if (res.statusCode !== 200 && res.statusCode !== 500) {
    statusCode = res.statusCode;
  }

  // Error message
  let message = err.message || "Internal Server Error";
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = "Validation failed";
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate entry";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err.message 
    }),
    timestamp: new Date().toISOString()
  });
});

// =================================
// UNHANDLED REJECTION HANDLER
// =================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// =================================
// DATABASE CONNECTION & SERVER START
// =================================

let server;

const startServer = async () => {
  try {
    await connectDB();
    
    // Only start HTTP server if not in serverless environment
    if (process.env.NODE_ENV !== 'serverless' && !module.hot) {
      const PORT = process.env.PORT || 5000;
      server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });

      // Handle server errors
      server.on('error', (error) => {
        console.error('Server error:', error);
      });
    } else {
      console.log('🚀 Server initialized (serverless mode)');
    }
  } catch (error) {
    console.error("Failed to start server:", error.message);
    // Exit on connection failure - Vercel will retry
    if (process.env.NODE_ENV !== 'serverless') {
      process.exit(1);
    }
  }
};

// Start server
startServer();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, closing server gracefully`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  
  // Close DB connection
  try {
    const mongoose = require("mongoose");
    await mongoose.connection.close(false);
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB:', err);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;