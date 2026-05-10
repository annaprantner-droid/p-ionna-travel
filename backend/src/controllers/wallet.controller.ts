import { Response } from "express";
import { walletService } from "../services/wallet.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import type { AuthRequest } from "../types";

const requireUser = (req: AuthRequest) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  return req.user.userId;
};

export const walletController = {
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const tripId = typeof req.query.tripId === "string" ? req.query.tripId : undefined;
    res.json(await walletService.list(requireUser(req), tripId));
  }),

  summary: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await walletService.summary(requireUser(req)));
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.status(201).json(await walletService.create(requireUser(req), req.body));
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await walletService.update(requireUser(req), req.params.id, req.body));
  }),

  remove: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await walletService.remove(requireUser(req), req.params.id));
  }),
};
