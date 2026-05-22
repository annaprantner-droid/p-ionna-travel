import { Link, useLocation } from "react-router-dom";
import { Globe2, Plane, Ticket, User } from "@/components/ui/icons";
import { cn } from "@/utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Ticket;
  /** Predicate used to decide whether this tab is active for the current
   *  path. Wallet sub-screens (timeline, event detail, booking detail) all
   *  belong to the WALLET tab, so the predicate is broader than a single
   *  exact-match route. */
  isActive: (pathname: string) => boolean;
}

const items: NavItem[] = [
  {
    to: "/wallet",
    label: "WALLET",
    icon: Ticket,
    isActive: (p) =>
      p === "/wallet" ||
      p.startsWith("/wallet/") ||
      p === "/trips" ||
      p.startsWith("/trips/") ||
      p === "/bookings" ||
      p.startsWith("/bookings/"),
  },
  { to: "/p-ionna", label: "P-IONNA", icon: Globe2, isActive: (p) => p === "/p-ionna" || p.startsWith("/p-ionna/") },
  { to: "/booking", label: "BOOKING", icon: Plane, isActive: (p) => p === "/booking" || p.startsWith("/booking/") },
  { to: "/profile", label: "PROFILE", icon: User, isActive: (p) => p === "/profile" || p.startsWith("/profile/") },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={to}
            to={to}
            className={cn("flex flex-col items-center justify-center pt-1", active && "nav-item-active")}
          >
            <span className={cn("nav-icon", active && "nav-icon-active")}>
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span className={cn("font-semibold", active ? "text-navy-800" : "text-slate-400")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
