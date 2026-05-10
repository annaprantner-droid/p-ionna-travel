import { useChatStore } from "@/store/chat.store";
import type { ChatMessage } from "@/types";
import { cn } from "@/utils/cn";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "USER";
  const meta = parseMetadata(message.metadata);
  const send = useChatStore((s) => s.send);

  return (
    <div className={cn("flex w-full animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[82%] space-y-2">
        <div
          className={cn(
            "whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm bg-slate-100 text-navy-900"
              : "rounded-bl-sm bg-navy-800 text-white",
          )}
        >
          {message.content}
        </div>

        {!isUser && meta?.suggestions?.length ? (
          <div className="flex flex-wrap gap-2">
            {meta.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-navy-700 shadow-sm transition hover:bg-slate-50"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface ParsedMeta {
  suggestions?: string[];
  intent?: string;
}

function parseMetadata(raw: string | null): ParsedMeta | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedMeta;
  } catch {
    return null;
  }
}
