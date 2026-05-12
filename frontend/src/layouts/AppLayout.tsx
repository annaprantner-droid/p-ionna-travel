import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { StatusBar } from "./StatusBar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 sm:py-6">
      <div className="app-shell">
        <StatusBar />
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
