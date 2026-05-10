import { Router } from "express";
import { tripController } from "../controllers/trip.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { tripSchema, tripUpdateSchema } from "./schemas";

const router = Router();
router.use(requireAuth);

router.get("/", tripController.list);
router.get("/:id", tripController.get);
router.post("/", validate(tripSchema), tripController.create);
router.patch("/:id", validate(tripUpdateSchema), tripController.update);
router.delete("/:id", tripController.remove);

export default router;
