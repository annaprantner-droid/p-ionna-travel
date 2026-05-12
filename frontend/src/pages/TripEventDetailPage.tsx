import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Car,
  Paperclip,
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
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";

/**
 * Full-screen detail view for a single timeline event (flight, hotel, dining,
 * or activity). One layout, four content adaptations.
 *
 * Routed at /trips/:tripId/event/:kind/:id where:
 *   kind = "booking"  →  trip.bookings.find(...)
 *   kind = "entry"    →  trip.walletEntries.find(...)
 *
 * Independent from the existing /bookings/:id boarding-pass screen, which
 * is still used by the swipe/chevron navigation on the trip timeline.
 */
export function TripEventDetailPage() {
  const { tripId = "", kind = "", id = "" } = useParams<{
    tripId: string;
    kind: string;
    id: string;
  }>();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  const refresh = () => {
    setLoading(true);
    tripApi
      .get(tripId)
      .then(setTrip)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const event = useMemo(() => {
    if (!trip) return null;
    if (kind === "booking") return trip.bookings.find((b) => b.id === id) ?? null;
    if (kind === "entry") return trip.walletEntries.find((e) => e.id === id) ?? null;
    return null;
  }, [trip, kind, id]);

  if (loading || !trip) {
    return (
      <div className="flex justify-center py-12 text-slate-400">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-full bg-slate-100 p-6 text-center">
        <Link
          to={`/trips/${tripId}`}
          className="inline-flex items-center gap-2 text-sm text-navy-700 underline"
        >
          <ArrowLeft size={14} /> Back to itinerary
        </Link>
        <p className="mt-4 text-sm text-slate-500">Event not found.</p>
      </div>
    );
  }

  const headerDate =
    kind === "booking"
      ? new Date((event as Booking).startDate)
      : new Date((event as WalletEntry).date);

  return (
    <div className="relative min-h-full bg-slate-100 pb-24">
      <Hero trip={trip} />

      {/* Carousel-feel: main card centred with peek of adjacent cards on each side */}
      <div className="relative overflow-x-hidden px-4 pt-4">
        {/* left peek — extends mostly off-screen so only the rounded edge shows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-4 bottom-0 w-[80%]
                     -translate-x-[calc(100%-12px)] rounded-3xl bg-white
                     shadow-[0_4px_18px_rgba(15,26,51,0.1)]"
        />
        {/* right peek */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-4 bottom-0 w-[80%]
                     translate-x-[calc(100%-12px)] rounded-3xl bg-white
                     shadow-[0_4px_18px_rgba(15,26,51,0.1)]"
        />

        <article className="relative z-10 overflow-hidden rounded-3xl bg-white shadow-[0_6px_28px_rgba(15,26,51,0.14)]">
          <header className="bg-navy-800 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-wider text-white">
            {formatDateHeader(headerDate)}
          </header>
          <div className="px-5 py-5">
            {kind === "booking" && (event as Booking).type === "FLIGHT" && (
              <FlightBody booking={event as Booking} />
            )}
            {kind === "booking" && (event as Booking).type === "HOTEL" && (
              <HotelBody booking={event as Booking} />
            )}
            {kind === "entry" && <EntryBody entry={event as WalletEntry} />}
          </div>
        </article>
      </div>

      {/* FABs sit inside the phone frame at the bottom-right of the content area */}
      <div className="absolute bottom-5 right-4 z-20 flex gap-3">
        <button
          aria-label="Attach"
          onClick={() => setEditorOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
        >
          <Paperclip size={18} />
        </button>
        <button
          aria-label="Edit"
          onClick={() => setEditorOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
        >
          <PenSquare size={18} />
        </button>
      </div>

      <ExpenseFormModal
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          refresh();
        }}
        defaultTripId={tripId}
      />
    </div>
  );
}

// ─── hero (shared with the timeline view, kept local to this file) ──────────

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
        to={`/trips/${trip.id}`}
        aria-label="Back to timeline"
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

// ─── shared card pieces ─────────────────────────────────────────────────────

function CardHeader({
  title,
  subtitle,
  Icon,
}: {
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-1">
      <div className="min-w-0 flex-1">
        <h2 className="text-[28px] font-extrabold leading-tight text-navy-900">{title}</h2>
        {subtitle && <p className="mt-1 text-base text-slate-400">{subtitle}</p>}
      </div>
      <span className="flex-shrink-0 text-navy-800">
        <Icon size={48} strokeWidth={1.7} />
      </span>
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px bg-slate-100" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
      {children}
    </div>
  );
}

function Value({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mt-1 text-xl font-bold text-navy-900 ${className}`}>{children}</div>;
}

function ReservationBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 space-y-4 rounded-2xl bg-slate-100 px-5 py-4 shadow-[0_2px_8px_rgba(15,26,51,0.06)]">
      {children}
    </div>
  );
}

function DetailsRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-4">
      <Label>DETAILS</Label>
      <div className="text-[15px] leading-relaxed text-navy-900">{children}</div>
    </div>
  );
}

// ─── body per event type ────────────────────────────────────────────────────

function FlightBody({ booking }: { booking: Booking }) {
  const dep = new Date(booking.departureTime ?? booking.startDate);
  const arr = new Date(booking.arrivalTime ?? booking.endDate ?? booking.startDate);
  const meta = parseMetadata(booking.metadata);
  const title =
    booking.fromCity && booking.toCity
      ? `${booking.fromCity} to ${booking.toCity}`
      : booking.title;
  const subtitle = [booking.airline, booking.flightNumber].filter(Boolean).join(" ");

  return (
    <>
      <CardHeader title={title} subtitle={subtitle} Icon={Plane} />
      <Divider />

      <SegmentRow
        label="DEPARTS"
        time={formatTime12(dep)}
        code={shortCode(booking.fromCity)}
        terminal={meta.terminalFrom ?? "—"}
      />
      <Divider />
      <SegmentRow
        label="ARRIVES"
        time={formatTime12(arr)}
        code={shortCode(booking.toCity)}
        terminal={meta.terminalTo ?? "—"}
      />

      <ReservationBox>
        <div>
          <Label>RESERVATION NR.</Label>
          <div className="mt-1 text-lg font-bold tracking-wide text-navy-900">{booking.reference}</div>
        </div>
        {meta.ticketNumber && (
          <div>
            <Label>TICKET NR.</Label>
            <div className="mt-1 text-lg font-bold tracking-wide text-navy-900">{meta.ticketNumber}</div>
          </div>
        )}
      </ReservationBox>
    </>
  );
}

function SegmentRow({
  label,
  time,
  code,
  terminal,
}: {
  label: string;
  time: string;
  code: string;
  terminal: string;
}) {
  return (
    <div className="grid grid-cols-3 items-start gap-x-4">
      <div>
        <Label>{label}</Label>
        <Value>{time}</Value>
      </div>
      <div className="pt-[2px]">
        <div className="text-xl font-bold text-navy-900">{code}</div>
      </div>
      <div>
        <Label>TERMINAL</Label>
        <Value>{terminal}</Value>
      </div>
    </div>
  );
}

function HotelBody({ booking }: { booking: Booking }) {
  const checkIn = new Date(booking.startDate);
  const checkOut = booking.endDate ? new Date(booking.endDate) : checkIn;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000),
  );
  const meta = parseMetadata(booking.metadata);
  const subtitle = shortAddress(booking.hotelAddress) ?? booking.toCity ?? "";

  const addressLines = (booking.hotelAddress ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <CardHeader
        title={booking.hotelName ?? booking.title}
        subtitle={subtitle}
        Icon={BedDouble}
      />
      <Divider />

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Label>CHECK-IN</Label>
          <Value>{formatMonthDay(checkIn)}</Value>
        </div>
        <div>
          <Label>TIME</Label>
          <div className="mt-1 text-lg font-bold text-navy-900">
            {meta.checkInTime ?? "—"}
          </div>
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Label>CHECK-OUT</Label>
          <Value>{formatMonthDay(checkOut)}</Value>
        </div>
        <div>
          <Label>TIME</Label>
          <div className="mt-1 text-lg font-bold text-navy-900">
            {meta.checkOutTime ?? "—"}
          </div>
        </div>
      </div>
      <Divider />

      <DetailsRow>
        <div className="font-medium">{booking.hotelName ?? booking.title}</div>
        {addressLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        {meta.phone && <div className="mt-1">{meta.phone}</div>}
      </DetailsRow>

      <ReservationBox>
        <div>
          <Label>RESERVATION NR.</Label>
          <div className="mt-1 text-lg font-bold tracking-wide text-navy-900">{booking.reference}</div>
        </div>
        <div>
          <Label>ROOM</Label>
          <div className="mt-1 text-lg font-bold text-navy-900">
            {nights} {nights === 1 ? "Night" : "Nights"}
            {meta.roomType ? ` | ${meta.roomType}` : ""}
          </div>
        </div>
      </ReservationBox>
    </>
  );
}

function EntryBody({ entry }: { entry: WalletEntry }) {
  const date = new Date(entry.date);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  const { title, location } = splitEntryTitle(entry);
  const Icon = iconForCategory(entry.category);
  const meta = parseEntryMeta(entry.description);
  const isActivity = entry.category === "ACTIVITY";

  return (
    <>
      <CardHeader title={title} subtitle={location ?? ""} Icon={Icon} />
      <Divider />

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Label>TIME</Label>
          <Value>{hasTime ? formatTime12(date) : "—"}</Value>
        </div>
        <div>
          <Label>BOOKING</Label>
          <Value>{meta.pax ? `${meta.pax} pax` : "—"}</Value>
        </div>
      </div>

      {(meta.placeName || meta.address || meta.phone) && (
        <>
          <Divider />
          <DetailsRow>
            {meta.placeName && <div>{meta.placeName}</div>}
            {meta.address
              ?.split(",")
              .map((line, i) => <div key={i}>{line.trim()}</div>)}
            {meta.phone && <div className="mt-1 underline decoration-navy-900/30 underline-offset-4">{meta.phone}</div>}
          </DetailsRow>
        </>
      )}

      <ReservationBox>
        {isActivity && (
          <div>
            <Label>TYPE</Label>
            <div className="mt-1 text-lg font-bold tracking-wide text-navy-900">
              {meta.type ?? "—"}
            </div>
          </div>
        )}
        <div>
          <Label>RESERVATION NAME</Label>
          <div className="mt-1 text-lg font-bold tracking-wide text-navy-900">
            {meta.reservationName ?? "—"}
          </div>
        </div>
      </ReservationBox>
    </>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function parseMetadata(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

interface EntryMeta {
  placeName?: string;
  address?: string;
  phone?: string;
  pax?: number;
  reservationName?: string;
  type?: string;
}

function parseEntryMeta(raw: string | null): EntryMeta {
  if (!raw) return {};
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    return JSON.parse(trimmed) as EntryMeta;
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
  const parts = addr.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2].replace(/\s+\d.*$/, "");
    const tokens = cityPart.split(/\s+/);
    if (tokens.length >= 2) {
      return `${tokens.slice(0, -1).join(" ")}, ${tokens[tokens.length - 1]}`;
    }
    return cityPart;
  }
  return parts[0] ?? null;
}

function splitEntryTitle(entry: WalletEntry): { title: string; location: string | null } {
  const title = entry.title.trim();
  const parts = title.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    return { title: titleCase(parts[0]), location: parts.slice(1).join(" — ") };
  }
  return { title: titleCase(title), location: null };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
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

function formatDateHeader(d: Date) {
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

function formatTime12(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .toUpperCase();
}

function formatMonthDay(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
    .format(d)
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
