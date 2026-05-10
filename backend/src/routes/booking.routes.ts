import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { bookingSchema, bookingUpdateSchema, flightSearchSchema, hotelSearchSchema } from "./schemas";

const router = Router();
router.use(requireAuth);

router.get("/search/flights", validate(flightSearchSchema, "query"), bookingController.searchFlights);
router.get("/search/hotels", validate(hotelSearchSchema, "query"), bookingController.searchHotels);

router.get("/", bookingController.list);
router.get("/:id", bookingController.get);
router.post("/", validate(bookingSchema), bookingController.create);
router.patch("/:id", validate(bookingUpdateSchema), bookingController.update);
router.delete("/:id", bookingController.remove);

export default router;
