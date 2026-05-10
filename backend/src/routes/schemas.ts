import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const tripSchema = z.object({
  name: z.string().min(1).max(80),
  destination: z.string().min(1).max(120),
  country: z.string().min(1).max(60),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  budget: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  imageUrl: z.string().url().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const tripUpdateSchema = tripSchema.partial();

const walletCategory = z.enum([
  "FLIGHT",
  "HOTEL",
  "FOOD",
  "TRANSPORT",
  "ACTIVITY",
  "SHOPPING",
  "OTHER",
]);

export const walletEntrySchema = z.object({
  tripId: z.string().nullable().optional(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  category: walletCategory,
  type: z.enum(["EXPENSE", "INCOME"]),
  date: z.string().or(z.date()),
});

export const walletEntryUpdateSchema = walletEntrySchema.partial();

export const bookingSchema = z.object({
  tripId: z.string().nullable().optional(),
  type: z.enum(["FLIGHT", "HOTEL"]),
  status: z.enum(["CONFIRMED", "CANCELLED", "PENDING"]).optional(),
  reference: z.string().max(40).optional(),
  title: z.string().min(1).max(120),
  fromCity: z.string().nullable().optional(),
  toCity: z.string().nullable().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).optional(),
  flightNumber: z.string().nullable().optional(),
  airline: z.string().nullable().optional(),
  departureTime: z.string().or(z.date()).nullable().optional(),
  arrivalTime: z.string().or(z.date()).nullable().optional(),
  cabinClass: z.string().nullable().optional(),
  hotelName: z.string().nullable().optional(),
  hotelAddress: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  passengers: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const bookingUpdateSchema = bookingSchema.partial();

export const chatMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const flightSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  cabin: z.string().optional(),
  passengers: z.coerce.number().int().positive().optional(),
});

export const hotelSearchSchema = z.object({
  city: z.string().optional(),
});
