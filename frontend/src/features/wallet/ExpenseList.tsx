import { Pencil, Trash2 } from "lucide-react";
import type { WalletEntry } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

interface Props {
  entries: WalletEntry[];
  onEdit: (entry: WalletEntry) => void;
  onDelete: (entry: WalletEntry) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  FLIGHT: "bg-sky-100 text-sky-700",
  HOTEL: "bg-purple-100 text-purple-700",
  FOOD: "bg-amber-100 text-amber-700",
  TRANSPORT: "bg-emerald-100 text-emerald-700",
  ACTIVITY: "bg-pink-100 text-pink-700",
  SHOPPING: "bg-indigo-100 text-indigo-700",
  OTHER: "bg-slate-100 text-slate-700",
};

export function ExpenseList({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return <div className="px-5 py-8 text-center text-sm text-slate-500">No expenses yet.</div>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {entries.map((e) => (
        <li key={e.id} className="flex items-center gap-3 px-5 py-3">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[e.category] ?? CATEGORY_COLORS.OTHER}`}
          >
            {e.category}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-navy-800">{e.title}</div>
            <div className="text-xs text-slate-500">{formatDate(e.date)}</div>
          </div>
          <div className={`text-sm font-semibold ${e.type === "EXPENSE" ? "text-rose-600" : "text-emerald-600"}`}>
            {e.type === "EXPENSE" ? "-" : "+"}
            {formatCurrency(e.amount, e.currency)}
          </div>
          <div className="flex items-center gap-1">
            <button
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-700"
              onClick={() => onEdit(e)}
              aria-label="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              onClick={() => onDelete(e)}
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
