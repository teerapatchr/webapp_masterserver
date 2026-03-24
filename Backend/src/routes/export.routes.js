import express from "express";
import { getExportColumns, exportServersCsv } from "../controllers/export.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/export", verifyToken, exportServersCsv);
router.get("/export-columns", verifyToken, getExportColumns);


export default router;