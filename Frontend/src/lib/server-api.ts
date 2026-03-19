import type { ServerListQuery, ServerListResponse } from "@/lib/api-types";
import type { ServerDetail } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const defaultHeaders: HeadersInit = API_BASE.includes("ngrok")
  ? { "ngrok-skip-browser-warning": "true" }
  : {};

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

export async function fetchExportColumns(): Promise<ExportCol[]> {
  const res = await fetch(`${API_BASE}/api/servers/export-columns`, {
    cache: "no-store",
    headers: defaultHeaders,
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

export function buildExportCsvUrl(
  filters: ExportCsvQuery,
  selectedColumns: string[]
) {
  const params = new URLSearchParams({
    q: filters.q ?? "",
    location: filters.location ?? "ALL",
    env: filters.env ?? "ALL",
    status: filters.status ?? "ALL",
    power: filters.power ?? "ALL",
    critical: filters.critical ?? "ALL",
    serverOwner: filters.serverOwner ?? "ALL",
    createDateFrom: filters.createDateFrom ?? "",
    createDateTo: filters.createDateTo ?? "",
    decommissionDateFrom: filters.decommissionDateFrom ?? "",
    decommissionDateTo: filters.decommissionDateTo ?? "",
    terminatedDateFrom: filters.terminatedDateFrom ?? "",
    terminatedDateTo: filters.terminatedDateTo ?? "",
    columns: selectedColumns.join(","),
  });

  return `${API_BASE}/api/servers/export?${params.toString()}`;
}

export function buildServerQueryParams(query: ServerListQuery) {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.location && query.location !== "ALL") params.set("location", query.location);
  if (query.env && query.env !== "ALL") params.set("env", query.env);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.power && query.power !== "ALL") params.set("power", query.power);
  if (query.critical && query.critical !== "ALL") params.set("critical", query.critical);
  if (query.serverOwner && query.serverOwner !== "ALL") params.set("serverOwner", query.serverOwner);

  if (query.createDateFrom) params.set("createDateFrom", query.createDateFrom);
  if (query.createDateTo) params.set("createDateTo", query.createDateTo);

  if (query.decommissionDateFrom) params.set("decommissionDateFrom", query.decommissionDateFrom);
  if (query.decommissionDateTo) params.set("decommissionDateTo", query.decommissionDateTo);

  if (query.terminatedDateFrom) params.set("terminatedDateFrom", query.terminatedDateFrom);
  if (query.terminatedDateTo) params.set("terminatedDateTo", query.terminatedDateTo);

  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));

  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);

  return params;
}

export async function fetchServers(query: ServerListQuery): Promise<ServerListResponse> {
  const params = buildServerQueryParams(query);

  if (query.q) params.set("q", query.q);
  if (query.location && query.location !== "ALL") params.set("location", query.location);
  if (query.env && query.env !== "ALL") params.set("env", query.env);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.power && query.power !== "ALL") params.set("power", query.power);
  if (query.critical && query.critical !== "ALL") params.set("critical", query.critical);
  if (query.serverOwner && query.serverOwner !== "ALL") params.set("serverOwner", query.serverOwner);

  if (query.createDateFrom) params.set("createDateFrom", query.createDateFrom);
  if (query.createDateTo) params.set("createDateTo", query.createDateTo);

  if (query.decommissionDateFrom) params.set("decommissionDateFrom", query.decommissionDateFrom);
  if (query.decommissionDateTo) params.set("decommissionDateTo", query.decommissionDateTo);

  if (query.terminatedDateFrom) params.set("terminatedDateFrom", query.terminatedDateFrom);
  if (query.terminatedDateTo) params.set("terminatedDateTo", query.terminatedDateTo);

  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));

  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);

  const res = await fetch(`${API_BASE}/api/servers?${params.toString()}`, {
    cache: "no-store",
    headers: defaultHeaders,
  });

  if (!res.ok) {
    let details = "";
    try {
      details = await res.text(); // backend sends { error: "..." }
    } catch { }
    throw new Error(`fetchServers failed: ${res.status} ${details}`);
  }

  return res.json();
}

export async function fetchServerDetail(id: string): Promise<ServerDetail> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    cache: "no-store",
    headers: defaultHeaders,
  });

  if (!res.ok) {
    throw new Error(`fetchServerDetail failed: ${res.status}`);
  }

  return res.json();
}


//Edit and Delete
export async function updateServer(id: string, patch: Partial<ServerDetail>): Promise<ServerDetail> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...defaultHeaders,
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`updateServer failed: ${res.status}`);
  return res.json();
}

export async function deleteServer(id: string): Promise<{ ok: true; id: string }> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    method: "DELETE",
    headers: defaultHeaders,
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
      ...defaultHeaders,
    },
    body: JSON.stringify(payload),
  });


  if (!res.ok) throw new Error(`createServer failed: ${res.status}`);
  return res.json();
}

