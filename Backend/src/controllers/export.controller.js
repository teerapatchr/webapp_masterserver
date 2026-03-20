import { pool } from "../db/pool.js";
import { EXPORT_COLUMNS, EXPORT_COL_SET } from "../constants/exportColumns.js";
import { csvEscape } from "../utils/csv.js";

export function getExportColumns(req, res) {
    res.json(EXPORT_COLUMNS);
}

export async function exportServersCsv(req, res) {
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

        const requested = String(columns || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const cols = (requested.length
            ? requested
            : ["server_name", "ip_address", "application_name", "location", "system_environment", "status"]
        ).filter((c) => EXPORT_COL_SET.has(c));

        if (cols.length === 0) {
            return res.status(400).json({ error: "No valid columns selected" });
        }

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

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="servers_export.csv"`);

        res.write(cols.join(",") + "\n");

        for (const row of r.rows) {
            const line = cols.map((c) => csvEscape(row[c])).join(",");
            res.write(line + "\n");
        }

        res.end();
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
}