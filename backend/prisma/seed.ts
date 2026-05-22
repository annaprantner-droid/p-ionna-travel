import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SAMPLE_PASSWORD = "Password123!";

async function main() {
  console.log("🌱 Seeding database...");

  // Wipe in dependency order (helpful when re-running locally)
  await prisma.chatMessage.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.walletEntry.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  const ana = await prisma.user.create({
    data: {
      email: "ana@ionna.travel",
      password: passwordHash,
      name: "Ana Traveler",
      avatarUrl: null,
    },
  });

  const demo = await prisma.user.create({
    data: {
      email: "demo@ionna.travel",
      password: passwordHash,
      name: "Demo User",
    },
  });

  // --- Trips for Ana --- mirroring the Travel Wallet reference screen ---
  const trips = await Promise.all([
    prisma.trip.create({
      data: {
        userId: ana.id,
        name: "Singapore",
        destination: "Singapore",
        country: "SG",
        startDate: new Date("2025-01-16"),
        endDate: new Date("2025-01-22"),
        budget: 2400,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
        notes: "Marina Bay + Sentosa weekend",
      },
    }),
    prisma.trip.create({
      data: {
        userId: ana.id,
        name: "Perth",
        destination: "Western Australia",
        country: "AUS",
        startDate: new Date("2025-04-13"),
        endDate: new Date("2025-04-21"),
        budget: 3200,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
        notes: "Road trip along the coast",
      },
    }),
    prisma.trip.create({
      data: {
        userId: ana.id,
        name: "London",
        destination: "London",
        country: "UK",
        startDate: new Date("2025-06-22"),
        endDate: new Date("2025-06-30"),
        budget: 4000,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
        notes: "Museums + theatre",
      },
    }),
    prisma.trip.create({
      data: {
        userId: ana.id,
        name: "Cebu",
        destination: "Central Visayas",
        country: "PH",
        startDate: new Date("2025-08-03"),
        endDate: new Date("2025-08-12"),
        budget: 2800,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800",
        notes: "Island hopping",
      },
    }),
  ]);

  const [singapore, perth, london, cebu] = trips;

  // --- Wallet entries ---
  // Wallet entries track day-to-day expenses on top of pre-booked flights and
  // hotels (which already capture their own price). Earlier we duplicated the
  // Marina Bay Sands cost and an imaginary "Singapore Airlines flight" here —
  // both were redundant with the actual bookings, so they've been removed.
  await prisma.walletEntry.createMany({
    data: [
      {
        userId: ana.id,
        tripId: singapore.id,
        title: "Hawker dinner — Lau Pa Sat",
        amount: 28,
        currency: "USD",
        category: "FOOD",
        type: "EXPENSE",
        date: new Date("2025-01-17"),
      },
      {
        userId: ana.id,
        tripId: perth.id,
        title: "Car rental — 7 days",
        amount: 410,
        currency: "USD",
        category: "TRANSPORT",
        type: "EXPENSE",
        date: new Date("2025-04-13"),
      },
      {
        userId: ana.id,
        tripId: london.id,
        title: "British Museum — donation",
        amount: 15,
        currency: "USD",
        category: "ACTIVITY",
        type: "EXPENSE",
        date: new Date("2025-06-23"),
      },
      {
        userId: ana.id,
        tripId: cebu.id,
        title: "Island hopping tour — Mactan",
        amount: 120,
        currency: "USD",
        category: "ACTIVITY",
        type: "EXPENSE",
        date: new Date("2025-08-05"),
      },
    ],
  });

  // --- Bookings ---
  // Travel logic per trip (Ana is based in Singapore):
  //   Singapore is a local staycation — no flights needed.
  //   Perth / London / Cebu each have an outbound flight on day 1 and a
  //   return flight on the last day. Hotel check-ins follow arrival and
  //   cover the full duration.
  await prisma.booking.createMany({
    data: [
      // ── Singapore staycation (Jan 16 – Jan 22) ────────────────────────────
      {
        userId: ana.id,
        tripId: singapore.id,
        type: "HOTEL",
        status: "CONFIRMED",
        reference: "MBS-9921",
        title: "Marina Bay Sands",
        startDate: new Date("2025-01-16"),
        endDate: new Date("2025-01-22"),
        hotelName: "Marina Bay Sands",
        hotelAddress: "10 Bayfront Ave, Singapore 018956",
        rating: 4.7,
        price: 1440,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
        metadata: JSON.stringify({
          phone: "+65 6688 8888",
          roomType: "Premium King",
          checkInTime: "15:00",
          checkOutTime: "11:00",
        }),
      },

      // ── Perth (Apr 13 – Apr 21) ───────────────────────────────────────────
      // Outbound SIN → PER on day 1
      {
        userId: ana.id,
        tripId: perth.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "DN6XL9",
        title: "SIN → PER",
        fromCity: "Singapore",
        toCity: "Perth",
        startDate: new Date("2025-04-13T07:10:00.000Z"),
        endDate: new Date("2025-04-13T12:30:00.000Z"),
        departureTime: new Date("2025-04-13T07:10:00.000Z"),
        arrivalTime: new Date("2025-04-13T12:30:00.000Z"),
        flightNumber: "SQ226",
        airline: "Singapore Airlines",
        cabinClass: "Economy",
        price: 920,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "629049-1299398" }),
      },
      // Hotel night 1–4 (Perth city)
      {
        userId: ana.id,
        tripId: perth.id,
        type: "HOTEL",
        status: "CONFIRMED",
        reference: "237894330023H",
        title: "Hotel Pan Pacific",
        startDate: new Date("2025-04-13"),
        endDate: new Date("2025-04-17"),
        hotelName: "Hotel Pan Pacific",
        hotelAddress: "207 Adelaide Terrace, Perth WA 6000, Australia",
        rating: 4.5,
        price: 980,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
        metadata: JSON.stringify({
          phone: "+61 8 9224 7777",
          roomType: "Classic Suite",
          checkInTime: "14:00",
          checkOutTime: "11:00",
        }),
      },
      // Hotel night 5–8 (Margaret River — second leg of road trip)
      {
        userId: ana.id,
        tripId: perth.id,
        type: "HOTEL",
        status: "CONFIRMED",
        reference: "HSYDN29-UW725",
        title: "Acacia Chalets",
        startDate: new Date("2025-04-17"),
        endDate: new Date("2025-04-21"),
        hotelName: "Acacia Chalets",
        hotelAddress: "113 Yates Rd, Margaret River, WA 6285, Australia",
        rating: 4.6,
        price: 800,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1518883429294-8a92e93b54e0?w=800&q=80",
        metadata: JSON.stringify({
          phone: "+61 8 9757 6266",
          roomType: "Deluxe Double",
          checkInTime: "14:00",
          checkOutTime: "11:00",
        }),
      },
      // Return PER → SIN on the last day
      {
        userId: ana.id,
        tripId: perth.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "PR4422",
        title: "PER → SIN",
        fromCity: "Perth",
        toCity: "Singapore",
        startDate: new Date("2025-04-21T09:30:00.000Z"),
        endDate: new Date("2025-04-21T14:30:00.000Z"),
        departureTime: new Date("2025-04-21T09:30:00.000Z"),
        arrivalTime: new Date("2025-04-21T14:30:00.000Z"),
        flightNumber: "SQ225",
        airline: "Singapore Airlines",
        cabinClass: "Economy",
        price: 920,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "629049-1299399" }),
      },

      // ── London (Jun 22 – Jun 30) ──────────────────────────────────────────
      // Outbound SIN → LHR — overnight flight arriving morning of day 2
      {
        userId: ana.id,
        tripId: london.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "BA-77231",
        title: "SIN → LHR",
        fromCity: "Singapore",
        toCity: "London",
        startDate: new Date("2025-06-22T23:30:00.000Z"),
        endDate: new Date("2025-06-23T06:00:00.000Z"),
        departureTime: new Date("2025-06-22T23:30:00.000Z"),
        arrivalTime: new Date("2025-06-23T06:00:00.000Z"),
        flightNumber: "BA12",
        airline: "British Airways",
        cabinClass: "Economy",
        price: 1180,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "125774-9982310" }),
      },
      // Hotel after arrival, through final morning before return
      {
        userId: ana.id,
        tripId: london.id,
        type: "HOTEL",
        status: "CONFIRMED",
        reference: "SAV-44218",
        title: "The Savoy",
        startDate: new Date("2025-06-23"),
        endDate: new Date("2025-06-30"),
        hotelName: "The Savoy",
        hotelAddress: "Strand, London WC2R 0EZ, United Kingdom",
        rating: 4.8,
        price: 2100,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=800&q=80",
        metadata: JSON.stringify({
          phone: "+44 20 7836 4343",
          roomType: "Superior Queen",
          checkInTime: "15:00",
          checkOutTime: "12:00",
        }),
      },
      // Return LHR → SIN on the last day
      {
        userId: ana.id,
        tripId: london.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "BA-77232",
        title: "LHR → SIN",
        fromCity: "London",
        toCity: "Singapore",
        startDate: new Date("2025-06-30T01:00:00.000Z"),
        endDate: new Date("2025-06-30T14:00:00.000Z"),
        departureTime: new Date("2025-06-30T01:00:00.000Z"),
        arrivalTime: new Date("2025-06-30T14:00:00.000Z"),
        flightNumber: "BA11",
        airline: "British Airways",
        cabinClass: "Economy",
        price: 1180,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "125774-9982311" }),
      },

      // ── Cebu (Aug 3 – Aug 12) ─────────────────────────────────────────────
      // Outbound SIN → CEB on day 1
      {
        userId: ana.id,
        tripId: cebu.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "PR509-OUT",
        title: "SIN → CEB",
        fromCity: "Singapore",
        toCity: "Cebu",
        startDate: new Date("2025-08-03T01:15:00.000Z"),
        endDate: new Date("2025-08-03T05:00:00.000Z"),
        departureTime: new Date("2025-08-03T01:15:00.000Z"),
        arrivalTime: new Date("2025-08-03T05:00:00.000Z"),
        flightNumber: "PR509",
        airline: "Philippine Airlines",
        cabinClass: "Economy",
        price: 320,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "778512-2204517" }),
      },
      // Hotel for the full stay
      {
        userId: ana.id,
        tripId: cebu.id,
        type: "HOTEL",
        status: "CONFIRMED",
        reference: "SLM-CEB-88210",
        title: "Shangri-La Mactan",
        startDate: new Date("2025-08-03"),
        endDate: new Date("2025-08-12"),
        hotelName: "Shangri-La Mactan, Cebu",
        hotelAddress: "Punta Engaño Rd, Lapu-Lapu City, Cebu 6015, Philippines",
        rating: 4.7,
        price: 2520,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800",
        metadata: JSON.stringify({
          phone: "+63 32 231 0288",
          roomType: "Premier Sea View",
          checkInTime: "15:00",
          checkOutTime: "12:00",
        }),
      },
      // Return CEB → SIN on the last day
      {
        userId: ana.id,
        tripId: cebu.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "PR502-RET",
        title: "CEB → SIN",
        fromCity: "Cebu",
        toCity: "Singapore",
        startDate: new Date("2025-08-12T06:00:00.000Z"),
        endDate: new Date("2025-08-12T09:30:00.000Z"),
        departureTime: new Date("2025-08-12T06:00:00.000Z"),
        arrivalTime: new Date("2025-08-12T09:30:00.000Z"),
        flightNumber: "PR502",
        airline: "Philippine Airlines",
        cabinClass: "Economy",
        price: 320,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "778512-2204518" }),
      },
    ],
  });

  // --- Chat history mirroring the P-IONNA reference screen ---
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: ana.id,
        role: "USER",
        content:
          "P-IONNA, give me a 3-day itinerary for Tokyo based on what you know about me.",
      },
      {
        userId: ana.id,
        role: "ASSISTANT",
        content: `Of course Ana, happy to help you to discover Tokyo just as you like it.

🏯 DAY 1 (Traditional & Classic Tokyo)
- Visit Sensō-ji Temple & explore Ueno Market
- Head to Tokyo Skytree for city views

⛩ DAY 2 (Modern Tokyo)
- Visit Meiji Shrine & see Shibuya Crossing
- Snack in Harajuku & stroll Omotesando

🛍 DAY 3 (Luxury Tokyo)
- Experience teamLab
- Lunch/shop in Ginza & walk Imperial Palace Gardens

Most of these attractions are free, but would you like me to book tickets for Tokyo Skytree and teamLab?`,
        metadata: JSON.stringify({
          suggestions: ["Yes, book for 10. & 12. Feb", "No, I want to explore more"],
        }),
      },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Login with: ana@ionna.travel  /  ${SAMPLE_PASSWORD}`);
  console.log(`   Or:         demo@ionna.travel /  ${SAMPLE_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
