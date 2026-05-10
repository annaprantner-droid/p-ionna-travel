import { NextFunction, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";
import type { AuthRequest } from "../types";

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing or invalid Authorization header"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}
