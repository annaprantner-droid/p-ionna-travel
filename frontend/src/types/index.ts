export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type WalletCategory =
  | "FLIGHT"
  | "HOTEL"
  | "FOOD"
  | "TRANSPORT"
  | "ACTIVITY"
  | "SHOPPING"
  | "OTHER";

export type WalletType = "EXPENSE" | "INCOME";

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destination: string;
  country: string;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripDetail extends Trip {
  walletEntries: WalletEntry[];
  bookings: Booking[];
}

export interface WalletEntry {
  id: string;
  userId: string;
  tripId: string | null;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  category: WalletCategory;
  type: WalletType;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletSummary {
  totalSpent: number;
  totalIncome: number;
  balance: number;
  byCategory: Record<string, number>;
}

export type BookingType = "FLIGHT" | "HOTEL";
export type BookingStatus = "CONFIRMED" | "CANCELLED" | "PENDING";

export interface Booking {
  id: string;
  userId: string;
  tripId: string | null;
  type: BookingType;
  status: BookingStatus;
  reference: string;
  title: string;
  fromCity: string | null;
  toCity: string | null;
  startDate: string;
  endDate: string | null;
  price: number;
  currency: string;
  flightNumber: string | null;
  airline: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  cabinClass: string | null;
  hotelName: string | null;
  hotelAddress: string | null;
  rating: number | null;
  imageUrl: string | null;
  passengers: number;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockFlight {
  id: string;
  airline: string;
  flightNumber: string;
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  cabinClass: string;
  price: number;
  currency: string;
}

export interface MockHotel {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  pricePerNight: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
}

export type ChatRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  metadata: string | null;
  createdAt: string;
}
