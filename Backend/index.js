import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// health check
app.get("/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok");
    res.json({ ok: true, db: r.rows[0].ok });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// GET list (table view)
app.get("/api/servers", async (req, res) => {
  try {
    const {
      q,
      location,
      env,
      status,
      power,
      critical,
      page = "1",
      limit = "50",
      sortBy = "server_name",
      sortDir = "asc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const allowedSort = new Set([
      "server_name",
      "ip_address",
      "application_name",
      "status",
      "power_state",
    ]);

    const sortCol = allowedSort.has(String(sortBy)) ? String(sortBy) : "server_name";
    const sortOrder = String(sortDir).toLowerCase() === "desc" ? "DESC" : "ASC";

    const params = [];
    let i = 1;

    let where = "WHERE 1=1";

    // search q
    if (q && String(q).trim() !== "") {
      params.push(String(q).trim());
      where += ` AND (
        server_name ILIKE '%' || $${i} || '%'
        OR ip_address ILIKE '%' || $${i} || '%'
        OR application_name ILIKE '%' || $${i} || '%'
      )`;
      i++;
    }

    // filters
    const addEq = (field, value) => {
      if (value && String(value) !== "ALL") {
        params.push(String(value));
        where += ` AND ${field} = $${i}`;
        i++;
      }
    };

    addEq("location", location);
    addEq("system_environment", env);
    addEq("status", status);
    addEq("power_state", power);
    addEq("critical_app", critical);

    // count
    const countSql = `
      SELECT COUNT(*)::int AS total_items
      FROM server_inventory
      ${where}
    `;
    const countResult = await pool.query(countSql, params);
    const totalItems = countResult.rows[0]?.total_items ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    // list
    params.push(limitNum, offset);
    const listSql = `
      SELECT
        id,
        server_name,
        ip_address,
        application_name,
        location,
        system_environment,
        status,
        power_state,
        critical_app,
        pttep_server_owner
      FROM server_inventory
      ${where}
      ORDER BY ${sortCol} ${sortOrder}
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const listResult = await pool.query(listSql, params);

    res.json({
      items: listResult.rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`API running on http://localhost:${process.env.PORT || 4000}`);
});

// GET detail (modal)
app.get("/api/servers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT *
      FROM server_inventory
      WHERE id = $1
      LIMIT 1
    `;

    const r = await pool.query(sql, [id]);

    if (r.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

