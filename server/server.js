require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/subscriptions", require("./routes/subscriptions"));

// Health check endpoint
app.get("/api/health", (req, res) => {
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

const path = require("path");
const fs = require("fs");

// Serve frontend static build in production if available
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  // Root welcome if client not built
  app.get("/", (req, res) => {
    res.send("<h1>SpendWise Expense Tracker API is running! 🚀</h1><p>Visit /api/expenses or /api/health</p>");
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/expensetracker";

// Start server first so endpoints are accessible, then establish MongoDB connection
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

mongoose
  .connect(URI)
  .then(() => {
    console.log("MongoDB connected successfully to:", URI);
  })
  .catch((err) => {
    console.warn("MongoDB connection warning:", err.message);
    console.warn("The server is still active, but database operations will require MongoDB running at " + URI);
  });
