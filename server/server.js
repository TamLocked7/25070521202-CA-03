require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const URI =
  process.env.MONGO_URI ||
  "mongodb+srv://TejasTam:tejastam79@cluster0.7kmbtij.mongodb.net/spendwise?retryWrites=true&w=majority";

// Connection helper for serverless / persistent service
let isConnecting = false;
async function connectDB() {
  if (mongoose.connection.readyState === 1 || isConnecting) return;
  try {
    isConnecting = true;
    await mongoose.connect(URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.warn("MongoDB connection warning:", err.message);
  } finally {
    isConnecting = false;
  }
}

// Connect before request processing
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes (supports both /api-prefixed and root-relative for Vercel services)
app.use(["/api/expenses", "/expenses"], require("./routes/expenses"));
app.use(["/api/goals", "/goals"], require("./routes/goals"));
app.use(["/api/subscriptions", "/subscriptions"], require("./routes/subscriptions"));

// Health check endpoint
app.get(["/api/health", "/health"], (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    app: "SpendWise MERN Backend",
    timestamp: new Date().toISOString(),
    database: {
      connected: isConnected,
      status: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
  });
});

app.get(["/api", "/"], (req, res) => {
  res.json({ status: "ok", message: "SpendWise Express API service is active 🚀" });
});

const path = require("path");
const fs = require("fs");

// Serve frontend static build in production if available locally
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

connectDB();

module.exports = app;
