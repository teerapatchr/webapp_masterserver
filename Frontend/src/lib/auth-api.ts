const API = process.env.NEXT_PUBLIC_API_BASE;

export async function login(username: string, password: string) {
    const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
    }

    return res.json();
}