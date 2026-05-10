import { Response } from "express";
import { bookingService } from "../services/booking.service";
import { flightSearchService } from "../services/flightSearch.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import type { AuthRequest } from "../types";

const requireUser = (req: AuthRequest) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  return req.user.userId;
};

export const bookingController = {
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await bookingService.list(requireUser(req)));
  }),

  get: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await bookingService.get(requireUser(req), req.params.id));
  }),

  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.status(201).json(await bookingService.create(requireUser(req), req.body));
  }),

  update: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await bookingService.update(requireUser(req), req.params.id, req.body));
  }),

  remove: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await bookingService.remove(requireUser(req), req.params.id));
  }),

  searchFlights: asyncHandler(async (req: AuthRequest, res: Response) => {
    requireUser(req);
    res.json(flightSearchService.searchFlights(req.query as Record<string, string>));
  }),

  searchHotels: asyncHandler(async (req: AuthRequest, res: Response) => {
    requireUser(req);
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    res.json(flightSearchService.searchHotels(city));
  }),
};
