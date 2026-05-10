import { api } from "./api";
import type { WalletEntry, WalletSummary, WalletCategory, WalletType } from "@/types";

export interface WalletEntryInput {
  tripId?: string | null;
  title: string;
  description?: string | null;
  amount: number;
  currency?: string;
  category: WalletCategory;
  type: WalletType;
  date: string;
}

export const walletApi = {
  list: (tripId?: string) =>
    api.get<WalletEntry[]>("/wallet", { params: tripId ? { tripId } : undefined }).then((r) => r.data),
  summary: () => api.get<WalletSummary>("/wallet/summary").then((r) => r.data),
  create: (input: WalletEntryInput) => api.post<WalletEntry>("/wallet", input).then((r) => r.data),
  update: (id: string, input: Partial<WalletEntryInput>) =>
    api.patch<WalletEntry>(`/wallet/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/wallet/${id}`).then((r) => r.data),
};
