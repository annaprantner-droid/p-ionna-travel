import { api } from "./api";
import type { Trip, TripDetail } from "@/types";

export interface TripInput {
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency?: string;
  imageUrl?: string | null;
  notes?: string | null;
}

export const tripApi = {
  list: () => api.get<Trip[]>("/trips").then((r) => r.data),
  get: (id: string) => api.get<TripDetail>(`/trips/${id}`).then((r) => r.data),
  create: (input: TripInput) => api.post<Trip>("/trips", input).then((r) => r.data),
  update: (id: string, input: Partial<TripInput>) =>
    api.patch<Trip>(`/trips/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/trips/${id}`).then((r) => r.data),
};
