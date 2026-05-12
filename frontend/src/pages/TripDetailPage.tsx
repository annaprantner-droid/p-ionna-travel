import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Car,
  ChevronRight,
  PenSquare,
  Plane,
  ShoppingBag,
  Sparkles,
  Tickets,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { tripApi } from "@/services/trip.service";
import type { Booking, TripDetail, WalletEntry } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";

/**
 * Trip detail screen — vertical timeline view.
 *
 * Renders a hero image with the city name + date range, then a vertical
 * timeline grouped by day. Each event (flight, hotel check-in, activity)
 * shows an icon on the left tied to a continuous vertical line, with the
 * details in a white card to the right.
 *
 * The swipe-left gesture and chevron button (cycling through the first
 * flight + every hotel in chronological order) and the edit FAB are all
 * preserved from the previous implementation.
 */
export function TripDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState<"trip" | "expense" | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setTrip(await tripApi.get(id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const timeline = useMemo(() => (trip ? buildTimeline(trip) : []), [trip]);

  // Swipe destinations — first FLIGHT + every HOTEL chronologically.
  const swipeDestinations = useMemo(() => {
    if (!trip) return [] as Booking[];
    const byDate = (a: Booking, b: Booking) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    const firstFlight = [...trip.bookings].filter((b) => b.type === "FLIGHT").sort(byDate)[0];
    const allHotels = [...trip.bookings].filter((b) => b.type === "HOTEL").sort(byDate);
    return [firstFlight, ...allHotels].filter((b): b is Booking => Boolean(b));
  }, [trip]);

  const goToNextSwipeDestination = () => {
    if (!trip || swipeDestinations.length === 0) return;
    const current = tripSwipeStep.get(trip.id) ?? 0;
    const idx = current % swipeDestinations.length;
    tripSwipeStep.set(trip.id, (idx + 1) % swipeDestinations.length);
    navigate(`/bookings/${swipeDestinations[idx].id}`);
  };

  const swipeHandlers = useSwipeLeft(goToNextSwipeDestination);

  if (loading || !trip) {
    return (
      <div className="flex justify-center py-12 text-slate-400">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-full touch-pan-y select-none bg-slate-100 pb-24"
      {...swipeHandlers}
    >
      <Hero trip={trip} />

      {timeline.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">
          No bookings or activities for this trip yet. Tap the edit button to add the first one.
        </p>
      ) : (
        <Timeline groups={timeline} />
      )}

      {swipeDestinations.length > 0 && (
        <div className="flex justify-center pb-6 pt-2">
          <button
            type="button"
            onClick={goToNextSwipeDestination}
            aria-label="Show next booking"
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-slate-300 transition hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-ocean-400/30"
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        </div>
      )}

      <button
        onClick={() => setEditorOpen("expense")}
        aria-label="Edit itinerary"
        className="fixed bottom-24 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700 sm:bottom-28"
      >
        <PenSquare size={18} />
      </button>

      <TripFormModal
        open={editorOpen === "trip"}
        onClose={() => {
          setEditorOpen(null);
          refresh();
        }}
        trip={trip}
      />
      <ExpenseFormModal
        open={editorOpen === "expense"}
        onClose={() => {
          setEditorOpen(null);
          refresh();
        }}
        defaultTripId={trip.id}
      />
    </div>
  );
}

function Hero({ trip }: { trip: TripDetail }) {
  const range = `${formatHeroDate(trip.startDate)} - ${formatHeroDateWithYear(trip.endDate)}`;
  return (
    <div className="relative h-44 w-full overflow-hidden bg-navy-800">
      {trip.imageUrl && (
        <img
          src={trip.imageUrl}
          alt={trip.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <Link
        to="/wallet"
        aria-label="Back"
        className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow"
      >
        <ArrowLeft size={18} />
      </Link>
      <div className="absolute inset-x-0 bottom-0 flex items-baseline gap-3 bg-gradient-to-t from-black/55 via-black/15 to-transparent px-5 pb-4 pt-12 text-white">
        <h1 className="text-2xl font-extrabold tracking-wide">{trip.name.toUpperCase()}</h1>
        <span className="text-xs font-medium tracking-wider opacity-95">{range}</span>
      </div>
    </div>
  );
}

// ─── timeline rendering ─────────────────────────────────────────────────────

interface TimelineEvent {
  id: string;
  date: Date;
  icon: LucideIcon;
  linkTo?: string;
  sortKey: number;
  card: React.ReactNode;
}

interface DateGroup {
  dateKey: string;
  label: string;
  events: TimelineEvent[];
}

function Timeline({ groups }: { groups: DateGroup[] }) {
  return (
    <div className="relative py-6 pl-[72px] pr-4">
      {/* Continuous vertical line that connects every dot. Sits at the
          right edge of the icon column. */}
      <div className="pointer-events-none absolute bottom-6 left-[54px] top-10 w-[2px] bg-navy-800" />

      <div className="space-y-7">
        {groups.map((group) => (
          <section key={group.dateKey}>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-800">
              {group.label}
            </h2>
            <ul className="space-y-3">
              {group.events.map((event) => (
                <TimelineRow key={event.id} event={event} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  const Icon = event.icon;
  return (
    <li className="relative">
      {/* icon — sits inside the left margin */}
      <span className="pointer-events-none absolute -left-[58px] top-3 z-10 text-navy-800">
        <Icon size={26} strokeWidth={2} />
      </span>
      {/* connector dot on the line */}
      <span className="pointer-events-none absolute -left-[22px] top-6 z-10 h-2.5 w-2.5 rounded-full bg-navy-800 ring-4 ring-slate-100" />

      <Card linkTo={event.linkTo}>{event.card}</Card>
    </li>
  );
}

function Card({ children, linkTo }: { children: React.ReactNode; linkTo?: string }) {
  const cls =
    "block rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(15,26,51,0.06)] ring-1 ring-slate-100";
  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className={`${cls} transition hover:shadow-[0_4px_18px_rgba(15,26,51,0.1)]`}
      >
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

// ─── content builders ───────────────────────────────────────────────────────

function buildTimeline(trip: TripDetail): DateGroup[] {
  const events: TimelineEvent[] = [];

  for (const b of trip.bookings) {
    if (b.type === "FLIGHT") events.push(flightEvent(b, trip.id));
    else if (b.type === "HOTEL") events.push(hotelCheckInEvent(b, trip.id));
  }
  for (const e of trip.walletEntries) {
    events.push(walletEvent(e, trip.id));
  }

  const groupMap = new Map<string, DateGroup>();
  for (const ev of events) {
    const key = dayKey(ev.date);
    if (!groupMap.has(key)) {
      groupMap.set(key, { dateKey: key, label: formatDayHeader(ev.date), events: [] });
    }
    groupMap.get(key)!.events.push(ev);
  }
  const groups = [...groupMap.values()].sort(
    (a, b) =>
      new Date(a.events[0].date).getTime() - new Date(b.events[0].date).getTime(),
  );
  for (const g of groups) {
    g.events.sort((a, b) => a.sortKey - b.sortKey);
  }
  return groups;
}

function flightEvent(booking: Booking, tripId: string): TimelineEvent {
  const dep = new Date(booking.departureTime ?? booking.startDate);
  const arr = new Date(booking.arrivalTime ?? booking.endDate ?? booking.startDate);
  const meta = parseMetadata(booking.metadata);
  const title =
    booking.fromCity && booking.toCity
      ? `${booking.fromCity} to ${booking.toCity}`
      : booking.title;
  const subtitle = [booking.airline, booking.flightNumber].filter(Boolean).join(" ");

  return {
    id: `flight-${booking.id}`,
    date: dep,
    icon: Plane,
    linkTo: `/trips/${tripId}/event/booking/${booking.id}`,
    sortKey: timeOfDay(dep),
    card: (
      <div>
        <div className="text-lg font-extrabold leading-tight text-navy-900">{title}</div>
        {subtitle && <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>}
        <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-5 gap-y-3 border-t border-slate-100 pt-3 text-sm">
          <SegmentLabel label="DEPARTS" value={formatTime12(dep)} />
          <div className="self-end font-bold text-navy-900">{shortCode(booking.fromCity)}</div>
          <SegmentLabel label="TERMINAL" value={meta.terminalFrom ?? "—"} align="right" />

          <SegmentLabel label="ARRIVES" value={formatTime12(arr)} />
          <div className="self-end font-bold text-navy-900">{shortCode(booking.toCity)}</div>
          <SegmentLabel label="TERMINAL" value={meta.terminalTo ?? "—"} align="right" />
        </div>
      </div>
    ),
  };
}

function SegmentLabel({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="font-bold text-navy-900">{value}</div>
    </div>
  );
}

function hotelCheckInEvent(booking: Booking, tripId: string): TimelineEvent {
  const date = new Date(booking.startDate);
  const location = shortAddress(booking.hotelAddress) ?? booking.toCity ?? null;
  return {
    id: `hotel-${booking.id}`,
    date,
    icon: BedDouble,
    linkTo: `/trips/${tripId}/event/booking/${booking.id}`,
    sortKey: 1500 + timeOfDay(date),
    card: (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          HOTEL CHECK-IN
        </div>
        <div className="mt-0.5 text-lg font-extrabold leading-tight text-navy-900">
          {booking.hotelName ?? booking.title}
        </div>
        {location && <div className="mt-0.5 text-xs text-slate-400">{location}</div>}
      </div>
    ),
  };
}

function walletEvent(entry: WalletEntry, tripId: string): TimelineEvent {
  const date = new Date(entry.date);
  const Icon = iconForCategory(entry.category);
  const { label, detail } = splitTitle(entry);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

  return {
    id: `entry-${entry.id}`,
    date,
    icon: Icon,
    linkTo: `/trips/${tripId}/event/entry/${entry.id}`,
    sortKey: 600 + timeOfDay(date),
    card: (
      <div>
        {hasTime && <div className="text-xs text-slate-400">{formatTime12(date)}</div>}
        <div className={hasTime ? "mt-0.5" : ""}>
          <div className="text-lg font-extrabold leading-tight text-navy-900">{label}</div>
          {detail && <div className="mt-0.5 text-xs text-slate-400">{detail}</div>}
        </div>
      </div>
    ),
  };
}

function iconForCategory(category: string): LucideIcon {
  switch (category) {
    case "FOOD":
      return UtensilsCrossed;
    case "TRANSPORT":
      return Car;
    case "ACTIVITY":
      return Tickets;
    case "SHOPPING":
      return ShoppingBag;
    case "FLIGHT":
      return Plane;
    case "HOTEL":
      return BedDouble;
    default:
      return Sparkles;
  }
}

function splitTitle(entry: WalletEntry): { label: string; detail: string | null } {
  const title = entry.title.trim();
  const parts = title.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    return { label: titleCase(parts[0]), detail: parts.slice(1).join(" — ") };
  }
  return { label: titleCase(title), detail: entry.description ?? null };
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function parseMetadata(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function shortCode(city: string | null): string {
  if (!city) return "—";
  return city.slice(0, 3).toUpperCase();
}

function shortAddress(addr: string | null): string | null {
  if (!addr) return null;
  const parts = addr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  // "207 Adelaide Terrace, Perth WA 6000, Australia" → "Perth, WA"
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2].replace(/\s+\d.*$/, "");
    const tokens = cityPart.split(/\s+/);
    if (tokens.length >= 2) {
      const state = tokens[tokens.length - 1];
      const city = tokens.slice(0, -1).join(" ");
      return `${city}, ${state}`;
    }
    return cityPart;
  }
  return parts[0] ?? null;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayHeader(d: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d).toUpperCase();
  const date = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
  return `${weekday} | ${date}`;
}

function timeOfDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function formatTime12(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .replace(/\s/g, " ")
    .toUpperCase();
}

function formatHeroDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
    .format(d)
    .toUpperCase();
}

function formatHeroDateWithYear(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
}

// ─── swipe-left hook (preserved verbatim) ───────────────────────────────────

/**
 * Per-trip step counter for the swipe / chevron navigation cycle.
 *
 * Keyed by trip id. Persists across mounts of TripDetailPage (so the cycle
 * advances when the user navigates back from a booking detail) but resets
 * on a full page reload.
 */
const tripSwipeStep = new Map<string, number>();

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VERTICAL_TOLERANCE = 60;

/**
 * Local swipe-left hook. Fires `onSwipeLeft` when the user finishes a
 * predominantly-horizontal leftward gesture. Listens to BOTH touch events
 * (mobile) and mouse events (desktop browsers). For mouse, mousemove and
 * mouseup are attached to `window` so the gesture resolves even if the
 * cursor leaves the swipe surface.
 */
function useSwipeLeft(onSwipeLeft: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const resolveSwipe = (endX: number, endY: number) => {
    if (!startRef.current) return;
    const dx = endX - startRef.current.x;
    const dy = endY - startRef.current.y;
    startRef.current = null;
    if (dx < -SWIPE_DISTANCE_THRESHOLD && Math.abs(dy) < SWIPE_VERTICAL_TOLERANCE) {
      onSwipeLeft();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      resolveSwipe(ev.clientX, ev.clientY);
    };
    const handleMouseMove = (_ev: MouseEvent) => {
      // Reserved for future visual feedback; swipe is resolved on mouseup.
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    resolveSwipe(t.clientX, t.clientY);
  };

  const onTouchCancel = () => {
    startRef.current = null;
  };

  return { onMouseDown, onTouchStart, onTouchEnd, onTouchCancel };
}
