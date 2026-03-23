import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import exportRoutes from "./src/routes/export.routes.js";
import serverRoutes from "./src/routes/server.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://webapp-masterserver.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

// export routes
app.use("/api/servers", exportRoutes);

// server routes
app.use("/api/servers", serverRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`);
});
