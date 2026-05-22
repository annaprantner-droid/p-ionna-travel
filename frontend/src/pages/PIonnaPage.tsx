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
      <div className="relative mx-auto flex h-32 w-32 animate-floaty items-center justify-center">
        {/* Soft blue-purple ambient glow behind the face */}
        <div className="absolute h-36 w-36 rounded-full bg-gradient-to-br from-violet-500/50 via-fuchsia-400/40 to-sky-400/50 blur-2xl" />
        {/* Face image — the PNG's white background is blended away via multiply */}
        <img
          src="/p-ionna-face.png"
          alt="P-IONNA"
          className="relative h-32 w-32 rounded-full object-cover mix-blend-multiply"
        />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-navy-900">p-IONNA</h2>
      <p className="mt-2 text-sm text-slate-500">
        Hi, I'm your Personal Travel Assistant. I'll plan & book your itinerary, find flight deals, and more —
        just ask away.
      </p>
    </div>
  );
}
