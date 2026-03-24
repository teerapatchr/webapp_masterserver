import express from "express";

console.log("AUTH ROUTES LOADED");

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({ ok: true, from: "auth" });
});

router.post("/login", async (req, res) => {
    res.json({ ok: true });
});

export default router;