import { create } from "zustand";
import { chatApi } from "@/services/chat.service";
import type { ChatMessage } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;

  load: () => Promise<void>;
  send: (content: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  sending: false,
  error: null,

  load: async () => {
    set({ loading: true });
    try {
      const messages = await chatApi.history();
      set({ messages, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  send: async (content) => {
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      userId: "me",
      role: "USER",
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    set({ sending: true, messages: [...get().messages, optimistic] });
    try {
      const { userMessage, assistantMessage } = await chatApi.send(content);
      const replaced = get().messages.map((m) => (m.id === optimistic.id ? userMessage : m));
      set({ messages: [...replaced, assistantMessage], sending: false });
    } catch (err) {
      set({
        sending: false,
        error: (err as Error).message,
        messages: get().messages.filter((m) => m.id !== optimistic.id),
      });
    }
  },

  clear: async () => {
    await chatApi.clear();
    set({ messages: [] });
  },
}));
