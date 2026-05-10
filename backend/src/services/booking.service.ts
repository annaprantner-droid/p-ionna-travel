import { prisma } from "../utils/prisma";
import { HttpError } from "../utils/httpError";

export interface BookingInput {
  tripId?: string | null;
  type: "FLIGHT" | "HOTEL";
  status?: "CONFIRMED" | "CANCELLED" | "PENDING";
  reference?: string;
  title: string;
  fromCity?: string | null;
  toCity?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  price: number;
  currency?: string;
  flightNumber?: string | null;
  airline?: string | null;
  departureTime?: string | Date | null;
  arrivalTime?: string | Date | null;
  cabinClass?: string | null;
  hotelName?: string | null;
  hotelAddress?: string | null;
  rating?: number | null;
  imageUrl?: string | null;
  passengers?: number;
  metadata?: Record<string, unknown> | null;
}

async function ensureOwned(userId: string, id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.userId !== userId) {
    throw new HttpError(404, "Booking not found");
  }
  return booking;
}

function generateReference() {
  return Array.from({ length: 6 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)],
  ).join("");
}

function toDate(d?: string | Date | null) {
  if (d === undefined) return undefined;
  if (d === null) return null;
  return new Date(d);
}

export const bookingService = {
  list(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
    });
  },

  get(userId: string, id: string) {
    return ensureOwned(userId, id);
  },

  create(userId: string, input: BookingInput) {
    return prisma.booking.create({
      data: {
        userId,
        tripId: input.tripId ?? null,
        type: input.type,
        status: input.status ?? "CONFIRMED",
        reference: input.reference ?? generateReference(),
        title: input.title,
        fromCity: input.fromCity ?? null,
        toCity: input.toCity ?? null,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        price: input.price,
        currency: input.currency ?? "USD",
        flightNumber: input.flightNumber ?? null,
        airline: input.airline ?? null,
        departureTime: input.departureTime ? new Date(input.departureTime) : null,
        arrivalTime: input.arrivalTime ? new Date(input.arrivalTime) : null,
        cabinClass: input.cabinClass ?? null,
        hotelName: input.hotelName ?? null,
        hotelAddress: input.hotelAddress ?? null,
        rating: input.rating ?? null,
        imageUrl: input.imageUrl ?? null,
        passengers: input.passengers ?? 1,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  },

  async update(userId: string, id: string, input: Partial<BookingInput>) {
    await ensureOwned(userId, id);
    return prisma.booking.update({
      where: { id },
      data: {
        ...input,
        startDate: toDate(input.startDate) ?? undefined,
        endDate: toDate(input.endDate),
        departureTime: toDate(input.departureTime),
        arrivalTime: toDate(input.arrivalTime),
        metadata:
          input.metadata === undefined
            ? undefined
            : input.metadata === null
              ? null
              : JSON.stringify(input.metadata),
      },
    });
  },

  async remove(userId: string, id: string) {
    await ensureOwned(userId, id);
    await prisma.booking.delete({ where: { id } });
    return { ok: true };
  },
};
