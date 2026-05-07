const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

// Load env
dotenv.config();

// DB
const connectDB = require("./config/db");

// Routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Connect DB
connectDB();

const app = express();

// =====================================
// BODY PARSER
// =====================================

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({
  extended: true,
  limit: "10mb",
}));

// =====================================
// HELMET SECURITY
// =====================================

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  })
);

// =====================================
// CUSTOM HEADERS
// =====================================

app.use((req, res, next) => {

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-XSS-Protection",
    "1; mode=block"
  );

  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  // IMPORTANT FOR VERCEL PREVIEW
  res.setHeader(
    "X-Frame-Options",
    "ALLOWALL"
  );

  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors *"
  );

  next();
});

// =====================================
// CORS
// =====================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",

  "https://www.middleeastengg.com",
  "https://middleeastengg.com",

  "https://meecs-web.vercel.app",
  "https://meecs-web-4fvv.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {

      // allow requests without origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(null, false);
      }
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// Handle preflight
app.options("*", cors());

// =====================================
// HEALTH CHECK
// =====================================

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    message: "Backend Running",
  });

});

// =====================================
// WARMUP
// =====================================

app.get("/ping", (req, res) => {

  res.status(200).send("Server awake");

});

// =====================================
// API ROUTES
// =====================================

app.use("/api/users", userRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/contact", contactRoutes);

// =====================================
// 404
// =====================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route not found",
  });

});

// =====================================
// ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });

});

// =====================================
// DB STATUS
// =====================================

mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB Error:", err);
});

// =====================================
// EXPORT
// =====================================

module.exports = app;