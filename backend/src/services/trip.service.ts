import { prisma } from "../utils/prisma";
import { HttpError } from "../utils/httpError";

export interface TripInput {
  name: string;
  destination: string;
  country: string;
  startDate: string | Date;
  endDate: string | Date;
  budget?: number;
  currency?: string;
  imageUrl?: string | null;
  notes?: string | null;
}

async function ensureOwned(userId: string, id: string) {
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip || trip.userId !== userId) {
    throw new HttpError(404, "Trip not found");
  }
  return trip;
}

export const tripService = {
  list(userId: string) {
    return prisma.trip.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
    });
  },

  async get(userId: string, id: string) {
    return ensureOwned(userId, id);
  },

  async getDetail(userId: string, id: string) {
    const trip = await ensureOwned(userId, id);
    const [walletEntries, bookings] = await Promise.all([
      prisma.walletEntry.findMany({ where: { tripId: id }, orderBy: { date: "desc" } }),
      prisma.booking.findMany({ where: { tripId: id }, orderBy: { startDate: "asc" } }),
    ]);
    return { ...trip, walletEntries, bookings };
  },

  create(userId: string, input: TripInput) {
    return prisma.trip.create({
      data: {
        userId,
        name: input.name,
        destination: input.destination,
        country: input.country,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        budget: input.budget ?? 0,
        currency: input.currency ?? "USD",
        imageUrl: input.imageUrl ?? null,
        notes: input.notes ?? null,
      },
    });
  },

  async update(userId: string, id: string, input: Partial<TripInput>) {
    await ensureOwned(userId, id);
    return prisma.trip.update({
      where: { id },
      data: {
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
    });
  },

  async remove(userId: string, id: string) {
    await ensureOwned(userId, id);
    await prisma.trip.delete({ where: { id } });
    return { ok: true };
  },
};
