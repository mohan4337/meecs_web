const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ===============================
// LOAD ENV FIRST
// ===============================
dotenv.config();

// ===============================
// Database
// ===============================
const connectDB = require("./config/db");

// ===============================
// Routes
// ===============================
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

// ===============================
// Connect MongoDB
// ===============================
connectDB();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(express.json());

// ✅ FIXED CORS (Production + Local)
const allowedOrigins = [
  "http://localhost:3000",
  "https://meecs-web-tgma.vercel.app",  // 🔥 your frontend domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

// ===============================
// API Routes
// ===============================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("🚀 Backend Running Successfully");
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Server Error" });
});

// ===============================
// Server Start (Important for Vercel)
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});