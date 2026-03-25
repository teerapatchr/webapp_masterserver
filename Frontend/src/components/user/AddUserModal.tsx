"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/user-api";

type Props = {
    open: boolean;
    onClose: () => void;
};

export function AddUserModal({ open, onClose }: Props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"admin" | "viewer">("viewer");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const formValid = useMemo(() => {
        return username.trim() !== "" && password.trim() !== "";
    }, [username, password]);

    function reset() {
        setUsername("");
        setPassword("");
        setConfirmPassword("")
        setRole("viewer");
        setSaving(false);
        setError("");
        setSuccess("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (saving) return;

        setError("");

        if (!formValid) {
            setError("Username and password are required");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (username.trim().length < 3) {
            setError("Username must be at least 3 characters");
            return;
        }

        if (username.includes(" ")) {
            setError("Username cannot contain spaces");
            return;
        }

        if (role === "admin") {
            const ok = window.confirm(
                "Are you sure you want to create an admin account? Admin users have full access."
            );
            if (!ok) return;
        }

        try {
            setSaving(true);

            await createUser({
                username: username.trim().toLowerCase(),
                password,
                role,
            });

            reset();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Create user failed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Username</label>
                        <input
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Confirm Password</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Role</label>
                        <select
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={role}
                            onChange={(e) => setRole(e.target.value as "admin" | "viewer")}
                        >
                            <option value="viewer">viewer</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={saving || !formValid}>
                            {saving ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}