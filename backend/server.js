const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ===============================
// ✅ LOAD ENV FIRST (VERY IMPORTANT)
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
const contactRoutes = require("./routes/contactRoutes"); // ✅ NEW

// ===============================
// Connect MongoDB
// ===============================
connectDB();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ===============================
// API Routes
// ===============================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes); // ✅ NEW CONTACT ROUTE

// ===============================
// Health Check Route
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("🚀 MERN Backend + Chatbot + Contact API Running");
});

// ===============================
// Handle Unknown Routes
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===============================
// Global Error Handler (Optional but Professional)
// ===============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// ===============================
// Server Start
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
