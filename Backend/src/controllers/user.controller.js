import bcrypt from "bcrypt";
import { pool } from "../db/pool.js";

export async function createUser(req, res) {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: "username, password, and role are required" });
        }

        if (!["admin", "viewer"].includes(role)) {
            return res.status(400).json({ error: "role must be admin or viewer" });
        }

        const existing = await pool.query(
            "SELECT id FROM users WHERE username = $1",
            [username]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role, created_at`,
            [username, password_hash, role]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("createUser error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}