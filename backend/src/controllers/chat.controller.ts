import { Response } from "express";
import { chatService } from "../services/chat.service";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import type { AuthRequest } from "../types";

const requireUser = (req: AuthRequest) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  return req.user.userId;
};

export const chatController = {
  history: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await chatService.history(requireUser(req)));
  }),

  send: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { content } = req.body as { content: string };
    res.status(201).json(await chatService.send(requireUser(req), content));
  }),

  clear: asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await chatService.clear(requireUser(req)));
  }),
};
