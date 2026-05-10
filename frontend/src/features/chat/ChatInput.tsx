import { ArrowUp, Mic, Plus } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/store/chat.store";

export function ChatInput({ placeholder = "Ask P-IONNA anything..." }: { placeholder?: string }) {
  const [value, setValue] = useState("");
  const { send, sending } = useChatStore();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v || sending) return;
    setValue("");
    await send(v);
  };

  return (
    <form
      onSubmit={submit}
      className="flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 shadow-sm focus-within:border-ocean-400"
    >
      <button type="button" className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-navy-700">
        <Plus size={18} />
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
      <button type="button" className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-navy-700">
        <Mic size={18} />
      </button>
      <button
        type="submit"
        disabled={!value.trim() || sending}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-navy-800 transition disabled:opacity-50 hover:bg-navy-800 hover:text-white"
        aria-label="Send"
      >
        <ArrowUp size={16} />
      </button>
    </form>
  );
}
