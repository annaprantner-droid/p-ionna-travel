import { Response } from "express";
import { tripService } from "../services/trip.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import type { AuthRequest } from "../types";

const requireUser = (req: AuthRequest) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  return req.user.userId;
};

export const tripController = {
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await tripService.list(requireUser(req)));
  }),

  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await tripService.getDetail(requireUser(req), req.params.id));
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.status(201).json(await tripService.create(requireUser(req), req.body));
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await tripService.update(requireUser(req), req.params.id, req.body));
  }),

  remove: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await tripService.remove(requireUser(req), req.params.id));
  }),
};
