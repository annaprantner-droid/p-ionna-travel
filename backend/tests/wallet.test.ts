import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "file:./test.db";

import { createApp } from "../src/app";
import { prisma } from "../src/utils/prisma";

const app = createApp();

let token = "";
const email = `test+wallet-${Date.now()}@ionna.travel`;

beforeAll(async () => {
  const signup = await request(app)
    .post("/api/auth/signup")
    .send({ email, password: "Password123!", name: "Wallet Tester" });
  token = signup.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

describe("wallet", () => {
  it("requires auth", async () => {
    const res = await request(app).get("/api/wallet");
    expect(res.status).toBe(401);
  });

  it("creates and lists wallet entries", async () => {
    const created = await request(app)
      .post("/api/wallet")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Lunch in Tokyo",
        amount: 24.5,
        category: "FOOD",
        type: "EXPENSE",
        date: new Date().toISOString(),
      });
    expect(created.status).toBe(201);

    const list = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThan(0);

    const summary = await request(app)
      .get("/api/wallet/summary")
      .set("Authorization", `Bearer ${token}`);
    expect(summary.status).toBe(200);
    expect(summary.body.totalSpent).toBeGreaterThan(0);
  });

  it("rejects invalid wallet entry payloads", async () => {
    const res = await request(app)
      .post("/api/wallet")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "", amount: -5, category: "INVALID", type: "EXPENSE", date: "now" });
    expect(res.status).toBe(400);
  });
});
