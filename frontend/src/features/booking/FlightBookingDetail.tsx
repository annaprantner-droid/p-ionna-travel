import { Link } from "react-router-dom";
import { ArrowLeft, Paperclip, PenSquare, PlaneTakeoff } from "lucide-react";
import { useState } from "react";
import type { Booking } from "@/types";
import { formatTime } from "@/utils/format";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";

/**
 * Boarding-pass style detail screen for a FLIGHT booking.
 * Layout mirrors the iONNA reference: navy left strip with takeoff icon and
 * the vertical departure date, white right side with route, departure /
 * arrival rows, flight number, and reservation/ticket card.
 */
export function FlightBookingDetail({ booking }: { booking: Booking }) {
  const [attachOpen, setAttachOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const date = new Date(booking.departureTime ?? booking.startDate);
  const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);

  const ticketNumber = readMetadataField(booking.metadata, "ticketNumber");
  const route = formatRoute(booking);
  const backTo = booking.tripId ? `/trips/${booking.tripId}` : "/wallet";

  return (
    <div className="relative flex h-full min-h-[640px] bg-white">
      <Link
        to={backTo}
        aria-label="Back"
        className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow"
      >
        <ArrowLeft size={18} />
      </Link>

      <aside className="flex w-28 flex-col items-center bg-navy-800 pt-10 text-white">
        <PlaneTakeoff size={40} strokeWidth={1.6} />
        <div className="mt-3 h-px w-12 bg-white/70" />
        <div className="mt-auto flex flex-col items-center pb-10 text-center leading-tight">
          <span className="text-xl font-bold tracking-wide">{dayLabel}</span>
          <span className="mt-1 text-sm font-light text-white/90">{weekday}</span>
        </div>
      </aside>

      <section className="flex-1 px-6 pb-24 pt-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-800">{route}</h1>

        <div className="mt-10 space-y-8">
          <SegmentRow
            label="DEPARTURE"
            place={
              booking.fromCity ? `${airportFor(booking.fromCity)}, ${countryFor(booking.fromCity)}` : "—"
            }
            time={
              booking.departureTime ? formatTime(booking.departureTime) : formatTime(booking.startDate)
            }
          />
          <SegmentRow
            label="ARRIVAL"
            place={
              booking.toCity ? `${airportFor(booking.toCity)}, ${countryFor(booking.toCity)}` : "—"
            }
            time={
              booking.arrivalTime
                ? formatTime(booking.arrivalTime)
                : booking.endDate
                  ? formatTime(booking.endDate)
                  : "—"
            }
          />
        </div>

        <div className="mt-10 flex items-baseline justify-between border-t border-slate-100 pt-6">
          <span className="text-base font-semibold tracking-wide text-navy-800">FLIGHT NR.</span>
          <span className="text-base font-medium text-navy-800">{booking.flightNumber ?? "—"}</span>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Reservation Nr.
          </div>
          <div className="mt-0.5 text-lg font-semibold tracking-wide text-navy-900">
            {booking.reference}
          </div>

          <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Ticket Nr.
          </div>
          <div className="mt-0.5 text-lg font-semibold tracking-wide text-navy-900">
            {ticketNumber ?? "—"}
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute bottom-6 right-5 flex gap-3">
        <button
          onClick={() => setAttachOpen(true)}
          aria-label="Attach expense"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
        >
          <Paperclip size={18} />
        </button>
        <button
          onClick={() => setEditOpen(true)}
          aria-label="Edit booking"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
        >
          <PenSquare size={18} />
        </button>
      </div>

      <ExpenseFormModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        defaultTripId={booking.tripId ?? undefined}
      />
      <ExpenseFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        defaultTripId={booking.tripId ?? undefined}
      />
    </div>
  );
}

function SegmentRow({ label, place, time }: { label: string; place: string; time: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-lg font-bold tracking-wide text-navy-800">{label}</div>
        <div className="mt-0.5 text-xs text-slate-500">{place}</div>
      </div>
      <div className="whitespace-nowrap text-lg font-semibold text-navy-800">{time}</div>
    </div>
  );
}

function readMetadataField(metadata: string | null, key: string): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    const value = parsed[key];
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

function formatRoute(b: Booking): string {
  if (b.fromCity && b.toCity) return `${shortCode(b.fromCity)} - ${shortCode(b.toCity)}`;
  return b.title.replace("→", "-");
}

function shortCode(city: string): string {
  return city.slice(0, 3).toUpperCase();
}

// Small airport/country lookup so the static "Changi Airport, Singapore"
// style strings match the reference for common cities.
const AIRPORTS: Record<string, { airport: string; country: string }> = {
  Singapore: { airport: "Changi Airport", country: "Singapore" },
  Perth: { airport: "Perth Airport", country: "Australia" },
  London: { airport: "Heathrow Airport", country: "United Kingdom" },
  Tokyo: { airport: "Haneda Airport", country: "Japan" },
  Sydney: { airport: "Kingsford Smith Airport", country: "Australia" },
  Cebu: { airport: "Mactan-Cebu Airport", country: "Philippines" },
};

function airportFor(city: string): string {
  return AIRPORTS[city]?.airport ?? `${city} Airport`;
}

function countryFor(city: string): string {
  return AIRPORTS[city]?.country ?? city;
}
