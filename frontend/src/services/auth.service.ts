import { api } from "./api";
import type { AuthResponse, User } from "@/types";

export const authApi = {
  signup: (input: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>("/auth/signup", input).then((r) => r.data),

  login: (input: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", input).then((r) => r.data),

  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),
};
