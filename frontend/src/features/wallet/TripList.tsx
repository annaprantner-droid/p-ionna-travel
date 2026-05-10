import { Link } from "react-router-dom";
import { Trip } from "@/types";
import { formatDateShort } from "@/utils/format";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=400&q=80";

export function TripList({ trips }: { trips: Trip[] }) {
  return (
    <ul className="divide-y divide-slate-200">
      {trips.map((trip) => (
        <li key={trip.id}>
          <Link
            to={`/trips/${trip.id}`}
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
          >
            <img
              src={trip.imageUrl ?? FALLBACK_IMAGE}
              alt={trip.name}
              className="h-16 w-20 flex-shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold uppercase tracking-wide text-navy-800">
                {trip.name}
              </div>
              <div className="truncate text-xs text-slate-500">
                {trip.destination}, {trip.country}
              </div>
            </div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {formatDateShort(trip.startDate)}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
