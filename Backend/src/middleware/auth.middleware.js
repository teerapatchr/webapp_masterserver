import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid authorization format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username, role }
        next();
    } catch (error) {
        const status = error.name === "TokenExpiredError" ? 401 : 403;
        return res.status(status).json({ error: "Invalid or expired token" });
    }
}

export function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
    }

    next();
}