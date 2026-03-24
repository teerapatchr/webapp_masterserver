import express from "express";
import { getServers, getServerDetail, updateServer, deleteServer, createServer, } from "../controllers/server.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";
const router = express.Router();

// viewer + admin
router.get("/", verifyToken, getServers);
router.get("/:id", verifyToken, getServerDetail);

// admin only
router.post("/", verifyToken, requireAdmin, createServer);
router.put("/:id", verifyToken, requireAdmin, updateServer);
router.delete("/:id", verifyToken, requireAdmin, deleteServer);



export default router;