"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ServerTable } from "@/components/server/ServerTable";
import { ServerFilters, DEFAULT_VISIBLE_FILTERS, type VisibleFilters } from "@/components/server/ServerFilters";
import { ServerDetailsModal } from "@/components/server/ServerDetailsModal";
import type { ServerDetail } from "@/lib/types";
import { ExportCsvModal } from "@/components/server/ExportCsvModal";
import { fetchServers } from "@/lib/server-api";
import type { ServerInventory } from "@/lib/types";
import { fetchServerDetail } from "@/lib/server-api";
import { AddServerModal } from "@/components/server/AddServerModal";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { isAdmin } from "@/lib/auth";
import { AddUserModal } from "@/components/user/AddUserModal";

export type ColumnKey =
    | "server_name"
    | "ip_address"
    | "application_name"
    | "location"
    | "system_environment"
    | "status"
    | "power_state"
    | "critical_app"
    | "pttep_server_owner";

const ALL_COLUMNS: ColumnKey[] = [
    "server_name",
    "ip_address",
    "application_name",
    "location",
    "system_environment",
    "status",
    "power_state",
    "critical_app",
    "pttep_server_owner",
];

const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [...ALL_COLUMNS];

const COLUMN_LABELS: Record<ColumnKey, string> = {
    server_name: "Server Name",
    ip_address: "IP Address",
    application_name: "Application Name",
    location: "Location",
    system_environment: "Environment",
    status: "Status",
    power_state: "Power",
    critical_app: "Critical",
    pttep_server_owner: "Owner",
};

const LOCKED_COLUMNS = new Set<ColumnKey>(["server_name", "ip_address"]);

type FilterState = {
    search: string;
    location: string;
    env: string;
    status: string;
    power: string;
    critical: string;
    serverOwner: string;
    createDateFrom: string;
    createDateTo: string;
    decommissionDateFrom: string;
    decommissionDateTo: string;
    terminatedDateFrom: string;
    terminatedDateTo: string;
};

const DEFAULT_FILTERS: FilterState = {
    search: "",
    location: "ALL",
    env: "ALL",
    status: "ALL",
    power: "ALL",
    critical: "ALL",
    serverOwner: "ALL",
    createDateFrom: "",
    createDateTo: "",
    decommissionDateFrom: "",
    decommissionDateTo: "",
    terminatedDateFrom: "",
    terminatedDateTo: "",
};

const DEFAULT_META = {
    page: 1,
    limit: 100,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
};

function moveItem(arr: ColumnKey[], from: number, to: number): ColumnKey[] {
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
}

export default function DashboardPage() {
    const [admin, setAdmin] = useState(false);

    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100);

    const [items, setItems] = useState<ServerInventory[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [meta, setMeta] = useState(DEFAULT_META);

    const [selected, setSelected] = useState<ServerDetail | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const [addOpen, setAddOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [columnPickerOpen, setColumnPickerOpen] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
    const [visibleFilters, setVisibleFilters] = useState<VisibleFilters>(DEFAULT_VISIBLE_FILTERS);
    const [dragKey, setDragKey] = useState<ColumnKey | null>(null);

    const start = meta.totalItems === 0 ? 0 : (meta.page - 1) * limit + 1;
    const end = Math.min(meta.page * limit, meta.totalItems);

    const refetch = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetchServers({
                q: filters.search,
                location: filters.location,
                env: filters.env,
                status: filters.status,
                power: filters.power,
                critical: filters.critical,
                serverOwner: filters.serverOwner,
                createDateFrom: filters.createDateFrom,
                createDateTo: filters.createDateTo,
                decommissionDateFrom: filters.decommissionDateFrom,
                decommissionDateTo: filters.decommissionDateTo,
                terminatedDateFrom: filters.terminatedDateFrom,
                terminatedDateTo: filters.terminatedDateTo,
                page,
                limit,
            });
            setItems(res.items);
            setMeta(res.meta);
        } catch (e) {
            console.error("Failed to fetch servers:", e);
            setFetchError("Failed to load servers. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [filters, page, limit]);

    const handleRowClick = async (id: string) => {
        try {
            setDetailOpen(true);
            setSelected(null);
            const detail = await fetchServerDetail(id);
            setSelected(detail);
        } catch (e) {
            console.error("Failed to load server detail:", e);
            setDetailOpen(false);
        }
    };

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    useEffect(() => {
        setAdmin(isAdmin());
    }, []);

    // Restore persisted column/filter preferences
    useEffect(() => {
        try {
            const raw = localStorage.getItem("msis.visibleColumns");
            if (!raw) return;
            const parsed = JSON.parse(raw) as ColumnKey[];
            if (Array.isArray(parsed) && parsed.length > 0) setVisibleColumns(parsed);
        } catch { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("msis.visibleColumns", JSON.stringify(visibleColumns));
        } catch { }
    }, [visibleColumns]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("msis.visibleFilters");
            if (!raw) return;
            setVisibleFilters({ ...DEFAULT_VISIBLE_FILTERS, ...JSON.parse(raw) });
        } catch { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("msis.visibleFilters", JSON.stringify(visibleFilters));
        } catch { }
    }, [visibleFilters]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const handleVisibleFiltersChange = (next: VisibleFilters) => {
        setFilters((prev) => ({
            ...prev,
            ...(!next.location && { location: "ALL" }),
            ...(!next.env && { env: "ALL" }),
            ...(!next.status && { status: "ALL" }),
            ...(!next.power && { power: "ALL" }),
            ...(!next.critical && { critical: "ALL" }),
            ...(!next.createDate && { createDateFrom: "", createDateTo: "" }),
            ...(!next.decommissionDate && { decommissionDateFrom: "", decommissionDateTo: "" }),
            ...(!next.terminatedDate && { terminatedDateFrom: "", terminatedDateTo: "" }),
        }));
        setVisibleFilters(next);
        setPage(1);
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Server Inventory</h1>
                <div className="flex items-center gap-3">
                    {admin && (
                        <Button variant="default" onClick={() => setAddOpen(true)}>
                            <span className="mr-2">+</span>
                            Add Server
                        </Button>
                    )}
                    {admin && (
                        <Button variant="outline" onClick={() => setUserOpen(true)}>
                            Add User
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setColumnPickerOpen(true)}>
                        Columns
                    </Button>
                    <Button variant="outline" onClick={() => setExportOpen(true)}>
                        Export CSV
                    </Button>
                    <Button variant="destructive" onClick={logout}>
                        Logout
                    </Button>
                </div>
            </div>

            <ExportCsvModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                filters={{
                    q: filters.search,
                    location: filters.location,
                    env: filters.env,
                    status: filters.status,
                    power: filters.power,
                    critical: filters.critical,
                    serverOwner: filters.serverOwner,
                    createDateFrom: filters.createDateFrom,
                    createDateTo: filters.createDateTo,
                    decommissionDateFrom: filters.decommissionDateFrom,
                    decommissionDateTo: filters.decommissionDateTo,
                    terminatedDateFrom: filters.terminatedDateFrom,
                    terminatedDateTo: filters.terminatedDateTo,
                }}
            />

            <ServerFilters
                search={filters.search}
                onSearchChange={(v) => setFilters((f) => ({ ...f, search: v }))}
                location={filters.location}
                onLocationChange={(v) => setFilters((f) => ({ ...f, location: v }))}
                env={filters.env}
                onEnvChange={(v) => setFilters((f) => ({ ...f, env: v }))}
                status={filters.status}
                onStatusChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                power={filters.power}
                onPowerChange={(v) => setFilters((f) => ({ ...f, power: v }))}
                critical={filters.critical}
                onCriticalChange={(v) => setFilters((f) => ({ ...f, critical: v }))}
                visibleFilters={visibleFilters}
                onVisibleFiltersChange={handleVisibleFiltersChange}
                serverOwner={filters.serverOwner}
                onServerOwnerChange={(v) => setFilters((f) => ({ ...f, serverOwner: v }))}
                createDateFrom={filters.createDateFrom}
                onCreateDateFromChange={(v) => setFilters((f) => ({ ...f, createDateFrom: v }))}
                createDateTo={filters.createDateTo}
                onCreateDateToChange={(v) => setFilters((f) => ({ ...f, createDateTo: v }))}
                decommissionDateFrom={filters.decommissionDateFrom}
                onDecommissionDateFromChange={(v) => setFilters((f) => ({ ...f, decommissionDateFrom: v }))}
                decommissionDateTo={filters.decommissionDateTo}
                onDecommissionDateToChange={(v) => setFilters((f) => ({ ...f, decommissionDateTo: v }))}
                terminatedDateFrom={filters.terminatedDateFrom}
                onTerminatedDateFromChange={(v) => setFilters((f) => ({ ...f, terminatedDateFrom: v }))}
                terminatedDateTo={filters.terminatedDateTo}
                onTerminatedDateToChange={(v) => setFilters((f) => ({ ...f, terminatedDateTo: v }))}
            />

            <div className="space-y-2">
                {fetchError && (
                    <div className="text-sm text-red-500">{fetchError}</div>
                )}

                <ServerTable
                    data={items}
                    onRowClick={handleRowClick}
                    visibleColumns={visibleColumns}
                />

                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {start}–{end} of {meta.totalItems} servers
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Rows per page</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!meta.hasPrevPage || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Prev
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {meta.page} / {meta.totalPages}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!meta.hasNextPage || loading}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                <AddServerModal
                    open={addOpen}
                    onClose={() => setAddOpen(false)}
                    onCreated={refetch}
                />

                <AddUserModal
                    open={userOpen}
                    onClose={() => setUserOpen(false)}
                />

                <ServerDetailsModal
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    server={selected}
                    onUpdated={(updated) => {
                        setSelected(updated);
                        refetch();
                    }}
                    onDeleted={() => {
                        setSelected(null);
                        refetch();
                    }}
                />

                <Dialog open={columnPickerOpen} onOpenChange={setColumnPickerOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Choose Columns</DialogTitle>
                            <DialogDescription>
                                Customize which columns appear in the table.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                            {ALL_COLUMNS.map((key, index) => {
                                const locked = LOCKED_COLUMNS.has(key);
                                const checked = visibleColumns.includes(key);

                                return (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                                        draggable={!locked}
                                        onDragStart={() => setDragKey(key)}
                                        onDragEnd={() => setDragKey(null)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => {
                                            if (!dragKey || dragKey === key) return;
                                            if (LOCKED_COLUMNS.has(dragKey)) return;
                                            const from = visibleColumns.indexOf(dragKey);
                                            const safeTo = Math.max(LOCKED_COLUMNS.size, index);
                                            setVisibleColumns((prev) => moveItem(prev, from, safeTo));
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`text-muted-foreground select-none ${locked ? "opacity-40 cursor-not-allowed" : "cursor-grab"}`}
                                                title={locked ? "Locked column" : "Drag to reorder"}
                                            >
                                                ≡
                                            </div>
                                            <div className="text-sm font-medium">{COLUMN_LABELS[key]}</div>
                                        </div>

                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={checked}
                                            disabled={locked}
                                            onChange={(e) => {
                                                const next = e.target.checked;
                                                setVisibleColumns((prev) => {
                                                    if (next) return Array.from(new Set([...prev, key]));
                                                    return prev.filter((k) => k !== key);
                                                });
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)}
                            >
                                Reset
                            </Button>
                            <Button onClick={() => setColumnPickerOpen(false)}>Done</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
