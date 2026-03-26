import { pool } from "../db/pool.js";
import { SERVER_FIELDS } from "../constants/serverFields.js";

// GET list with filters, pagination, sorting
export async function getServers(req, res) {
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

        if (createDateFrom && String(createDateFrom).trim() !== "") {
            params.push(String(createDateFrom).trim());
            where += ` AND create_date IS NOT NULL
        AND TRIM(create_date) <> ''
        AND TRIM(create_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
        AND TO_DATE(TRIM(create_date), 'MM/DD/YYYY') >= TO_DATE($${i}, 'YYYY-MM-DD')`;
            i++;
        }

        if (createDateTo && String(createDateTo).trim() !== "") {
            params.push(String(createDateTo).trim());
            where += ` AND create_date IS NOT NULL
        AND TRIM(create_date) <> ''
        AND TRIM(create_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
        AND TO_DATE(TRIM(create_date), 'MM/DD/YYYY') <= TO_DATE($${i}, 'YYYY-MM-DD')`;
            i++;
        }

        if (decommissionDateFrom && String(decommissionDateFrom).trim() !== "") {
            params.push(String(decommissionDateFrom).trim());
            where += ` AND decommission_date IS NOT NULL
        AND TRIM(decommission_date) <> ''
        AND TRIM(decommission_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
        AND TO_DATE(TRIM(decommission_date), 'MM/DD/YYYY') >= TO_DATE($${i}, 'YYYY-MM-DD')`;
            i++;
        }

        if (decommissionDateTo && String(decommissionDateTo).trim() !== "") {
            params.push(String(decommissionDateTo).trim());
            where += ` AND decommission_date IS NOT NULL
        AND TRIM(decommission_date) <> ''
        AND TRIM(decommission_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
        AND TO_DATE(TRIM(decommission_date), 'MM/DD/YYYY') <= TO_DATE($${i}, 'YYYY-MM-DD')`;
            i++;
        }

        if (terminatedDateFrom && String(terminatedDateFrom).trim() !== "") {
            params.push(String(terminatedDateFrom).trim());
            where += ` AND terminated_date IS NOT NULL
        AND TRIM(terminated_date) <> ''
        AND TRIM(terminated_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
        AND TO_DATE(TRIM(terminated_date), 'MM/DD/YYYY') >= TO_DATE($${i}, 'YYYY-MM-DD')`;
            i++;
        }

        if (terminatedDateTo && String(terminatedDateTo).trim() !== "") {
            params.push(String(terminatedDateTo).trim());
            where += ` AND terminated_date IS NOT NULL
        AND TRIM(terminated_date) <> ''
        AND TRIM(terminated_date) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
        AND TO_DATE(TRIM(terminated_date), 'MM/DD/YYYY') <= TO_DATE($${i}, 'YYYY-MM-DD')`;
            i++;
        }

        const countSql = `
      SELECT COUNT(*)::int AS total_items
      FROM server_inventory
      ${where}
    `;
        const countResult = await pool.query(countSql, params);
        const totalItems = countResult.rows[0]?.total_items ?? 0;
        const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

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
}

// Update server
export async function updateServer(req, res) {
    try {
        const { id } = req.params;
        const body = req.body ?? {};

        const keys = Object.keys(body).filter((k) => SERVER_FIELDS.includes(k));

        if (keys.length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        const setParts = keys.map((k, idx) => `${k} = $${idx + 1}`);
        const values = keys.map((k) => body[k]);

        const sql = `
      UPDATE server_inventory
      SET ${setParts.join(", ")}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

        const r = await pool.query(sql, [...values, id]);

        if (r.rows.length === 0) {
            return res.status(404).json({ error: "Not found" });
        }

        res.json(r.rows[0]);
    } catch (e) {
        console.error("updateServer error:", e);
        res.status(500).json({ error: String(e) });
    }
}

// DELETE server
export async function deleteServer(req, res) {
    try {
        const { id } = req.params;

        const r = await pool.query(
            "DELETE FROM server_inventory WHERE id = $1 RETURNING id",
            [id]
        );

        if (r.rows.length === 0) {
            return res.status(404).json({ error: "Not found" });
        }

        res.json({ ok: true, id: r.rows[0].id });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
}

// Create server
export async function createServer(req, res) {
    try {
        const body = req.body ?? {};

        const keys = Object.keys(body).filter((k) => SERVER_FIELDS.includes(k));

        if (keys.length === 0) {
            return res.status(400).json({ error: "No valid fields to insert" });
        }

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
        res.status(500).json({ error: String(e) });
    }
}

// GET detail (modal)
export async function getServerDetail(req, res) {
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
}

