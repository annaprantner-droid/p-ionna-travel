import { useEffect, useRef } from "react";
import { Trash2 } from "@/components/ui/icons";
import { useChatStore } from "@/store/chat.store";
import { MessageBubble } from "@/features/chat/MessageBubble";
import { TypingIndicator } from "@/features/chat/TypingIndicator";
import { ChatInput } from "@/features/chat/ChatInput";

export function PIonnaPage() {
  const { messages, sending, load, clear } = useChatStore();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && <Welcome />}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {sending && <TypingIndicator />}
      </div>

      <div className="border-t border-slate-100 bg-white p-3">
        <ChatInput />
        {messages.length > 0 && (
          <button
            onClick={async () => {
              if (confirm("Clear chat history?")) await clear();
            }}
            className="mx-auto mt-2 flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-400 hover:text-rose-500"
          >
            <Trash2 size={12} /> Clear conversation
          </button>
        )}
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="mx-auto max-w-xs pt-8 text-center">
      <div className="mx-auto h-32 w-32 animate-floaty rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_60px_-10px_rgba(124,58,237,0.6)]" />
      <h2 className="mt-6 text-lg font-semibold text-navy-900">p-IONNA</h2>
      <p className="mt-2 text-sm text-slate-500">
        Hi, I'm your Personal Travel Assistant. I'll plan & book your itinerary, find flight deals, and more —
        just ask away.
      </p>
    </div>
  );
}
