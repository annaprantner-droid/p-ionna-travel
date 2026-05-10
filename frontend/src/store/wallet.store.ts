import { create } from "zustand";
import { walletApi, WalletEntryInput } from "@/services/wallet.service";
import { tripApi, TripInput } from "@/services/trip.service";
import type { Trip, WalletEntry, WalletSummary } from "@/types";

interface WalletState {
  trips: Trip[];
  entries: WalletEntry[];
  summary: WalletSummary | null;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  createTrip: (input: TripInput) => Promise<void>;
  updateTrip: (id: string, input: Partial<TripInput>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  createEntry: (input: WalletEntryInput) => Promise<void>;
  updateEntry: (id: string, input: Partial<WalletEntryInput>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  trips: [],
  entries: [],
  summary: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const [trips, entries, summary] = await Promise.all([
        tripApi.list(),
        walletApi.list(),
        walletApi.summary(),
      ]);
      set({ trips, entries, summary, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  createTrip: async (input) => {
    const trip = await tripApi.create(input);
    set({ trips: [...get().trips, trip] });
  },

  updateTrip: async (id, input) => {
    const updated = await tripApi.update(id, input);
    set({ trips: get().trips.map((t) => (t.id === id ? updated : t)) });
  },

  deleteTrip: async (id) => {
    await tripApi.remove(id);
    set({
      trips: get().trips.filter((t) => t.id !== id),
      entries: get().entries.filter((e) => e.tripId !== id),
    });
  },

  createEntry: async (input) => {
    const entry = await walletApi.create(input);
    const summary = await walletApi.summary();
    set({ entries: [entry, ...get().entries], summary });
  },

  updateEntry: async (id, input) => {
    const updated = await walletApi.update(id, input);
    const summary = await walletApi.summary();
    set({
      entries: get().entries.map((e) => (e.id === id ? updated : e)),
      summary,
    });
  },

  deleteEntry: async (id) => {
    await walletApi.remove(id);
    const summary = await walletApi.summary();
    set({ entries: get().entries.filter((e) => e.id !== id), summary });
  },
}));
