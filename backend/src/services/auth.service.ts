import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";

interface SignupInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function publicUser<T extends { id: string; email: string; name: string; avatarUrl: string | null; createdAt: Date }>(u: T) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  };
}

export const authService = {
  async signup(input: SignupInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new HttpError(409, "Email already in use");
    }
    const password = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: { email: input.email, password, name: input.name },
    });
    const token = signToken({ userId: user.id, email: user.email });
    return { token, user: publicUser(user) };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }
    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) {
      throw new HttpError(401, "Invalid email or password");
    }
    const token = signToken({ userId: user.id, email: user.email });
    return { token, user: publicUser(user) };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, "User not found");
    return publicUser(user);
  },
};
