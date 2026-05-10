import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "pionna.token";

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

const stored = getStoredToken();
if (stored) {
  api.defaults.headers.common.Authorization = `Bearer ${stored}`;
}

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ error?: string; details?: unknown }>) => {
    if (error.response?.status === 401) {
      // Soft-logout on token expiry — pages will react via the auth store.
      const cur = getStoredToken();
      if (cur) setAuthToken(null);
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unexpected error";
}
