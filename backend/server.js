const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Middleware
const rateLimit = require("./middleware/rateLimit");
const logger = require("./middleware/logger");

// Track DB connection state
let isDbConnected = false;
let connectionPromise = null;

// Initialize DB connection early
const initDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }
  
  connectionPromise = connectDB().then(() => {
    isDbConnected = true;
    console.log("✅ Database ready");
  }).catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    isDbConnected = false;
    // Don't throw - allow server to start and retry on first request
  });
  
  return connectionPromise;
};

// Start connection immediately
initDB();

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
// DATABASE CONNECTION GUARANTEE
// =================================
app.use(async (req, res, next) => {
  // For API routes, ensure DB is connected
  if (req.path.startsWith('/api/') || req.path === '/') {
    if (!isDbConnected) {
      console.log('DB not connected yet, waiting for connection...');
      try {
        await connectionPromise;
        isDbConnected = true;
      } catch (error) {
        console.error('DB connection failed:', error.message);
        // Continue anyway - routes may not need DB (e.g., chat uses external API)
      }
    }
  }
  next();
});

// =================================
// SECURITY HEADERS WITH HELMET
// =================================

// Detect environment type
const isVercelPreview = process.env.VERCEL_URL && process.env.VERCEL_URL.includes('vercel.app');
const isProduction = process.env.NODE_ENV === 'production';
const isCustomDomain = process.env.CUSTOM_DOMAIN === 'true' || 
                      (process.env.FRONTEND_URL && !process.env.VERCEL_URL);

// Helmet base configuration - disable conflicting headers we'll set manually
app.use(helmet({
  contentSecurityPolicy: false,      // We'll set CSP manually with frame-ancestors
  crossOriginEmbedderPolicy: false,  // May break video/audio embeds
  frameguard: false,                 // We'll set X-Frame-Options manually
  hidePoweredBy: true,              // Hide Express header
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: false
  } : false,
}));

// Custom security headers with conditional iframe support
app.use((req, res, next) => {
  // Standard security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Determine framing policy based on environment
  
  // 1. Vercel Preview (vercel.app subdomain) - allow iframe embedding
  //    This fixes Vercel dashboard preview 403
  if (isVercelPreview && !isCustomDomain) {
    // Allow all framing for Vercel dashboard preview
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    // Modern CSP equivalent - allow any site to embed
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
  }
  // 2. Production with custom domain - strict protection
  else if (isProduction && isCustomDomain) {
    // Only allow same-origin framing (protects against clickjacking)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // CSP frame-ancestors restriction
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.middleeastengg.com';
    res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${frontendUrl}`);
  }
  // 3. Development/localhost - permissive for testing
  else {
    // Development: allow all (easier debugging)
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
  }

  // HSTS already handled by helmet, but ensure it's set in production
  if (isProduction && !isVercelPreview) {
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
  credentials: false, // Set to true only if using cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-ID', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
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

// Warmup endpoint for Vercel - triggers DB connection
app.get("/_vercel/warmup", async (req, res) => {
  try {
    if (!isDbConnected) {
      await connectionPromise;
    }
    res.status(200).json({
      status: "warm",
      timestamp: new Date().toISOString(),
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  } catch (error) {
    res.status(200).send("OK"); // Still return 200 for Vercel
  }
});

// Status endpoint with DB check
app.get("/api/status", (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      status: isConnected ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      db: isConnected ? "connected" : "disconnected",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
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