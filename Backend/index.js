import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import exportRoutes from "./src/routes/export.routes.js";
import serverRoutes from "./src/routes/server.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/servers", exportRoutes);
app.use("/api/servers", serverRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`);
});