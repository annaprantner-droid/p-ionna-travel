import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, PenSquare, PlaneTakeoff } from "lucide-react";
import { tripApi } from "@/services/trip.service";
import type { Booking, TripDetail } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";
import { formatTime } from "@/utils/format";

/**
 * Boarding-pass style trip detail (matches the iONNA reference).
 * Renders the primary flight booking attached to the trip. Falls back to a
 * lightweight placeholder when no flight booking exists yet.
 */
export function TripDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);

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

  if (loading || !trip) {
    return (
      <div className="flex justify-center py-12 text-slate-400">
        <Spinner />
      </div>
    );
  }

  const flight = trip.bookings.find((b) => b.type === "FLIGHT") ?? null;

  return (
    <div className="relative flex h-full min-h-[640px] bg-white">
      <Link
        to="/wallet"
        aria-label="Back to wallet"
        className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow"
      >
        <ArrowLeft size={18} />
      </Link>

      {flight ? <BoardingPass booking={flight} tripName={trip.name} /> : <NoFlightFallback />}

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
          aria-label="Edit trip"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
        >
          <PenSquare size={18} />
        </button>
      </div>

      <TripFormModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          refresh();
        }}
        trip={trip}
      />
      <ExpenseFormModal
        open={attachOpen}
        onClose={() => {
          setAttachOpen(false);
          refresh();
        }}
        defaultTripId={trip.id}
      />
    </div>
  );
}

function BoardingPass({ booking, tripName }: { booking: Booking; tripName: string }) {
  const date = new Date(booking.departureTime ?? booking.startDate);
  const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);

  const ticketNumber = readTicketNumber(booking.metadata);
  const route =
    booking.title?.includes("→") || booking.title?.includes("-")
      ? booking.title.replace("→", "-")
      : `${shortCode(booking.fromCity)} - ${shortCode(booking.toCity)}`;

  return (
    <>
      <aside className="flex w-28 flex-col items-center bg-navy-800 pt-8 text-white">
        <PlaneTakeoff size={40} strokeWidth={1.6} />
        <div className="mt-3 h-px w-12 bg-white/70" />
        <div className="mt-auto flex flex-col items-center pb-10 text-center leading-tight">
          <span className="text-xl font-bold tracking-wide">{dayLabel}</span>
          <span className="mt-1 text-sm font-light text-white/90">{weekday}</span>
        </div>
      </aside>

      <section
        className="flex-1 px-6 pb-24 pt-8"
        aria-label={`Boarding pass for ${tripName}`}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-800">{route}</h1>

        <div className="mt-10 space-y-8">
          <SegmentRow
            label="DEPARTURE"
            place={booking.fromCity ? `${airportFor(booking.fromCity)}, ${booking.fromCity}` : "—"}
            time={booking.departureTime ? formatTime(booking.departureTime) : formatTime(booking.startDate)}
          />
          <SegmentRow
            label="ARRIVAL"
            place={booking.toCity ? `${airportFor(booking.toCity)}, ${countryFor(booking.toCity)}` : "—"}
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
    </>
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

function NoFlightFallback() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-8 text-center text-slate-500">
      <PlaneTakeoff size={40} className="text-slate-300" />
      <p className="mt-3 text-sm">
        No flight booking is attached to this trip yet. Add one from the Booking tab to see your
        boarding pass here.
      </p>
    </section>
  );
}

function readTicketNumber(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { ticketNumber?: string };
    return parsed.ticketNumber ?? null;
  } catch {
    return null;
  }
}

function shortCode(city: string | null): string {
  if (!city) return "—";
  return city.slice(0, 3).toUpperCase();
}

// Very small lookup so the placeholder text matches the reference; falls back
// gracefully for any city not in the map.
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
