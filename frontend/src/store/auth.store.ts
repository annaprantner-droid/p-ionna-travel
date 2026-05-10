import { create } from "zustand";
import { authApi } from "@/services/auth.service";
import { getStoredToken, setAuthToken } from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  status: "idle",
  error: null,

  hydrate: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ status: "ready" });
      return;
    }
    set({ status: "loading" });
    try {
      const user = await authApi.me();
      set({ user, token, status: "ready" });
    } catch {
      setAuthToken(null);
      set({ user: null, token: null, status: "ready" });
    }
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const { token, user } = await authApi.login({ email, password });
      setAuthToken(token);
      set({ token, user, status: "ready" });
    } catch (err) {
      set({ status: "error", error: (err as Error).message });
      throw err;
    }
  },

  signup: async (email, password, name) => {
    set({ status: "loading", error: null });
    try {
      const { token, user } = await authApi.signup({ email, password, name });
      setAuthToken(token);
      set({ token, user, status: "ready" });
    } catch (err) {
      set({ status: "error", error: (err as Error).message });
      throw err;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, status: "ready", error: null });
  },
}));
