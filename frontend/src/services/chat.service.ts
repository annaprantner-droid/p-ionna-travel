import { api } from "./api";
import type { ChatMessage } from "@/types";

export const chatApi = {
  history: () => api.get<ChatMessage[]>("/chat").then((r) => r.data),
  send: (content: string) =>
    api
      .post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>("/chat", { content })
      .then((r) => r.data),
  clear: () => api.delete("/chat").then((r) => r.data),
};
