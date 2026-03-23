"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createServer } from "@/lib/server-api";
import type { ServerDetail } from "@/lib/types";
import { buildCreateServerPayload } from "@/lib/server/buildCreateServerPayload";
import {
    POWER_STATE_OPTIONS,
    STATUS_OPTIONS,
    YES_NO_OPTIONS,
    ENV_OPTIONS,
    LOCATION_OPTIONS,
} from "./add-server-component/config";
import { Section, Field, SelectField } from "./add-server-component/fields";
import { useAddServerForm } from "./add-server-component/useAddServerForm";

export function AddServerModal({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (created: ServerDetail) => void;
}) {
    const { form, setField, setSelectField, setDateField, reset, requiredOk } =
        useAddServerForm();
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        try {
            setSaving(true);
            // Payload in lib/server/buildCreateServerPayload.ts will convert empty string to undefined or null based on your DB schema needs.
            const payload = buildCreateServerPayload(form);
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 pr-2">
                    <div className="space-y-4">
                        <Section title="Identity">
                            <Field
                                label="Server Name"
                                value={form.server_name}
                                onChange={setField("server_name")}
                                placeholder="e.g. PTTEP-SRV-NEW-01"
                                required
                            />
                            <Field label="IP Address" value={form.ip_address} onChange={setField("ip_address")} placeholder="e.g. 10.10.10.10" required />
                            <Field label="DNS Name" value={form.dns_name} onChange={setField("dns_name")} placeholder="optional" required />
                        </Section>

                        <Section title="Operations">
                            <SelectField
                                label="Power State"
                                value={form.power_state}
                                onValueChange={setSelectField("power_state")}
                                placeholder="Select power state"
                                options={POWER_STATE_OPTIONS}
                                required
                            />
                            <SelectField
                                label="Status"
                                value={form.status}
                                onValueChange={setSelectField("status")}
                                placeholder="Select status"
                                options={STATUS_OPTIONS}
                                required
                            />
                            <SelectField
                                label="Critical App"
                                value={form.critical_app}
                                onValueChange={setSelectField("critical_app")}
                                placeholder="Select yes or no"
                                options={YES_NO_OPTIONS}
                                required
                            />
                            <Field
                                label="Create Date"
                                value={form.create_date}
                                onChange={setDateField("create_date")}
                                type="date"
                                required
                            />
                        </Section>

                        <Section title="Location">
                            <SelectField
                                label="Location"
                                value={form.location}
                                onValueChange={setSelectField("location")}
                                placeholder='e.g. "HQ"'
                                options={LOCATION_OPTIONS}
                                required
                            />
                            <Field label="Zone LV" value={form.zone_lv} onChange={setField("zone_lv")} placeholder="optional" />
                        </Section>
                    </div>

                    {/* RIGHT: Application + Spec + Support */}
                    <div className="space-y-4">
                        <Section title="Application / Environment">
                            <Field label="Application Name" value={form.application_name} onChange={setField("application_name")} placeholder="optional" required />
                            <SelectField
                                label="System Environment"
                                value={form.system_environment}
                                onValueChange={setSelectField("system_environment")}
                                placeholder="Select environment"
                                options={ENV_OPTIONS}
                                required
                            />
                            <Field label="Function" value={form.function} onChange={setField("function")} placeholder="optional" />
                        </Section>

                        <Section title="Specs">
                            <Field label="OS" value={form.os} onChange={setField("os")} placeholder="optional" />
                            <Field label="OS Version" value={form.os_version} onChange={setField("os_version")} placeholder="optional" />
                            <Field label="Service Pack" value={form.service_pack} onChange={setField("service_pack")} placeholder="optional" />
                            <Field label="CPU" value={form.cpu} onChange={setField("cpu")} placeholder="optional" />
                            <Field label="Memory" value={form.memory} onChange={setField("memory")} placeholder="optional" />
                            <Field label="Disk" value={form.disk} onChange={setField("disk")} placeholder="optional" />
                        </Section>

                        <Section title="Ownership / Support">
                            <Field
                                label="PTTEP Server Owner"
                                value={form.pttep_server_owner}
                                onChange={setField("pttep_server_owner")}
                                placeholder="e.g. IT Infrastructure Team"
                                required
                            />
                            <Field label="PTTEP Application Owner" value={form.pttep_application_owner} onChange={setField("pttep_application_owner")} placeholder="optional" />
                            <Field
                                label="Support Department"
                                value={form.application_support_department}
                                onChange={setField("application_support_department")}
                                placeholder="optional"
                            />
                            <Field label="Support Name" value={form.application_support_name} onChange={setField("application_support_name")} placeholder="optional" />
                            <Field
                                label="Support Email"
                                value={form.application_support_email}
                                onChange={setField("application_support_email")}
                                placeholder="optional"
                            />
                            <Field label="Server Focal Point" value={form.server_focal_point} onChange={setField("server_focal_point")} placeholder="optional" />
                        </Section>

                        <Section title="Decommission / Process">
                            <Field
                                label="Decommission Date"
                                value={form.decommission_date}
                                onChange={setDateField("decommission_date")}
                                type="date"
                            />
                            <Field
                                label="Decom Duration (days)"
                                value={form.decom_duration_days}
                                onChange={setField("decom_duration_days")}
                                placeholder="number (optional)"
                            />
                            <Field
                                label="Need Terminate Process"
                                value={form.need_terminate_process}
                                onChange={setField("need_terminate_process")}
                                placeholder='e.g. "Yes" / "No" (optional)'
                            />
                            <Field
                                label="Terminated Date"
                                value={form.terminated_date}
                                onChange={setDateField("terminated_date")}
                                type="date"
                            />
                        </Section>

                        <Section title="Maintenance / DR">
                            <Field label="Update Patch Project" value={form.update_patch_project} onChange={setField("update_patch_project")} placeholder="optional" />
                            <Field label="Veritas Backup" value={form.veritas_backup} onChange={setField("veritas_backup")} placeholder="optional" />
                            <SelectField
                                label="Test DR"
                                value={form.test_dr}
                                onValueChange={setSelectField("test_dr")}
                                placeholder="Select yes or no"
                                options={YES_NO_OPTIONS}
                            />
                        </Section>

                        <Section title="Request / Ticket / Remark">
                            <Field
                                label="Request Channel for PTTEP"
                                value={form.request_channel_for_pttep}
                                onChange={setField("request_channel_for_pttep")}
                                placeholder="optional"
                            />
                            <Field
                                label="Ticket ID Request for PTT Digital"
                                value={form.ticket_id_request_for_ptt_digital}
                                onChange={setField("ticket_id_request_for_ptt_digital")}
                                placeholder="optional"
                            />
                            <Field label="Remark" value={form.remark} onChange={setField("remark")} placeholder="optional" />
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
            </DialogContent>
        </Dialog>
    );
}