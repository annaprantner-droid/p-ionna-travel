import { useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useWalletStore } from "@/store/wallet.store";
import { TripList } from "@/features/wallet/TripList";
import { TripFormModal } from "@/features/wallet/TripFormModal";
import { ExpenseList } from "@/features/wallet/ExpenseList";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/utils/format";
import type { WalletEntry } from "@/types";

export function WalletPage() {
  const { trips, entries, summary, loading, load, deleteEntry } = useWalletStore();
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<WalletEntry | null>(null);
  const [tab, setTab] = useState<"trips" | "expenses">("trips");

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="relative pb-24">
      {summary && (
        <div className="bg-navy-800 px-5 pb-5 pt-1 text-white">
          <div className="grid grid-cols-3 gap-3 text-center">
            <SummaryCell label="Spent" value={formatCurrency(summary.totalSpent)} tone="rose" />
            <SummaryCell label="Income" value={formatCurrency(summary.totalIncome)} tone="emerald" />
            <SummaryCell label="Balance" value={formatCurrency(summary.balance)} tone="ocean" />
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b border-slate-200 bg-white px-2 text-sm font-medium">
        {(["trips", "expenses"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 capitalize transition ${
              tab === t ? "border-b-2 border-navy-800 text-navy-800" : "text-slate-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-slate-400">
          <Spinner />
        </div>
      )}

      {!loading && tab === "trips" && (
        trips.length === 0 ? (
          <EmptyState
            icon={<Wallet size={32} />}
            title="No trips yet"
            description="Plan your next adventure to start tracking flights, hotels and expenses."
            action={<Button onClick={() => setTripModalOpen(true)}>Create your first trip</Button>}
          />
        ) : (
          <TripList trips={trips} />
        )
      )}

      {!loading && tab === "expenses" && (
        <ExpenseList
          entries={entries}
          onEdit={(e) => {
            setEditingExpense(e);
            setExpenseModalOpen(true);
          }}
          onDelete={async (e) => {
            if (confirm(`Delete "${e.title}"?`)) await deleteEntry(e.id);
          }}
        />
      )}

      <FabBar
        onAddTrip={() => {
          setTripModalOpen(true);
        }}
        onAddExpense={() => {
          setEditingExpense(null);
          setExpenseModalOpen(true);
        }}
      />

      <TripFormModal open={tripModalOpen} onClose={() => setTripModalOpen(false)} />
      <ExpenseFormModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        entry={editingExpense}
      />
    </div>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: string; tone: "rose" | "emerald" | "ocean" }) {
  const toneClass: Record<string, string> = {
    rose: "text-rose-200",
    emerald: "text-emerald-200",
    ocean: "text-ocean-400",
  };
  return (
    <div className="rounded-xl bg-white/5 px-2 py-3">
      <div className="text-[10px] uppercase tracking-wider text-white/60">{label}</div>
      <div className={`mt-1 text-base font-semibold ${toneClass[tone]}`}>{value}</div>
    </div>
  );
}

function FabBar({ onAddTrip, onAddExpense }: { onAddTrip: () => void; onAddExpense: () => void }) {
  return (
    <div className="pointer-events-none fixed bottom-24 left-0 right-0 mx-auto flex w-full max-w-md justify-end gap-2 px-5 sm:bottom-28">
      <button
        onClick={onAddExpense}
        className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-navy-800 shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        <Plus size={16} /> Expense
      </button>
      <button
        onClick={onAddTrip}
        className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-navy-800 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-navy-700"
      >
        <Plus size={16} /> Trip
      </button>
    </div>
  );
}
