import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, PenSquare } from "lucide-react";
import { tripApi } from "@/services/trip.service";
import type { Booking, TripDetail, WalletEntry } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";

/**
 * Trip detail screen — calendar overview of the trip.
 *
 * Renders a hero image with the city name + date range, followed by one row
 * per day in the trip range. Each row shows up to two events for that day,
 * built from the trip's flight/hotel bookings and any wallet entries dated
 * on that day (activities, meals, etc.). The bottom-right FAB opens a
 * lightweight editor so the user can make manual changes.
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

  const itinerary = useMemo(() => (trip ? buildItinerary(trip) : []), [trip]);

  // Ordered swipe destinations: position 0 is the first FLIGHT in
  // chronological order, then EVERY hotel sorted by check-in date. Empty
  // slots (e.g. no flight on this trip) are filtered out so the sequence
  // stays contiguous.
  //   index 0 → flight
  //   index 1 → first hotel
  //   index 2 → second hotel
  //   ...
  const swipeDestinations = useMemo(() => {
    if (!trip) return [] as Booking[];
    const byDate = (a: Booking, b: Booking) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    const firstFlight = [...trip.bookings].filter((b) => b.type === "FLIGHT").sort(byDate)[0];
    const allHotels = [...trip.bookings].filter((b) => b.type === "HOTEL").sort(byDate);
    return [firstFlight, ...allHotels].filter((b): b is Booking => Boolean(b));
  }, [trip]);

  // Shared by the swipe-left gesture and the on-screen chevron button.
  // The counter lives in a module-level Map (see bottom of file) so it
  // survives the round-trip between the calendar and a booking detail
  // (back/forward navigation) but resets cleanly on a full page reload —
  // unlike sessionStorage, which retained stale values across debugging
  // sessions and caused the first click to skip past the flight.
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
    <div className="relative pb-24 touch-pan-y select-none" {...swipeHandlers}>
      <Hero trip={trip} />

      {itinerary.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">
          No bookings or activities for this trip yet. Tap the edit button to add the first one.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {itinerary.map((day) => (
            <DayRow key={day.key} day={day} />
          ))}
        </ul>
      )}

      {swipeDestinations.length > 0 && (
        <div className="mt-4 flex justify-center pb-6">
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
    <div className="relative h-56 w-full overflow-hidden bg-navy-800">
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
        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow"
      >
        <ArrowLeft size={18} />
      </Link>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-black/15 to-transparent px-5 pb-4 pt-12 text-white">
        <h1 className="text-2xl font-extrabold tracking-wide">{trip.name.toUpperCase()}</h1>
        <span className="pb-1 text-xs font-medium tracking-wider">{range}</span>
      </div>
    </div>
  );
}

function DayRow({ day }: { day: ItineraryDay }) {
  const [primary, secondary] = day.events;
  return (
    <li className="grid grid-cols-[68px_1fr_1fr] items-center gap-4 px-5 py-3">
      <DayChip date={day.date} />
      <EventCell event={primary} />
      <EventCell event={secondary} />
    </li>
  );
}

function DayChip({ date }: { date: Date }) {
  return (
    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white text-center shadow-[0_2px_8px_rgba(15,26,51,0.08)] ring-1 ring-slate-100">
      <span className="text-xl font-semibold leading-none text-navy-800">{date.getDate()}</span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {MONTHS[date.getMonth()]}
      </span>
    </div>
  );
}

function EventCell({ event }: { event?: ItineraryEvent }) {
  if (!event) return <span />;
  const content = (
    <>
      <div className="truncate text-sm font-semibold uppercase tracking-wide text-navy-800">
        {event.label}
      </div>
      <div className="truncate text-xs text-slate-400">{event.detail}</div>
    </>
  );
  if (event.bookingId) {
    return (
      <Link
        to={`/bookings/${event.bookingId}`}
        className="min-w-0 rounded-md transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ocean-400/40"
      >
        {content}
      </Link>
    );
  }
  return <div className="min-w-0">{content}</div>;
}

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Per-trip step counter for the swipe / chevron navigation cycle.
 *
 * Keyed by trip id. Persists across mounts of TripDetailPage (so the cycle
 * advances when the user navigates back from a booking detail) but resets
 * on a full page reload. Replaces an earlier sessionStorage-based counter
 * that retained stale values between sessions.
 */
const tripSwipeStep = new Map<string, number>();

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VERTICAL_TOLERANCE = 60;

/**
 * Local swipe-left hook. Fires `onSwipeLeft` when the user finishes a
 * predominantly-horizontal leftward gesture. Listens to BOTH:
 *   - touch events  (touchstart / touchend)        — mobile
 *   - mouse events  (mousedown / mousemove / mouseup) — desktop browsers
 *
 * For mouse, the `mousemove` and `mouseup` listeners are attached to `window`
 * the moment a drag starts, so the gesture still resolves correctly even if
 * the user releases the button outside the root container.
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
    // Only react to the primary (left) button.
    if (e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      resolveSwipe(ev.clientX, ev.clientY);
    };
    const handleMouseMove = (_ev: MouseEvent) => {
      // Listener attached for parity / future visual feedback. The actual
      // swipe is resolved on mouseup using start + end coordinates.
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

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface ItineraryEvent {
  label: string;
  detail: string;
  sortKey: number; // earlier-in-day = lower
  bookingId?: string;
}

interface ItineraryDay {
  key: string;
  date: Date;
  events: ItineraryEvent[];
}

function buildItinerary(trip: TripDetail): ItineraryDay[] {
  const days = new Map<string, ItineraryDay>();

  const ensureDay = (d: Date) => {
    const key = dayKey(d);
    if (!days.has(key)) {
      days.set(key, { key, date: stripTime(d), events: [] });
    }
    return days.get(key)!;
  };

  // Pre-fill every day in the trip's date range so empty days still render.
  const start = stripTime(new Date(trip.startDate));
  const end = stripTime(new Date(trip.endDate));
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    ensureDay(new Date(d));
  }

  for (const booking of trip.bookings) {
    addBookingEvents(booking, ensureDay);
  }

  for (const entry of trip.walletEntries) {
    addWalletEvent(entry, ensureDay);
  }

  return [...days.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((day) => ({
      ...day,
      events: day.events.sort((a, b) => a.sortKey - b.sortKey).slice(0, 2),
    }));
}

function addBookingEvents(booking: Booking, ensureDay: (d: Date) => ItineraryDay) {
  if (booking.type === "FLIGHT") {
    const day = ensureDay(new Date(booking.departureTime ?? booking.startDate));
    const route =
      booking.fromCity && booking.toCity
        ? `${shortCode(booking.fromCity)}-${shortCode(booking.toCity)}`
        : booking.title.replace("→", "-");
    day.events.push({
      label: "FLIGHT",
      detail: route,
      sortKey: timeOfDay(booking.departureTime ?? booking.startDate),
      bookingId: booking.id,
    });
    return;
  }

  if (booking.type === "HOTEL") {
    const checkIn = stripTime(new Date(booking.startDate));
    const checkOut = booking.endDate ? stripTime(new Date(booking.endDate)) : checkIn;
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const day = ensureDay(new Date(d));
      day.events.push({
        label: "HOTEL",
        detail: booking.hotelName ?? booking.title,
        sortKey: 100, // hotels sit after early-morning flights but before evening activities
        bookingId: booking.id,
      });
    }
  }
}

function addWalletEvent(entry: WalletEntry, ensureDay: (d: Date) => ItineraryDay) {
  const day = ensureDay(new Date(entry.date));
  const { label, detail } = splitWalletTitle(entry);
  day.events.push({
    label,
    detail,
    sortKey: 500 + timeOfDay(entry.date),
  });
}

function splitWalletTitle(entry: WalletEntry): { label: string; detail: string } {
  const title = entry.title.trim();
  const parts = title.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    return { label: parts[0].toUpperCase(), detail: parts.slice(1).join(" — ") };
  }
  return { label: entry.category, detail: title };
}

function dayKey(d: Date | string) {
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function timeOfDay(d: Date | string) {
  const date = d instanceof Date ? d : new Date(d);
  return date.getHours() * 60 + date.getMinutes();
}

function shortCode(city: string): string {
  return city.slice(0, 3).toUpperCase();
}

function formatHeroDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
    .format(d)
    .toUpperCase();
}

function formatHeroDateWithYear(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
    .format(d)
    .toUpperCase();
}
