import dotenv from "dotenv";
dotenv.config({ override: true });

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}

import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import exportRoutes from "./src/routes/export.routes.js";
import serverRoutes from "./src/routes/server.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import { pool } from "./src/db/pool.js";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/servers", exportRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/users", userRoutes);

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check DB error:", err);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Global error handler — catches errors passed via next(err)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`);
});