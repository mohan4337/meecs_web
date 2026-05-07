const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");

connectDB();

const app = express();

// ================== MIDDLEWARE ==================
app.use(express.json());

// ================== CORS ==================
const allowedOrigins = [
  "http://localhost:3000",
  "https://meecs-web.vercel.app",
  "https://meecs-web-4fvv.vercel.app",
  "https://meecs-web-tgma.vercel.app",
  "https://www.middleeastengg.com",
  "https://middleeastengg.com",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ALSO USE CORS PACKAGE
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ================== ROUTES ==================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// ================== HEALTH ==================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Running",
  });
});

// ================== ERROR ==================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Server Error",
  });
});

module.exports = app;