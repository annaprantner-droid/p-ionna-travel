import { create } from "zustand";
import {
  bookingApi,
  BookingInput,
  FlightSearchParams,
} from "@/services/booking.service";
import type { Booking, MockFlight, MockHotel } from "@/types";

interface BookingState {
  bookings: Booking[];
  flightResults: MockFlight[];
  hotelResults: MockHotel[];
  searching: boolean;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  searchFlights: (params: FlightSearchParams) => Promise<void>;
  searchHotels: (city?: string) => Promise<void>;
  create: (input: BookingInput) => Promise<Booking>;
  update: (id: string, input: Partial<BookingInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  flightResults: [],
  hotelResults: [],
  searching: false,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true });
    try {
      const bookings = await bookingApi.list();
      set({ bookings, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  searchFlights: async (params) => {
    set({ searching: true });
    try {
      const flightResults = await bookingApi.searchFlights(params);
      set({ flightResults, searching: false });
    } catch (err) {
      set({ searching: false, error: (err as Error).message });
    }
  },

  searchHotels: async (city) => {
    set({ searching: true });
    try {
      const hotelResults = await bookingApi.searchHotels(city);
      set({ hotelResults, searching: false });
    } catch (err) {
      set({ searching: false, error: (err as Error).message });
    }
  },

  create: async (input) => {
    const booking = await bookingApi.create(input);
    set({ bookings: [...get().bookings, booking] });
    return booking;
  },

  update: async (id, input) => {
    const updated = await bookingApi.update(id, input);
    set({ bookings: get().bookings.map((b) => (b.id === id ? updated : b)) });
  },

  remove: async (id) => {
    await bookingApi.remove(id);
    set({ bookings: get().bookings.filter((b) => b.id !== id) });
  },
}));
