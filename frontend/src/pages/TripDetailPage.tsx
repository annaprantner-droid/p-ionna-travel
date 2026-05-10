import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plane, Plus, Trash2 } from "lucide-react";
import { tripApi } from "@/services/trip.service";
import type { TripDetail } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ExpenseList } from "@/features/wallet/ExpenseList";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { useWalletStore } from "@/store/wallet.store";
import { formatCurrency, formatDate } from "@/utils/format";

export function TripDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const { deleteEntry, deleteTrip } = useWalletStore();

  const refresh = async () => {
    setLoading(true);
    try {
      const detail = await tripApi.get(id);
      setTrip(detail);
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

  const totalSpent = trip.walletEntries
    .filter((e) => e.type === "EXPENSE")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="relative h-44 w-full bg-navy-800">
        {trip.imageUrl && (
          <img src={trip.imageUrl} alt={trip.name} className="h-full w-full object-cover opacity-80" />
        )}
        <Link
          to="/wallet"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="absolute bottom-3 left-5 right-5 text-white">
          <div className="text-2xl font-bold tracking-wide">{trip.name}</div>
          <div className="text-xs uppercase tracking-wider opacity-80">
            {trip.destination}, {trip.country} · {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <Stat label="Budget" value={formatCurrency(trip.budget, trip.currency)} />
        <Stat label="Spent" value={formatCurrency(totalSpent, trip.currency)} tone="rose" />
      </div>

      <SectionHeader title="Bookings" />
      {trip.bookings.length === 0 ? (
        <p className="px-5 pb-2 text-sm text-slate-500">No bookings yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {trip.bookings.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-5 py-3 text-sm">
              <Plane size={18} className="text-navy-700" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-navy-800">{b.title}</div>
                <div className="text-xs text-slate-500">
                  {b.airline ?? b.hotelName} · {formatDate(b.startDate)}
                </div>
              </div>
              <div className="text-sm font-semibold text-navy-800">
                {formatCurrency(b.price, b.currency)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <SectionHeader
        title="Expenses"
        right={
          <button
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ocean-600"
            onClick={() => setExpenseOpen(true)}
          >
            <Plus size={14} /> Add
          </button>
        }
      />
      <ExpenseList
        entries={trip.walletEntries}
        onEdit={() => setExpenseOpen(true)}
        onDelete={async (e) => {
          if (confirm(`Delete "${e.title}"?`)) {
            await deleteEntry(e.id);
            refresh();
          }
        }}
      />

      <div className="flex gap-2 px-5 py-6">
        <Button variant="secondary" fullWidth onClick={() => setTripOpen(true)}>
          <Pencil size={14} /> Edit trip
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={async () => {
            if (confirm(`Delete trip "${trip.name}"? This will unlink its expenses & bookings.`)) {
              await deleteTrip(trip.id);
              window.location.assign("/wallet");
            }
          }}
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      <ExpenseFormModal
        open={expenseOpen}
        onClose={() => {
          setExpenseOpen(false);
          refresh();
        }}
        defaultTripId={trip.id}
      />
      <TripFormModal
        open={tripOpen}
        onClose={() => {
          setTripOpen(false);
          refresh();
        }}
        trip={trip}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "rose" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone === "rose" ? "text-rose-600" : "text-navy-800"}`}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center justify-between border-b border-slate-100 px-5 pb-2 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {right}
    </div>
  );
}
