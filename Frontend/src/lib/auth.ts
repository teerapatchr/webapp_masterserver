export type AuthUser = {
    id: number;
    username: string;
    role: "admin" | "viewer";
};

export function getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function isAdmin(): boolean {
    const user = getCurrentUser();
    return user?.role === "admin";
}