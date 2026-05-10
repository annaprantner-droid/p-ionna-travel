import { Plane } from "lucide-react";
import { useBookingStore } from "@/store/booking.store";
import { Button } from "@/components/ui/Button";
import type { MockFlight } from "@/types";
import { formatCurrency, formatDuration, formatTime } from "@/utils/format";

export function FlightResults() {
  const { flightResults, create, bookings } = useBookingStore();

  if (flightResults.length === 0) return null;

  const isBooked = (f: MockFlight) =>
    bookings.some((b) => b.reference && b.flightNumber === f.flightNumber);

  const onBook = async (f: MockFlight) => {
    await create({
      type: "FLIGHT",
      title: `${f.fromCode} → ${f.toCode}`,
      fromCity: f.fromCity,
      toCity: f.toCity,
      airline: f.airline,
      flightNumber: f.flightNumber,
      cabinClass: f.cabinClass,
      startDate: f.departureTime,
      endDate: f.arrivalTime,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      price: f.price,
      currency: f.currency,
      passengers: 1,
    });
    alert(`Booked ${f.airline} ${f.flightNumber}!`);
  };

  return (
    <div className="space-y-3 px-5 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {flightResults.length} flight{flightResults.length > 1 ? "s" : ""} found
      </h3>
      {flightResults.map((f) => (
        <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
            <Plane size={14} /> {f.airline} · {f.flightNumber}
          </div>
          <div className="mt-2 grid grid-cols-3 items-center gap-2">
            <div>
              <div className="text-lg font-semibold text-navy-800">{formatTime(f.departureTime)}</div>
              <div className="text-xs text-slate-500">{f.fromCode}</div>
            </div>
            <div className="text-center text-[10px] uppercase tracking-wider text-slate-400">
              <div>{formatDuration(f.durationMinutes)}</div>
              <div className="my-1 h-px bg-slate-200" />
              <div>{f.stops === 0 ? "Direct" : `${f.stops} stop`}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-navy-800">{formatTime(f.arrivalTime)}</div>
              <div className="text-xs text-slate-500">{f.toCode}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">{f.cabinClass}</span>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-navy-800">
                {formatCurrency(f.price, f.currency)}
              </span>
              <Button size="sm" variant="ocean" onClick={() => onBook(f)} disabled={isBooked(f)}>
                {isBooked(f) ? "Booked" : "Book"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
