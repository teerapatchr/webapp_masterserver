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




export default function DashboardPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("ALL");
    const [env, setEnv] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [power, setPower] = useState("ALL");
    const [critical, setCritical] = useState("ALL");
    const [serverOwner, setServerOwner] = useState("ALL");
    const [selected, setSelected] = useState<ServerDetail | null>(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ServerInventory[]>([]);
    const [loading, setLoading] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [createDateFrom, setCreateDateFrom] = useState("");
    const [createDateTo, setCreateDateTo] = useState("");
    const [decommissionDateFrom, setDecommissionDateFrom] = useState("");
    const [decommissionDateTo, setDecommissionDateTo] = useState("");
    const [terminatedDateFrom, setTerminatedDateFrom] = useState("");
    const [terminatedDateTo, setTerminatedDateTo] = useState("");
    //User Management
    const admin = isAdmin();
    const [userOpen, setUserOpen] = useState(false);



    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(100);

    //Set Page setting here
    const [meta, setMeta] = useState({
        page: 1,
        limit: 100,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const start = meta.totalItems === 0 ? 0 : (meta.page - 1) * limit + 1;
    const end = Math.min(meta.page * limit, meta.totalItems);


    //Set Click Row to show details in Modal
    const handleRowClick = async (id: string) => {
        try {
            setOpen(true);        // open modal immediately
            setSelected(null);   // reset previous data

            const detail: ServerDetail = await fetchServerDetail(id);
            setSelected(detail);
        } catch (e) {
            console.error("Failed to load server detail", e);
            setOpen(false);
        }
    };

    //Set Default Visible Columns here
    const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
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

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchServers({
                q: search,
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
                page,
                limit,
            });
            setItems(res.items);
            setMeta(res.meta);

        } finally {
            setLoading(false);
        }
    }, [
        search,
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
        page,
        limit,
    ]);

    const [visibleFilters, setVisibleFilters] = useState<VisibleFilters>(
        DEFAULT_VISIBLE_FILTERS
    );

    const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(
        DEFAULT_VISIBLE_COLUMNS
    );

    const [columnPickerOpen, setColumnPickerOpen] = useState(false);


    //Logout function
    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

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
        refetch();
    }, [refetch]);

    useEffect(() => {
        setPage(1);
    }, [
        search,
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
        terminatedDateTo
    ]);

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

    const handleVisibleFiltersChange = (next: VisibleFilters) => {
        if (!next.location) setLocation("ALL");
        if (!next.env) setEnv("ALL");
        if (!next.status) setStatus("ALL");
        if (!next.power) setPower("ALL");
        if (!next.critical) setCritical("ALL");

        if (!next.createDate) {
            setCreateDateFrom("");
            setCreateDateTo("");
        }

        if (!next.decommissionDate) {
            setDecommissionDateFrom("");
            setDecommissionDateTo("");
        }

        if (!next.terminatedDate) {
            setTerminatedDateFrom("");
            setTerminatedDateTo("");
        }

        setVisibleFilters(next);
        setPage(1);
    };

    type ColumnKey =
        | "server_name"
        | "ip_address"
        | "application_name"
        | "location"
        | "system_environment"
        | "status"
        | "power_state"
        | "critical_app"
        | "pttep_server_owner";

    const [dragKey, setDragKey] = useState<ColumnKey | null>(null);

    const moveItem = (arr: ColumnKey[], from: number, to: number) => {
        const copy = [...arr];
        const [item] = copy.splice(from, 1);
        copy.splice(to, 0, item);
        return copy;
    };

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
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
                    q: search,
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
                }}
            />

            {/* Filters */}
            <ServerFilters
                search={search}
                onSearchChange={setSearch}
                location={location}
                onLocationChange={setLocation}
                env={env}
                onEnvChange={setEnv}
                status={status}
                onStatusChange={setStatus}
                power={power}
                onPowerChange={setPower}
                critical={critical}
                onCriticalChange={setCritical}
                visibleFilters={visibleFilters}
                onVisibleFiltersChange={handleVisibleFiltersChange}
                serverOwner={serverOwner}
                onServerOwnerChange={setServerOwner}

                createDateFrom={createDateFrom}
                onCreateDateFromChange={setCreateDateFrom}

                createDateTo={createDateTo}
                onCreateDateToChange={setCreateDateTo}

                decommissionDateFrom={decommissionDateFrom}
                onDecommissionDateFromChange={setDecommissionDateFrom}

                decommissionDateTo={decommissionDateTo}
                onDecommissionDateToChange={setDecommissionDateTo}

                terminatedDateFrom={terminatedDateFrom}
                onTerminatedDateFromChange={setTerminatedDateFrom}

                terminatedDateTo={terminatedDateTo}
                onTerminatedDateToChange={setTerminatedDateTo}
            />


            {/* Count + Table */}
            <div className="space-y-2">
                <ServerTable
                    data={items}
                    onRowClick={handleRowClick}
                    visibleColumns={visibleColumns}
                />

                <div className="flex items-center justify-between pt-4">
                    {/* Left: Showing text */}
                    <div className="text-sm text-muted-foreground">
                        Showing {start}–{end} of {meta.totalItems} servers
                    </div>

                    {/* Middle: Rows per page */}
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

                    {/* Right: Pagination */}
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

                {/*Add Server Modal*/}
                <AddServerModal
                    open={addOpen}
                    onClose={() => setAddOpen(false)}
                    onCreated={() => {
                        refetch();
                    }}
                />

                <AddUserModal
                    open={userOpen}
                    onClose={() => setUserOpen(false)}
                />

                {/*Server Details Modal*/}
                <ServerDetailsModal
                    open={open}
                    onClose={() => setOpen(false)}
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

                {/*Column Picker Modal*/}
                <Dialog open={columnPickerOpen} onOpenChange={setColumnPickerOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Choose Columns</DialogTitle>
                            <DialogDescription>
                                Customize which columns appear in the table.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                            {visibleColumns.map((key, index) => {
                                const locked = key === "server_name" || key === "ip_address";
                                const checked = visibleColumns.includes(key);

                                const labelMap: Record<ColumnKey, string> = {
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

                                return (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                                        draggable={!locked}
                                        onDragStart={() => setDragKey(key)}
                                        onDragEnd={() => setDragKey(null)}
                                        onDragOver={(e) => {
                                            // allow dropping
                                            e.preventDefault();
                                        }}
                                        onDrop={() => {
                                            if (!dragKey) return;
                                            if (dragKey === key) return;

                                            // do not allow dropping above locked columns
                                            const lockedCount = 2; // server_name + ip_address
                                            const from = visibleColumns.indexOf(dragKey);
                                            const to = index;

                                            // prevent moving locked items (just in case)
                                            if (dragKey === "server_name" || dragKey === "ip_address") return;

                                            // prevent placing anything before the locked block
                                            const safeTo = Math.max(lockedCount, to);

                                            setVisibleColumns((prev) => moveItem(prev, from, safeTo));
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Drag handle */}
                                            <div
                                                className={`text-muted-foreground select-none ${locked ? "opacity-40 cursor-not-allowed" : "cursor-grab"
                                                    }`}
                                                title={locked ? "Locked column" : "Drag to reorder"}
                                            >
                                                ≡
                                            </div>

                                            <div className="text-sm font-medium">{labelMap[key]}</div>
                                        </div>

                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={checked}
                                            disabled={locked}
                                            onChange={(e) => {
                                                const nextChecked = e.target.checked;

                                                setVisibleColumns((prev) => {
                                                    if (nextChecked) return Array.from(new Set([...prev, key]));
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
