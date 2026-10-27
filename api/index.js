const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

let isConnecting = false;
async function connectDB() {
  if (mongoose.connection.readyState === 1 || isConnecting) return;
  const URI = process.env.MONGO_URI;
  if (!URI) return;
  try {
    isConnecting = true;
    await mongoose.connect(URI, {
      bufferCommands: false,
    });
    console.log("MongoDB connected via Vercel Serverless");
  } catch (err) {
    console.warn("MongoDB connection warning:", err.message);
  } finally {
    isConnecting = false;
  }
}

// Auto-connect to DB before processing API requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use("/api/expenses", require("../server/routes/expenses"));
app.use("/api/goals", require("../server/routes/goals"));
app.use("/api/subscriptions", require("../server/routes/subscriptions"));

app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    app: "SpendWise on Vercel Serverless",
    timestamp: new Date().toISOString(),
    database: {
      connected: isConnected,
      status: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] || "unknown",
    },
  });
});

module.exports = app;
