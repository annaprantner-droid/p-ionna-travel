import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { chatMessageSchema } from "./schemas";

const router = Router();
router.use(requireAuth);

router.get("/", chatController.history);
router.post("/", validate(chatMessageSchema), chatController.send);
router.delete("/", chatController.clear);

export default router;
