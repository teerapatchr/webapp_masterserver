"use client";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ServerDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateServer, deleteServer } from "@/lib/server-api";


type Props = {
    open: boolean;
    onClose: () => void;
    server: ServerDetail | null;
    onUpdated: (updated: ServerDetail) => void;
    onDeleted: (id: string) => void;
};



export function ServerDetailsModal({ open, onClose, server, onUpdated, onDeleted }: Props) {

    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<Partial<ServerDetail>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const editableKeys = new Set<keyof ServerDetail>([
        "server_name",
        "ip_address",
        "dns_name",
        "application_name",
        "location",
        "system_environment",
        "status",
        "power_state",
        "critical_app",
        "pttep_server_owner",
        "pttep_application_owner",
        "remark",
    ]);


    useEffect(() => {
        // whenever server changes/open, reset edit state
        setEditMode(false);
        setForm(server ?? {});
    }, [server, open]);

    const setField = (key: keyof ServerDetail, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!server) return;
        try {
            setSaving(true);

            // Send full form or only changed fields. Start simple: send full form.
            const updated = await updateServer(server.id, form);

            onUpdated(updated);
            setEditMode(false);
        } catch (e) {
            console.error(e);
            alert("Save failed (check console).");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!server) return;
        const ok = confirm(`Delete ${server.server_name}? This cannot be undone.`);
        if (!ok) return;

        try {
            setDeleting(true);
            const r = await deleteServer(server.id);
            onDeleted(r.id);
            onClose();
        } catch (e) {
            console.error(e);
            alert("Delete failed (check console).");
        } finally {
            setDeleting(false);
        }
    };


    if (!server) return null;

    const sections: {
        title: string;
        fields: { label: string; key: keyof ServerDetail }[];
    }[] = [
            {
                title: "Basic Information",
                fields: [
                    { label: "Server Name", key: "server_name" },
                    { label: "IP Address", key: "ip_address" },
                    { label: "DNS Name", key: "dns_name" },
                    { label: "Application Name", key: "application_name" },
                    { label: "Location", key: "location" },
                    { label: "Zone LV", key: "zone_lv" },
                    { label: "Environment", key: "system_environment" },
                    { label: "Function", key: "function" },
                    { label: "Status", key: "status" },
                    { label: "Power State", key: "power_state" },
                    { label: "Create Date", key: "create_date" },
                ],
            },
            {
                title: "Decommission",
                fields: [
                    { label: "Decommission Date", key: "decommission_date" },
                    { label: "Decom Duration (Days)", key: "decom_duration_days" },
                    { label: "Need Terminate Process", key: "need_terminate_process" },
                    { label: "Terminated Date", key: "terminated_date" },
                ],
            },
            {
                title: "System",
                fields: [
                    { label: "OS", key: "os" },
                    { label: "OS Version", key: "os_version" },
                    { label: "Service Pack", key: "service_pack" },
                    { label: "CPU", key: "cpu" },
                    { label: "Memory", key: "memory" },
                    { label: "Disk", key: "disk" },
                ],
            },
            {
                title: "Operations",
                fields: [
                    { label: "Update Patch Project", key: "update_patch_project" },
                    { label: "Veritas Backup", key: "veritas_backup" },
                    { label: "Test DR", key: "test_dr" },
                    { label: "Critical App", key: "critical_app" },
                ],
            },
            {
                title: "Ownership & Support",
                fields: [
                    { label: "PTTEP Server Owner", key: "pttep_server_owner" },
                    { label: "PTTEP Application Owner", key: "pttep_application_owner" },
                    { label: "Support Department", key: "application_support_department" },
                    { label: "Support Name", key: "application_support_name" },
                    { label: "Support Email", key: "application_support_email" },
                    { label: "Server Focal Point", key: "server_focal_point" },
                ],
            },
            {
                title: "Requests",
                fields: [
                    { label: "Request Channel (PTTEP)", key: "request_channel_for_pttep" },
                    { label: "Ticket ID (PTT Digital)", key: "ticket_id_request_for_ptt_digital" },
                ],
            },
            {
                title: "Remark",
                fields: [{ label: "Remark", key: "remark" }],
            },
        ];



    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                {/* Title + actions */}
                <div className="flex items-center justify-between gap-3">
                    <DialogHeader className="p-0">
                        <DialogTitle>{server?.server_name ?? "Server Details"}</DialogTitle>
                    </DialogHeader>


                </div>

                {/* Body */}
                <div className="space-y-6">
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-3">
                            <h3 className="font-semibold">{section.title}</h3>

                            <div className="rounded-lg border">
                                {section.fields.map((f) => (
                                    <Row
                                        key={String(f.key)}
                                        label={f.label}
                                        value={String((form as any)?.[f.key] ?? "")}
                                        editable={editMode && editableKeys.has(f.key)}
                                        onChange={(v) => setField(f.key, v)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {server && (
                    <div className="flex gap-2">
                        {!editMode ? (
                            <>
                                <Button variant="outline" onClick={() => setEditMode(true)}>
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditMode(false);
                                        setForm(server);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </DialogContent>

        </Dialog>
    );
}

function Row({
    label,
    value,
    editable,
    onChange,
}: {
    label: string;
    value?: string;
    editable?: boolean;
    onChange?: (v: string) => void;
}) {
    const shown = value && value.trim() !== "" ? value : "";
    const editableKeys = new Set<keyof ServerDetail>([
        "server_name",
        "ip_address",
        "dns_name",
        "application_name",
        "location",
        "system_environment",
        "status",
        "power_state",
        "critical_app",
        "pttep_server_owner",
        "pttep_application_owner",
        "remark",
    ]);


    return (
        <div className="grid grid-cols-3 gap-4 px-4 py-3 border-b last:border-b-0 items-center">
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className="col-span-2">
                {editable ? (
                    <Input value={shown} onChange={(e) => onChange?.(e.target.value)} />
                ) : (
                    <div className="text-sm break-words">{shown || "-"}
                    </div>
                )}
            </div>
        </div>
    );
}

