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


// UPDATE server
app.put("/api/servers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // whitelist fields you allow to update (match your DB columns)
    const allowed = [
      "server_name",
      "ip_address",
      "dns_name",
      "power_state",
      "create_date",
      "location",
      "zone_lv",
      "application_name",
      "system_environment",
      "function",
      "status",
      "decommission_date",
      "decom_duration_days",
      "need_terminate_process",
      "terminated_date",
      "os",
      "os_version",
      "service_pack",
      "cpu",
      "memory",
      "disk",
      "update_patch_project",
      "veritas_backup",
      "test_dr",
      "critical_app",
      "pttep_server_owner",
      "pttep_application_owner",
      "application_support_department",
      "application_support_name",
      "application_support_email",
      "server_focal_point",
      "request_channel_for_pttep",
      "ticket_id_request_for_ptt_digital",
      "remark",
    ];

    const body = req.body ?? {};

    const keys = Object.keys(body).filter((k) => allowed.includes(k));

    if (keys.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // build query: SET a=$1, b=$2 ...
    const setParts = keys.map((k, idx) => `${k} = $${idx + 1}`);
    const values = keys.map((k) => body[k]);

    const sql = `
      UPDATE server_inventory
      SET ${setParts.join(", ")}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const r = await pool.query(sql, [...values, id]);

    if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// DELETE server
app.delete("/api/servers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const r = await pool.query(
      "DELETE FROM server_inventory WHERE id = $1 RETURNING id",
      [id]
    );

    if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true, id: r.rows[0].id });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/servers", async (req, res) => {
  try {
    const body = req.body ?? {};

    // ✅ Set only fields you allow
    const allowed = [
      "id",
      "server_name",
      "ip_address",
      "dns_name",
      "power_state",
      "create_date",
      "location",
      "zone_lv",
      "application_name",
      "system_environment",
      "function",
      "status",
      "decommission_date",
      "decom_duration_days",
      "need_terminate_process",
      "terminated_date",
      "os",
      "os_version",
      "service_pack",
      "cpu",
      "memory",
      "disk",
      "update_patch_project",
      "veritas_backup",
      "test_dr",
      "critical_app",
      "pttep_server_owner",
      "pttep_application_owner",
      "application_support_department",
      "application_support_name",
      "application_support_email",
      "server_focal_point",
      "request_channel_for_pttep",
      "ticket_id_request_for_ptt_digital",
      "remark",
    ];

    // Require minimal fields (adjust if you want)
    if (!body.id || !body.server_name || !body.ip_address) {
      return res.status(400).json({ error: "id, server_name, ip_address are required" });
    }

    const keys = Object.keys(body).filter((k) => allowed.includes(k));
    const cols = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => body[k]);

    const sql = `
      INSERT INTO server_inventory (${cols})
      VALUES (${placeholders})
      RETURNING *
    `;

    const r = await pool.query(sql, values);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    // common: duplicate id
    res.status(500).json({ error: String(e) });
  }
});





