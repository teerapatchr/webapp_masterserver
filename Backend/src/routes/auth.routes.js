import express from "express";
import rateLimit from "express-rate-limit";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again later" },
});

router.post("/login", loginLimiter, login);

export default router;
