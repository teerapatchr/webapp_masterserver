const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function defaultHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (API_BASE.includes("ngrok")) {
        headers["ngrok-skip-browser-warning"] = "true";
    }

    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    return headers;
}

export type CreateUserPayload = {
    username: string;
    password: string;
    role: "admin" | "viewer";
};

export async function createUser(payload: CreateUserPayload) {
    const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: defaultHeaders(),
        body: JSON.stringify(payload),
    });

    if (res.status === 401 || res.status === 403) {
        throw new Error("You do not have permission to create users");
    }

    let data: unknown = null;
    try {
        data = await res.json();
    } catch {
        // ignore non-json body
    }

    if (!res.ok) {
        const message =
            typeof data === "object" &&
                data !== null &&
                "error" in data &&
                typeof (data as { error?: unknown }).error === "string"
                ? (data as { error: string }).error
                : "Create user failed";

        throw new Error(message);
    }

    return data;
}