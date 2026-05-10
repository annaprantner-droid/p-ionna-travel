/**
 * Mock flight & hotel inventory used by the Booking screen.
 * Pure functions over a static dataset — no external APIs.
 */

export interface MockFlight {
  id: string;
  airline: string;
  flightNumber: string;
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  departureTime: string; // ISO
  arrivalTime: string;   // ISO
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

const FLIGHTS: MockFlight[] = [
  {
    id: "fl_sq290",
    airline: "Singapore Airlines",
    flightNumber: "SQ290",
    fromCity: "Singapore",
    toCity: "Perth",
    fromCode: "SIN",
    toCode: "PER",
    departureTime: "2025-06-15T07:10:00.000Z",
    arrivalTime: "2025-06-15T12:30:00.000Z",
    durationMinutes: 320,
    stops: 0,
    cabinClass: "Economy",
    price: 980,
    currency: "USD",
  },
  {
    id: "fl_ba12",
    airline: "British Airways",
    flightNumber: "BA12",
    fromCity: "Singapore",
    toCity: "London",
    fromCode: "SIN",
    toCode: "LHR",
    departureTime: "2025-06-15T23:30:00.000Z",
    arrivalTime: "2025-06-16T06:00:00.000Z",
    durationMinutes: 810,
    stops: 0,
    cabinClass: "Economy",
    price: 1180,
    currency: "USD",
  },
  {
    id: "fl_ek432",
    airline: "Emirates",
    flightNumber: "EK432",
    fromCity: "Singapore",
    toCity: "London",
    fromCode: "SIN",
    toCode: "LHR",
    departureTime: "2025-06-15T14:50:00.000Z",
    arrivalTime: "2025-06-16T05:40:00.000Z",
    durationMinutes: 950,
    stops: 1,
    cabinClass: "Economy",
    price: 815,
    currency: "USD",
  },
  {
    id: "fl_qf81",
    airline: "Qantas",
    flightNumber: "QF81",
    fromCity: "Singapore",
    toCity: "Sydney",
    fromCode: "SIN",
    toCode: "SYD",
    departureTime: "2025-07-02T09:00:00.000Z",
    arrivalTime: "2025-07-02T20:10:00.000Z",
    durationMinutes: 490,
    stops: 0,
    cabinClass: "Economy",
    price: 740,
    currency: "USD",
  },
  {
    id: "fl_jl712",
    airline: "Japan Airlines",
    flightNumber: "JL712",
    fromCity: "Singapore",
    toCity: "Tokyo",
    fromCode: "SIN",
    toCode: "HND",
    departureTime: "2025-08-04T22:00:00.000Z",
    arrivalTime: "2025-08-05T06:30:00.000Z",
    durationMinutes: 410,
    stops: 0,
    cabinClass: "Economy",
    price: 690,
    currency: "USD",
  },
  {
    id: "fl_ph101",
    airline: "Philippine Airlines",
    flightNumber: "PR509",
    fromCity: "Singapore",
    toCity: "Cebu",
    fromCode: "SIN",
    toCode: "CEB",
    departureTime: "2025-08-03T09:15:00.000Z",
    arrivalTime: "2025-08-03T13:00:00.000Z",
    durationMinutes: 225,
    stops: 0,
    cabinClass: "Economy",
    price: 320,
    currency: "USD",
  },
];

const HOTELS: MockHotel[] = [
  {
    id: "ht_mbs",
    name: "Marina Bay Sands",
    city: "Singapore",
    address: "10 Bayfront Ave, Singapore",
    rating: 4.7,
    pricePerNight: 240,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    amenities: ["Pool", "Spa", "Wi-Fi", "Gym"],
  },
  {
    id: "ht_savoy",
    name: "The Savoy",
    city: "London",
    address: "Strand, London WC2R 0EZ, UK",
    rating: 4.8,
    pricePerNight: 540,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=800&q=80",
    amenities: ["Spa", "Restaurant", "Wi-Fi"],
  },
  {
    id: "ht_crown",
    name: "Crown Towers Perth",
    city: "Perth",
    address: "Great Eastern Hwy, Burswood WA 6100",
    rating: 4.6,
    pricePerNight: 310,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    amenities: ["Pool", "Casino", "Wi-Fi"],
  },
  {
    id: "ht_shang_cebu",
    name: "Shangri-La Mactan, Cebu",
    city: "Cebu",
    address: "Punta Engaño Rd, Lapu-Lapu, Philippines",
    rating: 4.7,
    pricePerNight: 280,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=800&q=80",
    amenities: ["Beach", "Pool", "Spa", "Wi-Fi"],
  },
];

export interface FlightSearchInput {
  from?: string;
  to?: string;
  date?: string;
  cabin?: string;
  passengers?: number;
}

function norm(s: string | undefined) {
  return (s ?? "").trim().toLowerCase();
}

export const flightSearchService = {
  searchFlights(input: FlightSearchInput): MockFlight[] {
    const from = norm(input.from);
    const to = norm(input.to);
    return FLIGHTS.filter((f) => {
      if (from && !(norm(f.fromCity).includes(from) || norm(f.fromCode) === from)) return false;
      if (to && !(norm(f.toCity).includes(to) || norm(f.toCode) === to)) return false;
      return true;
    }).sort((a, b) => a.price - b.price);
  },

  searchHotels(city?: string): MockHotel[] {
    const c = norm(city);
    return HOTELS.filter((h) => (c ? norm(h.city).includes(c) : true)).sort(
      (a, b) => a.pricePerNight - b.pricePerNight,
    );
  },
};
