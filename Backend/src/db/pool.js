import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Debug (you can remove later)
// pool.query("SELECT current_database(), current_schema()")
//     .then((res) => console.log("Backend DB:", res.rows))
//     .catch((err) => console.error(err));