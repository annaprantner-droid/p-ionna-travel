import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import type { AuthRequest } from "../types";
import { HttpError } from "../utils/httpError";

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(result);
  }),

  me: asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) throw new HttpError(401, "Unauthorized");
    const user = await authService.me(req.user.userId);
    res.json({ user });
  }),
};
