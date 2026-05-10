import { useEffect, useState } from "react";
import { FlightSearch } from "@/features/booking/FlightSearch";
import { FlightResults } from "@/features/booking/FlightResults";
import { BookingList } from "@/features/booking/BookingList";
import { useBookingStore } from "@/store/booking.store";
import { cn } from "@/utils/cn";

type Tab = "search" | "my";

export function BookingPage() {
  const [tab, setTab] = useState<Tab>("search");
  const { load } = useBookingStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="pb-20">
      <div className="flex gap-1 border-b border-slate-200 bg-white px-2 text-sm font-medium">
        {(
          [
            { id: "search" as const, label: "Search" },
            { id: "my" as const, label: "My bookings" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-3 transition",
              tab === t.id ? "border-b-2 border-navy-800 text-navy-800" : "text-slate-400",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "search" && (
        <>
          <FlightSearch />
          <FlightResults />
        </>
      )}
      {tab === "my" && <BookingList />}
    </div>
  );
}
