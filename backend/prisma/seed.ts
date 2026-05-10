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
          "https://images.unsplash.com/photo-1524293568345-75d62c3664f7?w=800&q=80",
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
          "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?w=800&q=80",
        notes: "Island hopping",
      },
    }),
  ]);

  const [singapore, perth, london] = trips;

  // --- Wallet entries ---
  await prisma.walletEntry.createMany({
    data: [
      {
        userId: ana.id,
        tripId: singapore.id,
        title: "Singapore Airlines flight",
        description: "Round-trip economy",
        amount: 980,
        currency: "USD",
        category: "FLIGHT",
        type: "EXPENSE",
        date: new Date("2025-01-10"),
      },
      {
        userId: ana.id,
        tripId: singapore.id,
        title: "Marina Bay Sands — 3 nights",
        amount: 720,
        currency: "USD",
        category: "HOTEL",
        type: "EXPENSE",
        date: new Date("2025-01-16"),
      },
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
    ],
  });

  // --- Bookings — including the SIN→PER wallet ticket ---
  await prisma.booking.createMany({
    data: [
      {
        userId: ana.id,
        tripId: singapore.id,
        type: "FLIGHT",
        status: "CONFIRMED",
        reference: "DN6XL9",
        title: "SIN → PER",
        fromCity: "Singapore",
        toCity: "Perth",
        startDate: new Date("2025-01-16T15:10:00.000Z"),
        endDate: new Date("2025-01-16T20:30:00.000Z"),
        departureTime: new Date("2025-01-16T15:10:00.000Z"),
        arrivalTime: new Date("2025-01-16T20:30:00.000Z"),
        flightNumber: "SQ290",
        airline: "Singapore Airlines",
        cabinClass: "Economy",
        price: 980,
        currency: "USD",
        passengers: 1,
        metadata: JSON.stringify({ ticketNumber: "629049-1299398" }),
      },
      {
        userId: ana.id,
        tripId: singapore.id,
        type: "HOTEL",
        status: "CONFIRMED",
        reference: "MBS-9921",
        title: "Marina Bay Sands",
        startDate: new Date("2025-01-16"),
        endDate: new Date("2025-01-19"),
        hotelName: "Marina Bay Sands",
        hotelAddress: "10 Bayfront Ave, Singapore",
        rating: 4.7,
        price: 720,
        currency: "USD",
        imageUrl:
          "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
      },
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
