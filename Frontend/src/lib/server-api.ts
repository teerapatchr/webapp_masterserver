import type { ServerListQuery, ServerListResponse } from "@/lib/api-types";
import type { ServerDetail } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export async function fetchServers(query: ServerListQuery): Promise<ServerListResponse> {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.location) params.set("location", query.location);
  if (query.env) params.set("env", query.env);
  if (query.status) params.set("status", query.status);
  if (query.power) params.set("power", query.power);
  if (query.critical) params.set("critical", query.critical);

  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));

  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);

  const res = await fetch(`${API_BASE}/api/servers?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`fetchServers failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchServerDetail(id: string): Promise<ServerDetail> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    cache: "no-store",
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`updateServer failed: ${res.status}`);
  return res.json();
}

export async function deleteServer(id: string): Promise<{ ok: true; id: string }> {
  const res = await fetch(`${API_BASE}/api/servers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deleteServer failed: ${res.status}`);
  return res.json();
}

//Add server 
export async function createServer(payload: Partial<ServerDetail>): Promise<ServerDetail> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

  const res = await fetch(`${API_BASE}/api/servers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`createServer failed: ${res.status}`);
  return res.json();
}
