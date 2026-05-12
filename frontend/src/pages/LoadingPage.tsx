import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { StatusBar } from "@/layouts/StatusBar";
import { useAuthStore } from "@/store/auth.store";

const MIN_DURATION = 1100;

export function LoadingPage() {
  const navigate = useNavigate();
  const { hydrate, token, user, status } = useAuthStore();

  useEffect(() => {
    const start = Date.now();
    hydrate().finally(() => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_DURATION - elapsed);
      setTimeout(() => {
        const authed = useAuthStore.getState().token && useAuthStore.getState().user;
        navigate(authed ? "/wallet" : "/auth", { replace: true });
      }, wait);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-route immediately if hydration finishes mid-transition
  useEffect(() => {
    if (status === "ready") {
      // handled in the timer above; this is just for completeness
      void token;
      void user;
    }
  }, [status, token, user]);

  return (
    <div className="flex min-h-screen flex-col bg-navy-900 text-white">
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="animate-floaty">
          <Logo size={220} />
        </div>
        <div className="mt-12 flex items-center gap-2 text-sm text-white/70">
          <span className="h-2 w-2 animate-bounce-dot rounded-full bg-white/80 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce-dot rounded-full bg-white/80 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce-dot rounded-full bg-white/80 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
