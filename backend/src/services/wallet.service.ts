import { prisma } from "../utils/prisma";
import { HttpError } from "../utils/httpError";

export interface WalletEntryInput {
  tripId?: string | null;
  title: string;
  description?: string | null;
  amount: number;
  currency?: string;
  category: string;
  type: "EXPENSE" | "INCOME";
  date: string | Date;
}

async function ensureOwned(userId: string, id: string) {
  const entry = await prisma.walletEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== userId) {
    throw new HttpError(404, "Wallet entry not found");
  }
  return entry;
}

export const walletService = {
  list(userId: string, tripId?: string) {
    return prisma.walletEntry.findMany({
      where: { userId, ...(tripId ? { tripId } : {}) },
      orderBy: { date: "desc" },
    });
  },

  create(userId: string, input: WalletEntryInput) {
    return prisma.walletEntry.create({
      data: {
        userId,
        tripId: input.tripId ?? null,
        title: input.title,
        description: input.description ?? null,
        amount: input.amount,
        currency: input.currency ?? "USD",
        category: input.category,
        type: input.type,
        date: new Date(input.date),
      },
    });
  },

  async update(userId: string, id: string, input: Partial<WalletEntryInput>) {
    await ensureOwned(userId, id);
    return prisma.walletEntry.update({
      where: { id },
      data: {
        ...input,
        tripId: input.tripId === undefined ? undefined : input.tripId,
        date: input.date ? new Date(input.date) : undefined,
      },
    });
  },

  async remove(userId: string, id: string) {
    await ensureOwned(userId, id);
    await prisma.walletEntry.delete({ where: { id } });
    return { ok: true };
  },

  async summary(userId: string) {
    const entries = await prisma.walletEntry.findMany({ where: { userId } });
    const byCategory: Record<string, number> = {};
    let totalSpent = 0;
    let totalIncome = 0;
    for (const e of entries) {
      if (e.type === "EXPENSE") {
        totalSpent += e.amount;
        byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
      } else {
        totalIncome += e.amount;
      }
    }
    return { totalSpent, totalIncome, balance: totalIncome - totalSpent, byCategory };
  },
};
