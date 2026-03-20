import express from "express";
import { getExportColumns, exportServersCsv } from "../controllers/export.controller.js";

const router = express.Router();

router.get("/export-columns", getExportColumns);
router.get("/export", exportServersCsv);

export default router;