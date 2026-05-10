import { NavLink } from "react-router-dom";
import { Globe2, Plane, Ticket, User } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { to: "/wallet", label: "WALLET", icon: Ticket },
  { to: "/p-ionna", label: "P-IONNA", icon: Globe2 },
  { to: "/booking", label: "BOOKING", icon: Plane },
  { to: "/profile", label: "PROFILE", icon: User },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn("flex flex-col items-center justify-center pt-1", isActive && "nav-item-active")
          }
        >
          {({ isActive }) => (
            <>
              <span className={cn("nav-icon", isActive && "nav-icon-active")}>
                <Icon size={18} strokeWidth={2.2} />
              </span>
              <span className={cn("font-semibold", isActive ? "text-navy-800" : "text-slate-400")}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
