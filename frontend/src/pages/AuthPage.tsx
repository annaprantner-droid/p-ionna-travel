import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/features/auth/LoginForm";
import { SignupForm } from "@/features/auth/SignupForm";
import { StatusBar } from "@/layouts/StatusBar";
import { cn } from "@/utils/cn";

type Mode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const navigate = useNavigate();

  const onSuccess = () => navigate("/wallet", { replace: true });

  return (
    <div className="min-h-screen bg-navy-900 sm:py-6">
      <div className="mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden bg-navy-900 sm:my-6 sm:h-[844px] sm:w-[390px] sm:max-w-none sm:rounded-3xl sm:shadow-soft">
        <StatusBar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex shrink-0 flex-col items-center pt-14 text-white">
            <Logo size={204} />
            <p className="mt-4 max-w-xs text-center text-sm text-white/70">
              Plan, book and manage trips with your personal AI travel assistant.
            </p>
          </div>

          <div className="mt-10 flex-1 rounded-t-3xl bg-white p-6">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-lg py-2 transition",
                  mode === m ? "bg-white text-navy-800 shadow-sm" : "text-slate-500",
                )}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {mode === "login" ? <LoginForm onSuccess={onSuccess} /> : <SignupForm onSuccess={onSuccess} />}
          </div>
        </div>
      </div>
    </div>
  );
}
