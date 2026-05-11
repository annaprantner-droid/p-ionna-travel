import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookingApi } from "@/services/booking.service";
import type { Booking } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { FlightBookingDetail } from "@/features/booking/FlightBookingDetail";
import { HotelBookingDetail } from "@/features/booking/HotelBookingDetail";

export function BookingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bookingApi
      .get(id)
      .then(setBooking)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-slate-400">
        <Spinner />
      </div>
    );
  }

  if (error || !booking) {
    return <p className="px-6 py-12 text-center text-sm text-rose-500">Booking not found.</p>;
  }

  return booking.type === "FLIGHT" ? (
    <FlightBookingDetail booking={booking} />
  ) : (
    <HotelBookingDetail booking={booking} />
  );
}
