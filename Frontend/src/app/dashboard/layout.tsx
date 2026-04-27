"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
    window.addEventListener("storage", cb);
    return () => window.removeEventListener("storage", cb);
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // Drives show/hide of children. Server snapshot is null so SSR and
    // initial client render both return null — no hydration mismatch.
    const token = useSyncExternalStore(
        subscribe,
        () => localStorage.getItem("token"),
        () => null
    );

    // Read the real localStorage value (not the reactive snapshot) so the
    // redirect only fires when there is genuinely no token, not on the
    // transient null that exists before the store syncs on first render.
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            router.replace("/login");
        }
    }, [router]);

    if (token === null) return null;
    return <>{children}</>;
}
