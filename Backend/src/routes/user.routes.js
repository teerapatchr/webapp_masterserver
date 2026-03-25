import express from "express";
import { createUser } from "../controllers/user.controller.js";
import { verifyToken, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, requireAdmin, createUser);

export default router;