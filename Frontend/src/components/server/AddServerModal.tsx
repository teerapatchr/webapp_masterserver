"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createServer } from "@/lib/server-api";
import type { ServerDetail } from "@/lib/types";

export function AddServerModal({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (created: ServerDetail) => void;
}) {
    const [id, setId] = useState("");
    const [serverName, setServerName] = useState("");
    const [ip, setIp] = useState("");
    const [saving, setSaving] = useState(false);

    const reset = () => {
        setId("");
        setServerName("");
        setIp("");
    };

    const handleCreate = async () => {
        try {
            setSaving(true);
            const created = await createServer({
                id,
                server_name: serverName,
                ip_address: ip,
            } as any);

            onCreated(created);
            reset();
            onClose();
        } catch (e) {
            console.error(e);
            alert("Create failed (check console / backend error).");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Server</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium">ID</div>
                        <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. 11" />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Server Name</div>
                        <Input
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            placeholder="e.g. PTTEP-SRV-NEW-01"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">IP Address</div>
                        <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="e.g. 10.10.10.10" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => { reset(); onClose(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={saving || !id || !serverName || !ip}>
                            {saving ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
