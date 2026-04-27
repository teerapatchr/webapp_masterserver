import { pool } from "../db/pool.js";
import { EXPORT_COLUMNS, EXPORT_COL_SET } from "../constants/exportColumns.js";
import { csvEscape } from "../utils/csv.js";
import { buildServerFilters } from "../utils/buildServerFilters.js";

export function getExportColumns(req, res) {
    res.json(EXPORT_COLUMNS);
}

export async function exportServersCsv(req, res) {
    try {
        const { columns } = req.query;

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

        const { where, params, nextIndex } = buildServerFilters(req.query);

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
            res.write(cols.map((c) => csvEscape(row[c])).join(",") + "\n");
        }

        res.end();
    } catch (e) {
        console.error("exportServersCsv error:", e);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
