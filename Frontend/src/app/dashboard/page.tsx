"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServerTable } from "@/components/server/ServerTable";
import { ServerFilters } from "@/components/server/ServerFilters";
import { ServerDetailsModal } from "@/components/server/ServerDetailsModal";
import type { ServerDetail } from "@/lib/types";
import { fetchServers } from "@/lib/server-api";
import type { ServerInventory } from "@/lib/types";
import { fetchServerDetail } from "@/lib/server-api";



export default function DashboardPage() {
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("ALL");
    const [env, setEnv] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [power, setPower] = useState("ALL");
    const [critical, setCritical] = useState("ALL");
    const [selected, setSelected] = useState<ServerDetail | null>(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<ServerInventory[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    console.log("page =", page);
    const limit = 10;

    const [meta, setMeta] = useState({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });

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

    useEffect(() => {
        setLoading(true);

        fetchServers({
            q: search,
            location,
            env,
            status,
            power,
            critical,
            page,
            limit,
        })
            .then((res) => {
                setItems(res.items);
                setTotalItems(res.meta.totalItems);
                setMeta(res.meta);
            })
            .finally(() => setLoading(false));
    }, [search, location, env, status, power, critical, page, limit]);





    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Server Inventory</h1>

                <div className="flex items-center gap-3">
                    <Button>
                        <span className="mr-2">+</span>
                        Add Server
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-muted" />
                </div>
            </div>

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
            />

            {/* Count + Table */}
            <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                    {loading ? "Loading..." : `Showing ${items.length} of ${totalItems} servers`}
                </div>
                <ServerTable data={items} onRowClick={handleRowClick} />

                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Page {meta.page} of {meta.totalPages} • Total {meta.totalItems} servers
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!meta.hasPrevPage || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Prev
                        </Button>

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


                <ServerDetailsModal
                    open={open}
                    onClose={() => setOpen(false)}
                    server={selected}
                />

            </div>
        </div>


    );
}
