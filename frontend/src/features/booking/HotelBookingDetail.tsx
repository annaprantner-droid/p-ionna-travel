import { Link } from "react-router-dom";
import { ArrowLeft, BedDouble, PenSquare } from "@/components/ui/icons";
import { useState } from "react";
import type { Booking } from "@/types";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";

/**
 * Hotel booking detail screen.
 * Layout mirrors the iONNA reference: navy left strip with bed icon and
 * vertical check-in / check-out dates, white right side with hotel name,
 * check-in/out times, hotel details (address + phone), booking summary, and
 * the reservation card.
 */
export function HotelBookingDetail({ booking }: { booking: Booking }) {
  const [editOpen, setEditOpen] = useState(false);

  const checkIn = new Date(booking.startDate);
  const checkOut = booking.endDate ? new Date(booking.endDate) : checkIn;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000)),
  );
  // The reference displays the last-stayed night, not the check-out date.
  const lastNight = new Date(checkOut);
  lastNight.setDate(lastNight.getDate() - 1);

  const meta = parseMetadata(booking.metadata);
  const hotelName = (booking.hotelName ?? booking.title).toUpperCase();
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

      <aside className="flex w-28 flex-col items-center bg-navy-800 px-2 pt-10 text-white">
        <BedDouble size={40} strokeWidth={1.6} />
        <div className="mt-10 flex flex-col items-center text-center leading-tight">
          <span className="text-lg font-bold tracking-wide">{formatDayMonth(checkIn)}</span>
          <span className="mt-1 text-xs font-light text-white/90">{formatWeekday(checkIn)}</span>
          <span className="my-4 text-white/60">—</span>
          <span className="text-lg font-bold tracking-wide">{formatDayMonth(lastNight)}</span>
          <span className="mt-1 text-xs font-light text-white/90">{formatWeekday(lastNight)}</span>
        </div>
      </aside>

      <section className="flex-1 px-6 pb-24 pt-10">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-navy-800">
          {hotelName}
        </h1>

        <div className="mt-8 space-y-3">
          <TimeRow label="CHECK-IN" time={meta.checkInTime ?? "—"} />
          <TimeRow label="CHECK-OUT" time={meta.checkOutTime ?? "—"} />
        </div>

        <Section title="Hotel Details">
          <div className="text-sm leading-relaxed text-navy-900">
            <div className="font-medium">{booking.hotelName ?? booking.title}</div>
            {booking.hotelAddress?.split(",").map((line, i) => (
              <div key={i}>{line.trim()}</div>
            ))}
          </div>
          {meta.phone && <div className="mt-2 text-sm text-navy-900">{meta.phone}</div>}
        </Section>

        <Section title="Your Booking">
          <div className="text-sm text-navy-900">
            {nights} {nights === 1 ? "night" : "nights"}
            {meta.roomType ? `, ${meta.roomType}` : ""}
          </div>
        </Section>

        <div className="mt-8 rounded-2xl bg-slate-100 px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Reservation Nr.
          </div>
          <div className="mt-0.5 text-lg font-semibold tracking-wide text-navy-900">
            {booking.reference}
          </div>
        </div>
      </section>

      <button
        onClick={() => setEditOpen(true)}
        aria-label="Edit booking"
        className="absolute bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
      >
        <PenSquare size={18} />
      </button>

      <ExpenseFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        defaultTripId={booking.tripId ?? undefined}
      />
    </div>
  );
}

function TimeRow({ label, time }: { label: string; time: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-lg font-bold tracking-wide text-navy-800">{label}</span>
      <span className="text-lg font-semibold text-navy-800">{time}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-base font-medium uppercase tracking-wider text-slate-400">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

interface HotelMetadata {
  phone?: string;
  roomType?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

function parseMetadata(raw: string | null): HotelMetadata {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as HotelMetadata;
  } catch {
    return {};
  }
}

function formatDayMonth(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
}

function formatWeekday(d: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
}
