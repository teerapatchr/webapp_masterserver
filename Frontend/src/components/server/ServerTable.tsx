"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import type { ServerInventory } from "@/lib/types";

function PowerDot({ state }: { state: string }) {
    const isOn = state.toLowerCase() === "on";
    return (
        <div className="flex items-center gap-2">
            <span
                className={`h-2.5 w-2.5 rounded-full ${isOn ? "bg-green-500" : "bg-slate-400"
                    }`}
            />
            <span className="text-sm">{state}</span>
        </div>
    );
}

export function ServerTable({
    data,
    onRowClick,
}: {
    data: ServerInventory[];
    onRowClick: (id: string) => void;
}) {
    const parentRef = useRef<HTMLDivElement>(null);

    const columns = useMemo(
        () => [
            { key: "server_name", label: "Server Name", width: "200px" },
            { key: "ip_address", label: "IP Address", width: "170px" },
            { key: "application_name", label: "Application Name", width: "220px" },
            { key: "location", label: "Location", width: "120px" },
            { key: "system_environment", label: "Environment", width: "140px" },
            { key: "status", label: "Status", width: "170px" },
            { key: "power_state", label: "Power", width: "140px" },
            { key: "critical_app", label: "Critical", width: "120px" },
            { key: "pttep_server_owner", label: "Owner", width: "140px" },
        ],
        []
    );

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
                className="sticky top-0 z-10 bg-background border-b"
                style={{ display: "grid", gridTemplateColumns }}
            >
                {columns.map((c) => (
                    <div key={c.key} className="px-4 py-3 text-sm font-medium">
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
                                <div className="px-4 py-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{s.server_name}</div>
                                <div className="px-4 py-3 font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis">{s.ip_address}</div>
                                <div className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis">{s.application_name}</div>

                                <div className="px-4 py-3">
                                    <Badge variant="outline">{s.location}</Badge>
                                </div>

                                <div className="px-4 py-3">
                                    <Badge variant="outline">{s.system_environment}</Badge>
                                </div>

                                <div className="px-4 py-3">
                                    <Badge variant="outline">{s.status}</Badge>
                                </div>

                                <div className="px-4 py-3">
                                    <PowerDot state={s.power_state} />
                                </div>

                                <div className="px-4 py-3">
                                    {s.critical_app === "Yes" ? (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                            Yes
                                        </Badge>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No</span>
                                    )}
                                </div>

                                <div
                                    className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis"
                                    title={s.pttep_server_owner}
                                >
                                    {s.pttep_server_owner}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
