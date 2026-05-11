import { useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useWalletStore } from "@/store/wallet.store";
import { TripList } from "@/features/wallet/TripList";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export function WalletPage() {
  const { trips, loading, load } = useWalletStore();
  const [tripModalOpen, setTripModalOpen] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="relative pb-24">
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
            action={<Button onClick={() => setTripModalOpen(true)}>Create your first trip</Button>}
          />
        ) : (
          <TripList trips={trips} />
        ))}

      <button
        onClick={() => setTripModalOpen(true)}
        className="fixed bottom-24 right-5 z-20 flex h-12 items-center gap-2 rounded-full bg-navy-800 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-navy-700 sm:bottom-28"
      >
        <Plus size={16} /> Trip
      </button>

      <TripFormModal open={tripModalOpen} onClose={() => setTripModalOpen(false)} />
    </div>
  );
}
