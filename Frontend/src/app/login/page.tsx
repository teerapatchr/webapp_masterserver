"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        //Change Mock Username and Password here
        if (username === "admin" && password === "1234") {
            localStorage.setItem("isLoggedIn", "true");
            router.push("/dashboard");
            return;
        }

        setError("Invalid username or password");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-sm">
                <h1 className="text-2xl font-semibold mb-2">Login</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Sign in to access the Server Inventory Dashboard
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
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

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}