"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { exportServersCsv, fetchExportColumns, type ExportCol } from "@/lib/server-api";


type Props = {
    open: boolean;
    onClose: () => void;

    // pass current filters from dashboard
    filters: {
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
};

export function ExportCsvModal({ open, onClose, filters }: Props) {
    const [cols, setCols] = React.useState<ExportCol[]>([]);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [search, setSearch] = React.useState("");
    const [loadingCols, setLoadingCols] = React.useState(false);

    // load columns when modal opens
    React.useEffect(() => {
        if (!open) return;

        // set defaults immediately so button isn't dead
        setSelected(
            new Set(["server_name", "ip_address", "application_name", "location", "system_environment"])
        );

        setLoadingCols(true);
        setLoadError(null);

        (async () => {
            try {
                // use your real backend base URL
                const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
                const res = await fetch(`${base}/api/servers/export-columns`);

                const data = await res.json();
                if (!Array.isArray(data)) {
                    throw new Error(typeof data?.error === "string" ? data.error : "export-columns did not return an array");
                }

                setCols(data);
            } catch (err: unknown) {
                setCols([]);
                setLoadError(
                    err instanceof Error ? err.message : "Failed to load export columns"
                );
            } finally {
                setLoadingCols(false);
            }
        })();
    }, [open]);

    const toggle = (key: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const filteredCols = cols.filter((c) => {
        const s = search.trim().toLowerCase();
        if (!s) return true;
        return c.key.toLowerCase().includes(s) || c.label.toLowerCase().includes(s) || c.group.toLowerCase().includes(s);
    });

    const allFilteredKeys = filteredCols.map((c) => c.key);

    const allFilteredSelected =
        allFilteredKeys.length > 0 &&
        allFilteredKeys.every((key) => selected.has(key));

    const toggleSelectAllFiltered = (checked: boolean) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (checked) {
                allFilteredKeys.forEach((key) => next.add(key));
            } else {
                allFilteredKeys.forEach((key) => next.delete(key));
            }

            return next;
        });
    };


    const clearAll = () => setSelected(new Set());

    const exportNow = () => {
        const columns = Array.from(selected).join(",");

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
            columns,
        });

        // trigger download
        const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
        window.location.href = `${base}/api/servers/export?${params.toString()}`;
        onClose();
    };


    // group for nicer UI
    const grouped = filteredCols.reduce<Record<string, ExportCol[]>>((acc, c) => {
        (acc[c.group] ||= []).push(c);
        return acc;
    }, {});

    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Export CSV</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        Exports ALL rows that match current filters (not just this page).
                    </div>


                    <Input
                        placeholder="Search columns…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />


                    {loadingCols && (
                        <div className="text-sm text-muted-foreground">Loading columns...</div>
                    )}

                    {loadError && (
                        <div className="text-sm text-red-600">{loadError}</div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox
                                checked={allFilteredSelected}
                                onCheckedChange={(checked) => toggleSelectAllFiltered(!!checked)}
                            />
                            <span>Select all</span>
                        </label>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearAll}
                            disabled={selected.size === 0}
                        >
                            Clear
                        </Button>
                    </div>

                    <div className="max-h-[50vh] overflow-auto border rounded-md p-3 space-y-4">
                        {Object.entries(grouped).map(([group, items]) => (
                            <div key={group} className="space-y-2">
                                <div className="text-sm font-semibold">{group}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {items.map((c) => (
                                        <label key={c.key} className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={selected.has(c.key)} onCheckedChange={() => toggle(c.key)} />
                                            <span>{c.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={exportNow} disabled={selected.size === 0}>Export CSV</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
