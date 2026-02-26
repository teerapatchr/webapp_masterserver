"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createServer } from "@/lib/server-api";
import type { ServerDetail } from "@/lib/types";

type FormState = {
    id: string;
    server_name: string;
    ip_address: string;
    dns_name: string;

    power_state: string;
    create_date: string;

    location: string;
    zone_lv: string;

    application_name: string;
    system_environment: string;
    function: string;

    status: string;

    decommission_date: string;
    decom_duration_days: string;
    need_terminate_process: string;
    terminated_date: string;

    os: string;
    os_version: string;
    service_pack: string;

    cpu: string;
    memory: string;
    disk: string;

    update_patch_project: string;
    veritas_backup: string;
    test_dr: string;

    critical_app: string;

    pttep_server_owner: string;
    pttep_application_owner: string;

    application_support_department: string;
    application_support_name: string;
    application_support_email: string;

    server_focal_point: string;

    request_channel_for_pttep: string;
    ticket_id_request_for_ptt_digital: string;

    remark: string;
};

const EMPTY: FormState = {
    id: "",

    server_name: "",
    ip_address: "",
    dns_name: "",

    power_state: "",
    create_date: "",

    location: "",
    zone_lv: "",

    application_name: "",
    system_environment: "",
    function: "",

    status: "",

    decommission_date: "",
    decom_duration_days: "",
    need_terminate_process: "",
    terminated_date: "",

    os: "",
    os_version: "",
    service_pack: "",

    cpu: "",
    memory: "",
    disk: "",

    update_patch_project: "",
    veritas_backup: "",
    test_dr: "",

    critical_app: "",

    pttep_server_owner: "",
    pttep_application_owner: "",

    application_support_department: "",
    application_support_name: "",
    application_support_email: "",

    server_focal_point: "",

    request_channel_for_pttep: "",
    ticket_id_request_for_ptt_digital: "",

    remark: "",
};

function toNullIfEmpty(v: string) {
    const t = v.trim();
    return t === "" ? null : t;
}

function toIntOrNull(v: string) {
    const t = v.trim();
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
}

export function AddServerModal({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (created: ServerDetail) => void;
}) {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const reset = () => setForm(EMPTY);

    // ✅ Adjust these if your DB has different NOT NULL rules.
    // This prevents “upload error” from missing required fields in most schemas.
    const requiredOk = useMemo(() => {
        return (
            form.server_name.trim() !== "" &&
            form.ip_address.trim() !== "" &&
            form.location.trim() !== "" &&
            form.system_environment.trim() !== "" &&
            form.status.trim() !== "" &&
            form.power_state.trim() !== "" &&
            form.critical_app.trim() !== "" &&
            form.pttep_server_owner.trim() !== ""
        );
    }, [form]);

    const handleCreate = async () => {
        try {
            setSaving(true);

            // Build payload matching your DB columns
            const payload = {
                server_name: toNullIfEmpty(form.server_name),
                ip_address: toNullIfEmpty(form.ip_address),
                dns_name: toNullIfEmpty(form.dns_name),

                power_state: toNullIfEmpty(form.power_state),
                create_date: toNullIfEmpty(form.create_date),

                location: toNullIfEmpty(form.location),
                zone_lv: toNullIfEmpty(form.zone_lv),

                application_name: toNullIfEmpty(form.application_name),
                system_environment: toNullIfEmpty(form.system_environment),
                function: toNullIfEmpty(form.function),

                status: toNullIfEmpty(form.status),

                decommission_date: toNullIfEmpty(form.decommission_date),
                decom_duration_days: toIntOrNull(form.decom_duration_days),
                need_terminate_process: toNullIfEmpty(form.need_terminate_process),
                terminated_date: toNullIfEmpty(form.terminated_date),

                os: toNullIfEmpty(form.os),
                os_version: toNullIfEmpty(form.os_version),
                service_pack: toNullIfEmpty(form.service_pack),

                cpu: toNullIfEmpty(form.cpu),
                memory: toNullIfEmpty(form.memory),
                disk: toNullIfEmpty(form.disk),

                update_patch_project: toNullIfEmpty(form.update_patch_project),
                veritas_backup: toNullIfEmpty(form.veritas_backup),
                test_dr: toNullIfEmpty(form.test_dr),

                critical_app: toNullIfEmpty(form.critical_app),

                pttep_server_owner: toNullIfEmpty(form.pttep_server_owner),
                pttep_application_owner: toNullIfEmpty(form.pttep_application_owner),

                application_support_department: toNullIfEmpty(form.application_support_department),
                application_support_name: toNullIfEmpty(form.application_support_name),
                application_support_email: toNullIfEmpty(form.application_support_email),

                server_focal_point: toNullIfEmpty(form.server_focal_point),

                request_channel_for_pttep: toNullIfEmpty(form.request_channel_for_pttep),
                ticket_id_request_for_ptt_digital: toNullIfEmpty(form.ticket_id_request_for_ptt_digital),

                remark: toNullIfEmpty(form.remark),
            } as any;

            const created = await createServer(payload);

            onCreated(created);
            reset();
            onClose();
        } catch (e) {
            console.error(e);
            alert("Create failed (check console + backend error log).");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={() => {
                reset();
                onClose();
            }}
        >
            <DialogContent className="!w-[90vw] !max-w-[90vw] !h-[90vh] flex flex-col overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Server</DialogTitle>
                </DialogHeader>

                {/* Enterprise layout: 2 columns on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 pr-2">
                    {/* LEFT: Identity + Runtime */}
                    <div className="space-y-4">
                        <Section title="Identity (Required)">
                            <Field
                                label="Server Name"
                                value={form.server_name}
                                onChange={set("server_name")}
                                placeholder="e.g. PTTEP-SRV-NEW-01"
                            />
                            <Field label="IP Address" value={form.ip_address} onChange={set("ip_address")} placeholder="e.g. 10.10.10.10" />
                            <Field label="DNS Name" value={form.dns_name} onChange={set("dns_name")} placeholder="optional" />
                        </Section>

                        <Section title="Operations (Required)">
                            <Field label="Power State" value={form.power_state} onChange={set("power_state")} placeholder='e.g. "On" / "Off"' />
                            <Field label="Status" value={form.status} onChange={set("status")} placeholder='e.g. "Active" / "Inactive"' />
                            <Field label="Critical App" value={form.critical_app} onChange={set("critical_app")} placeholder='e.g. "Yes" / "No"' />
                            <Field label="Create Date" value={form.create_date} onChange={set("create_date")} placeholder="YYYY-MM-DD (optional)" />
                        </Section>

                        <Section title="Location (Required)">
                            <Field label="Location" value={form.location} onChange={set("location")} placeholder='e.g. "Bangkok DC"' />
                            <Field label="Zone LV" value={form.zone_lv} onChange={set("zone_lv")} placeholder="optional" />
                        </Section>
                    </div>

                    {/* RIGHT: Application + Spec + Support */}
                    <div className="space-y-4">
                        <Section title="Application / Environment">
                            <Field label="Application Name" value={form.application_name} onChange={set("application_name")} placeholder="optional" />
                            <Field
                                label="System Environment (Required)"
                                value={form.system_environment}
                                onChange={set("system_environment")}
                                placeholder='e.g. "DEV" / "UAT" / "PRD"'
                            />
                            <Field label="Function" value={form.function} onChange={set("function")} placeholder="optional" />
                        </Section>

                        <Section title="Specs">
                            <Field label="OS" value={form.os} onChange={set("os")} placeholder="optional" />
                            <Field label="OS Version" value={form.os_version} onChange={set("os_version")} placeholder="optional" />
                            <Field label="Service Pack" value={form.service_pack} onChange={set("service_pack")} placeholder="optional" />
                            <Field label="CPU" value={form.cpu} onChange={set("cpu")} placeholder="optional" />
                            <Field label="Memory" value={form.memory} onChange={set("memory")} placeholder="optional" />
                            <Field label="Disk" value={form.disk} onChange={set("disk")} placeholder="optional" />
                        </Section>

                        <Section title="Ownership / Support (Required owner)">
                            <Field
                                label="PTTEP Server Owner (Required)"
                                value={form.pttep_server_owner}
                                onChange={set("pttep_server_owner")}
                                placeholder="e.g. IT Infrastructure Team"
                            />
                            <Field label="PTTEP Application Owner" value={form.pttep_application_owner} onChange={set("pttep_application_owner")} placeholder="optional" />
                            <Field
                                label="Support Department"
                                value={form.application_support_department}
                                onChange={set("application_support_department")}
                                placeholder="optional"
                            />
                            <Field label="Support Name" value={form.application_support_name} onChange={set("application_support_name")} placeholder="optional" />
                            <Field
                                label="Support Email"
                                value={form.application_support_email}
                                onChange={set("application_support_email")}
                                placeholder="optional"
                            />
                            <Field label="Server Focal Point" value={form.server_focal_point} onChange={set("server_focal_point")} placeholder="optional" />
                        </Section>

                        <Section title="Decommission / Process">
                            <Field label="Decommission Date" value={form.decommission_date} onChange={set("decommission_date")} placeholder="YYYY-MM-DD (optional)" />
                            <Field
                                label="Decom Duration (days)"
                                value={form.decom_duration_days}
                                onChange={set("decom_duration_days")}
                                placeholder="number (optional)"
                            />
                            <Field
                                label="Need Terminate Process"
                                value={form.need_terminate_process}
                                onChange={set("need_terminate_process")}
                                placeholder='e.g. "Yes" / "No" (optional)'
                            />
                            <Field label="Terminated Date" value={form.terminated_date} onChange={set("terminated_date")} placeholder="YYYY-MM-DD (optional)" />
                        </Section>

                        <Section title="Maintenance / DR">
                            <Field label="Update Patch Project" value={form.update_patch_project} onChange={set("update_patch_project")} placeholder="optional" />
                            <Field label="Veritas Backup" value={form.veritas_backup} onChange={set("veritas_backup")} placeholder="optional" />
                            <Field label="Test DR" value={form.test_dr} onChange={set("test_dr")} placeholder="optional" />
                        </Section>

                        <Section title="Request / Ticket / Remark">
                            <Field
                                label="Request Channel for PTTEP"
                                value={form.request_channel_for_pttep}
                                onChange={set("request_channel_for_pttep")}
                                placeholder="optional"
                            />
                            <Field
                                label="Ticket ID Request for PTT Digital"
                                value={form.ticket_id_request_for_ptt_digital}
                                onChange={set("ticket_id_request_for_ptt_digital")}
                                placeholder="optional"
                            />
                            <Field label="Remark" value={form.remark} onChange={set("remark")} placeholder="optional" />
                        </Section>
                    </div>
                </div>

                <div className="mt-auto bg-background border-t pt-4 pb-4 -mx-6 px-6 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            reset();
                            onClose();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={saving || !requiredOk}>
                        {saving ? "Creating..." : "Create"}
                    </Button>
                </div>

                {!requiredOk && (
                    <div className="text-xs text-muted-foreground pt-2">
                        Fill required fields: Server Name, IP, Location, Environment, Status, Power State, Critical App, PTTEP Server Owner
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-semibold">{title}</div>
            {children}
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <Input value={value} onChange={onChange} placeholder={placeholder} />
        </div>
    );
}