import { Router } from "express";
import authRoutes from "./auth.routes";
import tripRoutes from "./trip.routes";
import walletRoutes from "./wallet.routes";
import bookingRoutes from "./booking.routes";
import chatRoutes from "./chat.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "p-ionna-api" }));

router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/wallet", walletRoutes);
router.use("/bookings", bookingRoutes);
router.use("/chat", chatRoutes);

export default router;
