import { Hotel, Plane, Trash2 } from "@/components/ui/icons";
import { useBookingStore } from "@/store/booking.store";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";

export function BookingList() {
  const { bookings, remove } = useBookingStore();

  if (bookings.length === 0) {
    return (
      <p className="px-5 py-6 text-center text-sm text-slate-500">No bookings yet — use search to add one.</p>
    );
  }

  return (
    <ul className="space-y-3 px-5 py-4">
      {bookings.map((b) => (
        <li
          key={b.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy-700">
              {b.type === "FLIGHT" ? <Plane size={16} /> : <Hotel size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-navy-800">{b.title}</div>
              <div className="text-xs text-slate-500">
                {b.type === "FLIGHT"
                  ? `${b.airline ?? ""} ${b.flightNumber ?? ""} · ${formatDate(b.startDate)} ${b.departureTime ? "· " + formatTime(b.departureTime) : ""}`
                  : `${b.hotelName ?? ""} · ${formatDate(b.startDate)}${b.endDate ? " → " + formatDate(b.endDate) : ""}`}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-navy-800">
                {formatCurrency(b.price, b.currency)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600">{b.status}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
            <span>Ref · {b.reference}</span>
            <button
              onClick={async () => {
                if (confirm(`Cancel booking ${b.reference}?`)) await remove(b.id);
              }}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:text-rose-600"
            >
              <Trash2 size={12} /> Cancel
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
