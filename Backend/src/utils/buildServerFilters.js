/**
 * Builds parameterized WHERE clause and params array from server list query params.
 * Used by both server.controller.js and export.controller.js to avoid duplication.
 *
 * Returns { where, params, nextIndex }
 */
export function buildServerFilters(query) {
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
    } = query;

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

    const addDateRange = (column, from, to) => {
        const datePattern = `$${i}`;
        const guard = `${column} IS NOT NULL
      AND TRIM(${column}) <> ''
      AND TRIM(${column}) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'`;

        if (from && String(from).trim() !== "") {
            params.push(String(from).trim());
            where += ` AND ${guard}
      AND TO_DATE(TRIM(${column}), 'MM/DD/YYYY') >= TO_DATE(${datePattern}, 'YYYY-MM-DD')`;
            i++;
        }

        if (to && String(to).trim() !== "") {
            params.push(String(to).trim());
            const toPattern = `$${i}`;
            where += ` AND ${column} IS NOT NULL
      AND TRIM(${column}) <> ''
      AND TRIM(${column}) ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}$'
      AND TO_DATE(TRIM(${column}), 'MM/DD/YYYY') <= TO_DATE(${toPattern}, 'YYYY-MM-DD')`;
            i++;
        }
    };

    addDateRange("create_date", createDateFrom, createDateTo);
    addDateRange("decommission_date", decommissionDateFrom, decommissionDateTo);
    addDateRange("terminated_date", terminatedDateFrom, terminatedDateTo);

    return { where, params, nextIndex: i };
}
