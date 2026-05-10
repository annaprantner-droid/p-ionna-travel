import { prisma } from "../utils/prisma";
import { aiService, AiHistoryItem } from "./ai.service";

export const chatService = {
  history(userId: string, limit = 100) {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },

  async clear(userId: string) {
    await prisma.chatMessage.deleteMany({ where: { userId } });
    return { ok: true };
  },

  async send(userId: string, content: string) {
    const userMessage = await prisma.chatMessage.create({
      data: { userId, role: "USER", content },
    });

    const recent = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    const history: AiHistoryItem[] = recent
      .reverse()
      .map((m) => ({ role: m.role as "USER" | "ASSISTANT", content: m.content }));

    const ai = await aiService.respond(content, history);
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: "ASSISTANT",
        content: ai.content,
        metadata: ai.metadata ? JSON.stringify(ai.metadata) : null,
      },
    });

    return { userMessage, assistantMessage };
  },
};
