"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ServerDetail } from "@/lib/types";

type Props = {
    open: boolean;
    onClose: () => void;
    server: ServerDetail | null;
};

function Row({ label, value }: { label: string; value?: string }) {
    return (
        <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
            <div className="text-sm font-medium text-muted-foreground">
                {label}
            </div>
            <div className="col-span-2 text-sm">
                {value || "-"}
            </div>
        </div>
    );
}

export function ServerDetailsModal({ open, onClose, server }: Props) {
    if (!server) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {server.server_name}
                    </DialogTitle>
                </DialogHeader>

                {/* BASIC INFO */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Basic Information</h3>
                    <Row label="Server Name" value={server.server_name} />
                    <Row label="IP Address" value={server.ip_address} />
                    <Row label="DNS Name" value={server.dns_name} />
                    <Row label="Application Name" value={server.application_name} />
                    <Row label="Location" value={server.location} />
                    <Row label="Environment" value={server.system_environment} />
                    <Row label="Status" value={server.status} />
                    <Row label="Power State" value={server.power_state} />
                </div>

                {/* SYSTEM */}
                <div className="space-y-4 mt-6">
                    <h3 className="font-semibold">System</h3>
                    <Row label="OS" value={server.os} />
                    <Row label="OS Version" value={server.os_version} />
                    <Row label="CPU" value={server.cpu} />
                    <Row label="Memory" value={server.memory} />
                    <Row label="Disk" value={server.disk} />
                </div>

                {/* OWNERSHIP */}
                <div className="space-y-4 mt-6">
                    <h3 className="font-semibold">Ownership</h3>
                    <Row label="Server Owner" value={server.pttep_server_owner} />
                    <Row label="Application Owner" value={server.pttep_application_owner} />
                    <Row label="Support Department" value={server.application_support_department} />
                    <Row label="Support Name" value={server.application_support_name} />
                    <Row label="Support Email" value={server.application_support_email} />
                </div>

                {/* OTHERS */}
                <div className="space-y-4 mt-6">
                    <h3 className="font-semibold">Other</h3>
                    <Row label="Critical Application" value={server.critical_app} />
                    <Row label="Backup (Veritas)" value={server.veritas_backup} />
                    <Row label="Test DR" value={server.test_dr} />
                    <Row label="Remark" value={server.remark} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
