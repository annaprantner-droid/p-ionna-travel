export function TypingIndicator() {
  return (
    <div className="flex animate-fade-in justify-start">
      <div className="rounded-2xl rounded-bl-sm bg-navy-800 px-4 py-3 text-white">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-white/80 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-white/80 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-white/80 [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}
