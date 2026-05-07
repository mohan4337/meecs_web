const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load Environment Variables
dotenv.config();

// Database Connection
const connectDB = require("./config/db");

// Routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Connect Database
connectDB();

const app = express();

// =============================
// MIDDLEWARE
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// ALLOWED ORIGINS
// =============================
const allowedOrigins = [
  "http://localhost:3000",
  "https://meecs-web-tgma.vercel.app",
  "https://meecs-web.vercel.app",
  "https://www.middleeastengg.com",
  "https://middleeastengg.com",
];

// =============================
// CORS CONFIG
// =============================
const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests with no origin
    // (Postman, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS Policy Error"));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

// Apply CORS
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options("*", cors(corsOptions));

// =============================
// ROUTES
// =============================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// =============================
// ROOT ROUTE
// =============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Backend Running Successfully",
  });
});

// =============================
// ERROR HANDLER
// =============================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =============================
// EXPORT FOR VERCEL
// =============================
module.exports = app;