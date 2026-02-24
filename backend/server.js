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

// Middleware
app.use(express.json());

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://meecs-web-tgma.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.options("*", cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// Health
app.get("/", (req, res) => {
  res.status(200).send("🚀 Backend Running");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

// ❌ DO NOT USE app.listen ON VERCEL
module.exports = app;