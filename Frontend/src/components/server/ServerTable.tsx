"use client";
import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import type { ServerInventory } from "@/lib/types";
import type { VisibleFilters } from "@/components/server/ServerFilters";

function PowerDot({ state }: { state: string }) {
    const s = (state ?? "").toLowerCase();
    const isOn = s.includes("on");
    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-3 w-3 rounded-full ${isOn ? "bg-green-500" : "bg-slate-400"
                    }`}
            />
            <span className="text-sm">{state || "-"}</span>
        </div>
    );
}

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

export function ServerTable({
    data,
    onRowClick,
    visibleFilters,
    visibleColumns,
}: {
    data: ServerInventory[];
    onRowClick: (id: string) => void;
    visibleFilters: VisibleFilters;
    visibleColumns: ColumnKey[];
}) {
    const parentRef = useRef<HTMLDivElement>(null);

    const columns = useMemo(() => {
        const base = [
            { key: "server_name", label: "Server Name", width: "minmax(180px, 1.2fr)" },
            { key: "ip_address", label: "IP Address", width: "minmax(150px, 1fr)" },
            { key: "application_name", label: "Application Name", width: "minmax(220px, 2fr)" },
        ];

        const optional = [
            { key: "location", label: "Location", width: "minmax(120px, 1fr)" },
            { key: "system_environment", label: "Environment", width: "minmax(120px, 1fr)" },
            { key: "status", label: "Status", width: "minmax(140px, 1.1fr)" },
            { key: "power_state", label: "Power State", width: "minmax(120px, 1fr)" },
            { key: "critical_app", label: "Critical", width: "minmax(100px, 0.8fr)" },
        ];

        const tail = [
            { key: "pttep_server_owner", label: "Owner", width: "1.5fr" },
        ];

        const all = [...base, ...optional, ...tail];

        // keep ONLY the visible columns
        const visible = all.filter((c) => visibleColumns.includes(c.key as ColumnKey));

        // reorder to match visibleColumns order
        const byKey = new Map(visible.map((c) => [c.key as ColumnKey, c]));
        return visibleColumns.map((k) => byKey.get(k)).filter(Boolean) as typeof visible;
    }, [visibleFilters, visibleColumns]);


    const gridTemplateColumns = useMemo(
        () => columns.map((c) => c.width).join(" "),
        [columns]
    );

    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 56, // row height
        overscan: 10,
    });

    return (
        <div className="rounded-xl border overflow-hidden">
            {/* Header */}
            <div
                className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm"
                style={{ display: "grid", gridTemplateColumns }}
            >
                {columns.map((c) => (
                    <div key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {c.label}
                    </div>
                ))}
            </div>

            {/* Body (virtualized) */}
            <div ref={parentRef} className="h-[520px] overflow-auto">
                <div
                    style={{
                        height: rowVirtualizer.getTotalSize(),
                        position: "relative",
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((vr) => {
                        const s = data[vr.index];

                        return (
                            <div
                                key={s.id}
                                onClick={() => onRowClick(s.id)}
                                className="absolute left-0 right-0 border-b hover:bg-muted/40 cursor-pointer"
                                style={{
                                    transform: `translateY(${vr.start}px)`,
                                    display: "grid",
                                    gridTemplateColumns,
                                    alignItems: "center",
                                    height: 56,
                                }}
                            >
                                {columns.map((c) => {
                                    switch (c.key) {
                                        case "server_name":
                                            return (
                                                <div
                                                    key={c.key}
                                                    className="px-4 py-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={s.server_name}
                                                >
                                                    {s.server_name}
                                                </div>
                                            );

                                        case "ip_address":
                                            return (
                                                <div
                                                    key={c.key}
                                                    className="px-4 py-3 font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={s.ip_address}
                                                >
                                                    {s.ip_address}
                                                </div>
                                            );

                                        case "application_name":
                                            return (
                                                <div
                                                    key={c.key}
                                                    className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={s.application_name}
                                                >
                                                    {s.application_name}
                                                </div>
                                            );

                                        case "location":
                                            return (
                                                <div key={c.key} className="px-4 py-3">
                                                    <Badge variant="outline">{s.location}</Badge>
                                                </div>
                                            );

                                        case "system_environment": {
                                            const env = s.system_environment;

                                            const envColor =
                                                env === "PRD"
                                                    ? "bg-red-100 text-red-700"
                                                    : env === "UAT"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : env === "QAS"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : env === "DEV"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : env === "POC"
                                                                    ? "bg-purple-100 text-purple-700"
                                                                    : "bg-gray-100 text-gray-700";

                                            return (
                                                <div key={c.key} className="px-4 py-3">
                                                    <Badge className={envColor}>{env}</Badge>
                                                </div>
                                            );
                                        }

                                        case "status": {
                                            const status = s.status;

                                            const statusColor =
                                                status === "Operation"
                                                    ? "bg-green-100 text-green-700"
                                                    : status === "Decommissioning"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : status === "Terminated"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700";

                                            return (
                                                <div key={c.key} className="px-4 py-3">
                                                    <Badge className={statusColor}>{status}</Badge>
                                                </div>
                                            );
                                        }

                                        case "power_state":
                                            return (
                                                <div key={c.key} className="px-4 py-3">
                                                    <PowerDot state={s.power_state} />
                                                </div>
                                            );

                                        case "critical_app":
                                            return (
                                                <div key={c.key} className="px-4 py-3">
                                                    {s.critical_app === "Yes" ? (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No</span>
                                                    )}
                                                </div>
                                            );

                                        case "pttep_server_owner":
                                            return (
                                                <div
                                                    key={c.key}
                                                    className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis"
                                                    title={s.pttep_server_owner}
                                                >
                                                    {s.pttep_server_owner}
                                                </div>
                                            );

                                        default:
                                            return (
                                                <div key={c.key} className="px-4 py-3 text-sm text-muted-foreground">
                                                    -
                                                </div>
                                            );
                                    }
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
