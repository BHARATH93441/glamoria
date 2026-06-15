import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Try cookie first, then Authorization header as fallback
  const token = req.cookies?.token || extractBearerToken(req);

  if (!token) {
    res.status(401).json({ error: "Unauthorized — please log in" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized — session expired, please log in again" });
  }
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.split(" ")[1];
  return null;
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden — admin access only" });
      return;
    }
    next();
  });
}
