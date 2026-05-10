import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "file:./test.db";

import { createApp } from "../src/app";
import { prisma } from "../src/utils/prisma";

const app = createApp();

beforeAll(async () => {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: "test+" } } });
  await prisma.$disconnect();
});

describe("auth", () => {
  const email = `test+${Date.now()}@ionna.travel`;
  const password = "Password123!";

  it("rejects login for unknown user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nope@nowhere.test", password: "whatever" });
    expect(res.status).toBe(401);
  });

  it("validates signup payload", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not-an-email", password: "x", name: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/validation/i);
  });

  it("signs up, logs in, and returns the current user", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ email, password, name: "Test User" });
    expect(signup.status).toBe(201);
    expect(signup.body.token).toBeTypeOf("string");
    expect(signup.body.user.email).toBe(email);

    const login = await request(app).post("/api/auth/login").send({ email, password });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });
});
