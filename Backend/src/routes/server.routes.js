import express from "express";
import { getServers, getServerDetail, updateServer, deleteServer, createServer, } from "../controllers/server.controller.js";

const router = express.Router();

router.get("/", getServers);
router.get("/:id", getServerDetail);
router.post("/", createServer);
router.put("/:id", updateServer);
router.delete("/:id", deleteServer);


export default router;