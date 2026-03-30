import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import exportRoutes from "./src/routes/export.routes.js";
import serverRoutes from "./src/routes/server.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import { pool } from "./src/db.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/servers", exportRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message
    });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`);
});