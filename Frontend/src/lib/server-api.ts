import type { ServerListQuery, ServerListResponse } from "@/lib/api-types";
import type { ServerDetail } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
function defaultHeaders(): HeadersInit {
  const headers: HeadersInit = {};

  // ngrok header
  if (API_BASE.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  // JWT token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // JSON header
  headers["Content-Type"] = "application/json";

  return headers;
}


export type ExportCol = {
  key: string;
  label: string;
  group: string;
};

type ExportCsvQuery = {
  q?: string;
  location?: string;
  env?: string;
  status?: string;
  power?: string;
  critical?: string;
  serverOwner?: string;
  createDateFrom?: string;
  createDateTo?: string;
  decommissionDateFrom?: string;
  decommissionDateTo?: string;
  terminatedDateFrom?: string;
  terminatedDateTo?: string;
};

//Fetch server export columns for CSV export modal
export async function fetchExportColumns(): Promise<ExportCol[]> {
  const res = await fetch(`${API_BASE}/api/servers/export-columns`, {
    cache: "no-store",
    headers: defaultHeaders(),
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch { }
    throw new Error(`fetchExportColumns failed: ${res.status} ${details}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("export-columns did not return an array");
  }

  return data;
}

//Export servers as CSV based on filters and selected columns
export async function exportServersCsv(
  filters: ExportCsvQuery,
  selectedColumns: string[]
): Promise<Blob> {
  const params = new URLSearchParams();

  if (filters.q?.trim()) params.set("q", filters.q.trim());

  if (filters.location && filters.location !== "ALL") params.set("location", filters.location);
  if (filters.env && filters.env !== "ALL") params.set("env", filters.env);
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
  if (filters.power && filters.power !== "ALL") params.set("power", filters.power);
  if (filters.critical && filters.critical !== "ALL") params.set("critical", filters.critical);
  if (filters.serverOwner && filters.serverOwner !== "ALL") params.set("serverOwner", filters.serverOwner);

  if (filters.createDateFrom?.trim()) params.set("createDateFrom", filters.createDateFrom.trim());
  if (filters.createDateTo?.trim()) params.set("createDateTo", filters.createDateTo.trim());

  if (filters.decommissionDateFrom?.trim()) {
    params.set("decommissionDateFrom", filters.decommissionDateFrom.trim());
  }
  if (filters.decommissionDateTo?.trim()) {
    params.set("decommissionDateTo", filters.decommissionDateTo.trim());
  }

  if (filters.terminatedDateFrom?.trim()) {
    params.set("terminatedDateFrom", filters.terminatedDateFrom.trim());
  }
  if (filters.terminatedDateTo?.trim()) {
    params.set("terminatedDateTo", filters.terminatedDateTo.trim());
  }

  params.set("columns", selectedColumns.join(","));

  const res = await fetch(`${API_BASE}/api/servers/export?${params.toString()}`, {
    cache: "no-store",
    headers: defaultHeaders(),
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch { }
    throw new Error(`exportServersCsv failed: ${res.status} ${details}`);
  }

  return res.blob();
}

//Build query params for server list API based on filters, pagination, sorting
export function buildServerQueryParams(query: ServerListQuery) {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set("q", query.q.trim());

  if (query.location && query.location !== "ALL") params.set("location", query.location);
  if (query.env && query.env !== "ALL") params.set("env", query.env);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.power && query.power !== "ALL") params.set("power", query.power);
  if (query.critical && query.critical !== "ALL") params.set("critical", query.critical);
  if (query.serverOwner && query.serverOwner !== "ALL") params.set("serverOwner", query.serverOwner);

  if (query.createDateFrom?.trim()) params.set("createDateFrom", query.createDateFrom.trim());
  if (query.createDateTo?.trim()) params.set("createDateTo", query.createDateTo.trim());

  if (query.decommissionDateFrom?.trim()) params.set("decommissionDateFrom", query.decommissionDateFrom.trim());
  if (query.decommissionDateTo?.trim()) params.set("decommissionDateTo", query.decommissionDateTo.trim());

  if (query.terminatedDateFrom?.trim()) params.set("terminatedDateFrom", query.terminatedDateFrom.trim());
  if (query.terminatedDateTo?.trim()) params.set("terminatedDateTo", query.terminatedDateTo.trim());

  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));

  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);

  return params;
}

//Fetch server list with filters, pagination, sorting
export async function fetchServers(query: ServerListQuery): Promise<ServerListResponse> {
  const params = buildServerQueryParams(query);

  const res = await fetch(`${API_BASE}/api/servers?${params.toString()}`, {
    cache: "no-store",
    headers: defaultHeaders(),
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch { }
    throw new Error(`fetchServers failed: ${res.status} ${details}`);
  }

  return res.json();
}


//Fetch server detail
export async function fetchServerDetail(id: string): Promise<ServerDetail> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    cache: "no-store",
    headers: defaultHeaders(),
  });

  if (!res.ok) {
    throw new Error(`fetchServerDetail failed: ${res.status}`);
  }

  return res.json();
}


//Edit server
export async function updateServer(
  id: string,
  patch: Partial<ServerDetail>
): Promise<ServerDetail> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders(),
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text();
    } catch { }
    throw new Error(`updateServer failed: ${res.status} ${details}`);
  }

  return res.json();
}

//Delete server
export async function deleteServer(id: string): Promise<{ ok: true; id: string }> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    method: "DELETE",
    headers: defaultHeaders(),
  });
  if (!res.ok) throw new Error(`deleteServer failed: ${res.status}`);
  return res.json();
}

//Add server 
export async function createServer(payload: Partial<ServerDetail>): Promise<ServerDetail> {
  const res = await fetch(`${API_BASE}/api/servers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders(),
    },
    body: JSON.stringify(payload),
  });


  if (!res.ok) throw new Error(`createServer failed: ${res.status}`);
  return res.json();
}

