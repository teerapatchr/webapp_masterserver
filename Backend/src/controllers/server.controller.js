import { pool } from "../db/pool.js";
import { SERVER_FIELDS } from "../constants/serverFields.js";
import { buildServerFilters } from "../utils/buildServerFilters.js";

export async function getServers(req, res) {
    try {
        const {
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

        const { where, params, nextIndex } = buildServerFilters(req.query);

        const countSql = `
      SELECT COUNT(*)::int AS total_items
      FROM server_inventory
      ${where}
    `;
        const countResult = await pool.query(countSql, params);
        const totalItems = countResult.rows[0]?.total_items ?? 0;
        const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

        const listParams = [...params, limitNum, offset];
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
      LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
    `;

        const listResult = await pool.query(listSql, listParams);

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
        console.error("getServers error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
}

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
        res.status(500).json({ error: "Internal server error" });
    }
}

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
        console.error("deleteServer error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
}

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
        console.error("createServer error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getServerDetail(req, res) {
    try {
        const { id } = req.params;

        const sql = `
      SELECT
        id, server_name, ip_address, dns_name, power_state, create_date,
        location, zone_lv, application_name, system_environment, function,
        status, decommission_date, need_terminate_process, terminated_date,
        os, os_version, service_pack, cpu, memory, disk,
        update_patch_project, veritas_backup, test_dr, critical_app,
        pttep_server_owner, pttep_application_owner,
        application_support_department, application_support_name,
        application_support_email, server_focal_point,
        request_channel_for_pttep, ticket_id_request_for_ptt_digital, remark,
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
        console.error("getServerDetail error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
}
