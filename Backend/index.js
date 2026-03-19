import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
app.use(cors());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend-domain.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define export columns and their groups
const EXPORT_COLUMNS = [
  { key: "server_name", label: "Server Name", group: "Identity" },
  { key: "ip_address", label: "IP Address", group: "Identity" },
  { key: "dns_name", label: "DNS Name", group: "Identity" },
  { key: "location", label: "Location", group: "Identity" },
  { key: "zone_lv", label: "Zone Level", group: "Identity" },

  { key: "application_name", label: "Application Name", group: "Application" },
  { key: "pttep_server_owner", label: "Server Owner", group: "Application" },
  { key: "pttep_application_owner", label: "Application Owner", group: "Application" },

  { key: "system_environment", label: "Environment", group: "Environment" },
  { key: "function", label: "Function", group: "Environment" },
  { key: "status", label: "Status", group: "Environment" },
  { key: "power_state", label: "Power State", group: "Environment" },
  { key: "critical_app", label: "Critical App", group: "Environment" },

  { key: "create_date", label: "Create Date", group: "Lifecycle" },
  { key: "decommission_date", label: "Decommission Date", group: "Lifecycle" },
  { key: "decom_duration_days", label: "Decom Duration Days", group: "Lifecycle" },
  { key: "need_terminate_process", label: "Need Terminate Process", group: "Lifecycle" },
  { key: "terminated_date", label: "Terminated Date", group: "Lifecycle" },

  { key: "os", label: "OS", group: "System" },
  { key: "os_version", label: "OS Version", group: "System" },
  { key: "service_pack", label: "OS Service Pack", group: "System" },
  { key: "cpu", label: "CPU", group: "System" },
  { key: "memory", label: "Memory", group: "System" },
  { key: "disk", label: "Disk", group: "System" },

  { key: "update_patch_project", label: "Patch Project", group: "Operations" },
  { key: "veritas_backup", label: "Veritas Backup", group: "Operations" },
  { key: "test_dr", label: "Test DR", group: "Operations" },


  { key: "application_support_department", label: "Support Department", group: "Support" },
  { key: "application_support_name", label: "Support Name", group: "Support" },
  { key: "application_support_email", label: "Support Email", group: "Support" },
  { key: "server_focal_point", label: "Server Focal Point", group: "Support" },
  { key: "request_channel_for_pttep", label: "Request Channel", group: "Support" },
  { key: "ticket_id_request_for_ptt_digital", label: "Ticket ID", group: "Support" },

  { key: "remark", label: "Remark", group: "Notes" },
];

const EXPORT_COL_SET = new Set(EXPORT_COLUMNS.map((c) => c.key));

const csvEscape = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

//Export Route
app.get("/api/servers/export", async (req, res) => {
  try {
    const {
      q,
      location,
      env,
      status,
      power,
      critical,
      serverOwner,
      createDateFrom,
      createDateTo,
      decommissionDateFrom,
      decommissionDateTo,
      terminatedDateFrom,
      terminatedDateTo,
      columns,
    } = req.query;
    console.log("EXPORT QUERY:", req.query);

    // ---- 1) parse selected columns ----
    const requested = String(columns || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // default export if none provided
    const cols = (requested.length
      ? requested
      : ["server_name", "ip_address", "application_name", "location", "system_environment", "status"]
    ).filter((c) => EXPORT_COL_SET.has(c));

    if (cols.length === 0) {
      return res.status(400).json({ error: "No valid columns selected" });
    }

    // ---- 2) build SAME filters as your list endpoint ----
    const params = [];
    let i = 1;
    let where = "WHERE 1=1";

    if (q && String(q).trim() !== "") {
      params.push(String(q).trim());
      where += ` AND (
    server_name ILIKE '%' || $${i} || '%'
    OR ip_address ILIKE '%' || $${i} || '%'
    OR application_name ILIKE '%' || $${i} || '%'
    OR pttep_server_owner ILIKE '%' || $${i} || '%'
    OR pttep_application_owner ILIKE '%' || $${i} || '%'
  )`;
      i++;
    }

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
    addEq("pttep_server_owner", serverOwner);

    if (createDateFrom) {
      params.push(String(createDateFrom));
      where += ` AND create_date IS NOT NULL AND TRIM(create_date) <> '' AND TO_DATE(create_date, 'MM/DD/YYYY') >= $${i}`;
      i++;
    }

    if (createDateTo) {
      params.push(String(createDateTo));
      where += ` AND create_date IS NOT NULL AND TRIM(create_date) <> '' AND TO_DATE(create_date, 'MM/DD/YYYY') <= $${i}`;
      i++;
    }

    if (decommissionDateFrom) {
      params.push(String(decommissionDateFrom));
      where += ` AND decommission_date IS NOT NULL AND TRIM(decommission_date) <> '' AND TO_DATE(decommission_date, 'MM/DD/YYYY') >= $${i}`;
      i++;
    }

    if (decommissionDateTo) {
      params.push(String(decommissionDateTo));
      where += ` AND decommission_date IS NOT NULL AND TRIM(decommission_date) <> '' AND TO_DATE(decommission_date, 'MM/DD/YYYY') <= $${i}`;
      i++;
    }

    if (terminatedDateFrom) {
      params.push(String(terminatedDateFrom));
      where += ` AND terminated_date IS NOT NULL AND TRIM(terminated_date) <> '' AND TO_DATE(terminated_date, 'MM/DD/YYYY') >= $${i}`;
      i++;
    }

    if (terminatedDateTo) {
      params.push(String(terminatedDateTo));
      where += ` AND terminated_date IS NOT NULL AND TRIM(terminated_date) <> '' AND TO_DATE(terminated_date, 'MM/DD/YYYY') <= $${i}`;
      i++;
    }


    // ---- 3) query all matching rows (NO pagination) ----
    // safe SELECT list: only from EXPORT_COLUMNS keys
    const selectCols = cols
      .map((c) => {
        if (c === "decom_duration_days") {
          return `
        CASE
          WHEN decommission_date IS NULL OR TRIM(decommission_date) = ''
          THEN NULL
          ELSE CURRENT_DATE - TO_DATE(decommission_date, 'MM/DD/YYYY')
        END AS decom_duration_days
      `;
        }
        return `"${c}"`;
      })
      .join(", ");

    const sql = `
      SELECT ${selectCols}
      FROM server_inventory
      ${where}
      ORDER BY server_name ASC
    `;

    const r = await pool.query(sql, params);

    // ---- 4) return CSV download ----
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="servers_export.csv"`);

    // header
    res.write(cols.join(",") + "\n");

    // rows
    for (const row of r.rows) {
      const line = cols.map((c) => csvEscape(row[c])).join(",");
      res.write(line + "\n");
    }

    res.end();
  } catch (e) {
    res.status(500).json({ error: String(e) });
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
      serverOwner,

      createDateFrom,
      createDateTo,
      decommissionDateFrom,
      decommissionDateTo,
      terminatedDateFrom,
      terminatedDateTo,



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
        OR pttep_server_owner ILIKE '%' || $${i} || '%'
        OR pttep_application_owner ILIKE '%' || $${i} || '%'
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
    addEq("pttep_server_owner", serverOwner);

    // date range filters with validation
    if (createDateFrom) {
      params.push(String(createDateFrom));
      where += ` AND create_date IS NOT NULL
             AND TRIM(create_date) <> ''
             AND TRIM(create_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
             AND TO_DATE(TRIM(create_date), 'MM/DD/YYYY') >= $${i}`;
      i++;
    }

    // date range filters with validation
    if (createDateTo) {
      params.push(String(createDateTo));
      where += ` AND create_date IS NOT NULL
             AND TRIM(create_date) <> ''
             AND TRIM(create_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
             AND TO_DATE(TRIM(create_date), 'MM/DD/YYYY') <= $${i}`;
      i++;
    }

    // date range filters with validation
    if (decommissionDateFrom) {
      params.push(String(decommissionDateFrom));
      where += ` AND decommission_date IS NOT NULL
             AND TRIM(decommission_date) <> ''
             AND TRIM(decommission_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
             AND TO_DATE(TRIM(decommission_date), 'MM/DD/YYYY') >= $${i}`;
      i++;
    }

    // date range filters with validation
    if (decommissionDateTo) {
      params.push(String(decommissionDateTo));
      where += ` AND decommission_date IS NOT NULL
             AND TRIM(decommission_date) <> ''
             AND TRIM(decommission_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
             AND TO_DATE(TRIM(decommission_date), 'MM/DD/YYYY') <= $${i}`;
      i++;
    }

    // date range filters with validation
    if (terminatedDateFrom) {
      params.push(String(terminatedDateFrom));
      where += ` AND terminated_date IS NOT NULL
             AND TRIM(terminated_date) <> ''
             AND TRIM(terminated_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
             AND TO_DATE(TRIM(terminated_date), 'MM/DD/YYYY') >= $${i}`;
      i++;
    }


    if (terminatedDateTo) {
      params.push(String(terminatedDateTo));
      where += ` AND terminated_date IS NOT NULL
             AND TRIM(terminated_date) <> ''
             AND TRIM(terminated_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
             AND TO_DATE(TRIM(terminated_date), 'MM/DD/YYYY') <= $${i}`;
      i++;
    }

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
        pttep_server_owner,
        CASE
          WHEN decommission_date IS NULL OR TRIM(decommission_date) = ''
          THEN NULL
          ELSE CURRENT_DATE - TO_DATE(decommission_date, 'MM/DD/YYYY')
        END AS decom_duration_days
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

// CREATE server
app.post("/api/servers", async (req, res) => {
  try {
    const body = req.body ?? {};
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

//Api for CSV export 
app.get("/api/servers/export-columns", (req, res) => {
  res.json(EXPORT_COLUMNS);
});

// GET detail (modal)
app.get("/api/servers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        *,
        CASE
          WHEN decommission_date IS NULL OR TRIM(decommission_date) = ''
          THEN NULL
          ELSE CURRENT_DATE - TO_DATE(decommission_date, 'MM/DD/YYYY')
        END AS decom_duration_days
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