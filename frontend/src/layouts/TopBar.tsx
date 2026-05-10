import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/store/auth.store";

export function TopBar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="topbar relative">
      <Logo size={42} withWordmark={false} />
      <div className="ml-3 flex flex-col leading-tight">
        <span className="text-base font-bold tracking-wide">iONNA</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          aria-label="Menu"
          className="rounded-lg p-1.5 transition hover:bg-white/10"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="absolute right-4 top-full z-30 mt-1 w-56 rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-soft">
          <div className="px-3 py-2 text-xs text-slate-500">Signed in as</div>
          <div className="px-3 pb-2 text-sm font-semibold">{user?.email}</div>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
