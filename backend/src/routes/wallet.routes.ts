import { Router } from "express";
import { walletController } from "../controllers/wallet.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { walletEntrySchema, walletEntryUpdateSchema } from "./schemas";

const router = Router();
router.use(requireAuth);

router.get("/", walletController.list);
router.get("/summary", walletController.summary);
router.post("/", validate(walletEntrySchema), walletController.create);
router.patch("/:id", validate(walletEntryUpdateSchema), walletController.update);
router.delete("/:id", walletController.remove);

export default router;
