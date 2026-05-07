const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Load env
dotenv.config();

// Database
const connectDB = require("./config/db");

// Routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Connect DB
connectDB();

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

// ================= CORS =================
const allowedOrigins = [
  "http://localhost:3000",
  "https://meecs-web-tgma.vercel.app",
  "https://meecs-web.vercel.app",
  "https://www.middleeastengg.com",
  "https://middleeastengg.com",
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests with no origin (Postman/mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked"));
      }
    },

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// Handle preflight
app.options("*", cors());

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Running",
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// Export for Vercel
module.exports = app;