import { api } from "./api";
import type { Booking, MockFlight, MockHotel } from "@/types";

export interface BookingInput {
  tripId?: string | null;
  type: "FLIGHT" | "HOTEL";
  status?: "CONFIRMED" | "CANCELLED" | "PENDING";
  reference?: string;
  title: string;
  fromCity?: string | null;
  toCity?: string | null;
  startDate: string;
  endDate?: string | null;
  price: number;
  currency?: string;
  flightNumber?: string | null;
  airline?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
  cabinClass?: string | null;
  hotelName?: string | null;
  hotelAddress?: string | null;
  rating?: number | null;
  imageUrl?: string | null;
  passengers?: number;
}

export interface FlightSearchParams {
  from?: string;
  to?: string;
  date?: string;
  cabin?: string;
  passengers?: number;
}

export const bookingApi = {
  list: () => api.get<Booking[]>("/bookings").then((r) => r.data),
  get: (id: string) => api.get<Booking>(`/bookings/${id}`).then((r) => r.data),
  create: (input: BookingInput) => api.post<Booking>("/bookings", input).then((r) => r.data),
  update: (id: string, input: Partial<BookingInput>) =>
    api.patch<Booking>(`/bookings/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/bookings/${id}`).then((r) => r.data),
  searchFlights: (params: FlightSearchParams) =>
    api.get<MockFlight[]>("/bookings/search/flights", { params }).then((r) => r.data),
  searchHotels: (city?: string) =>
    api.get<MockHotel[]>("/bookings/search/hotels", { params: { city } }).then((r) => r.data),
};
