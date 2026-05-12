import { useEffect, useState } from "react";
import { PenSquare, Wallet } from "@/components/ui/icons";
import { useWalletStore } from "@/store/wallet.store";
import { TripList } from "@/features/wallet/TripList";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Trip } from "@/types";

export function WalletPage() {
  const { trips, loading, load } = useWalletStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [tripBeingEdited, setTripBeingEdited] = useState<Trip | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  // "Edit Trip" opens the editor for the most recently-starting trip in the
  // user's wallet — the closest concept of a "currently selected" trip on the
  // overview screen.
  const editTrip = () => {
    setMenuOpen(false);
    if (trips.length === 0) {
      setTripBeingEdited(null);
      setTripModalOpen(true);
      return;
    }
    const latest = [...trips].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    )[0];
    setTripBeingEdited(latest);
    setTripModalOpen(true);
  };

  const addNewTrip = () => {
    setMenuOpen(false);
    setTripBeingEdited(null);
    setTripModalOpen(true);
  };

  return (
    <div className="relative min-h-full pb-24">
      {loading && (
        <div className="flex justify-center py-12 text-slate-400">
          <Spinner />
        </div>
      )}

      {!loading &&
        (trips.length === 0 ? (
          <EmptyState
            icon={<Wallet size={32} />}
            title="No trips yet"
            description="Plan your next adventure to start tracking flights and hotels."
            action={<Button onClick={addNewTrip}>Create your first trip</Button>}
          />
        ) : (
          <TripList trips={trips} />
        ))}

      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Edit menu"
        className="absolute bottom-5 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
      >
        <PenSquare size={18} />
      </button>

      {menuOpen && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="rounded-t-3xl bg-navy-800 px-5 pb-6 pt-5 text-white shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-white/60">
              Trip actions
            </div>
            <div className="space-y-2">
              <button
                onClick={editTrip}
                className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-100"
              >
                Edit Trip
              </button>
              <button
                onClick={addNewTrip}
                className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-navy-800 transition hover:bg-slate-100"
              >
                Add New
              </button>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="mt-3 w-full rounded-xl border border-white/30 bg-navy-700 py-3 text-sm font-semibold text-white transition hover:bg-navy-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <TripFormModal
        open={tripModalOpen}
        onClose={() => {
          setTripModalOpen(false);
          setTripBeingEdited(null);
        }}
        trip={tripBeingEdited}
      />
    </div>
  );
}
