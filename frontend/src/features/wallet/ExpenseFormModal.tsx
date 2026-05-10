import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWalletStore } from "@/store/wallet.store";
import type { WalletEntry } from "@/types";

const CATEGORIES = [
  "FLIGHT",
  "HOTEL",
  "FOOD",
  "TRANSPORT",
  "ACTIVITY",
  "SHOPPING",
  "OTHER",
] as const;

const schema = z.object({
  tripId: z.string().optional().or(z.literal("")),
  title: z.string().min(1).max(120),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3),
  category: z.enum(CATEGORIES),
  type: z.enum(["EXPENSE", "INCOME"]),
  date: z.string().min(1),
  description: z.string().max(500).optional(),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTripId?: string;
  entry?: WalletEntry | null;
}

export function ExpenseFormModal({ open, onClose, entry, defaultTripId }: Props) {
  const { trips, createEntry, updateEntry } = useWalletStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "USD", category: "FOOD", type: "EXPENSE" },
  });

  useEffect(() => {
    if (open) {
      reset({
        tripId: entry?.tripId ?? defaultTripId ?? "",
        title: entry?.title ?? "",
        amount: entry?.amount ?? 0,
        currency: entry?.currency ?? "USD",
        category: (entry?.category as Values["category"]) ?? "FOOD",
        type: entry?.type ?? "EXPENSE",
        date: entry?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        description: entry?.description ?? "",
      });
    }
  }, [open, entry, defaultTripId, reset]);

  const onSubmit = async (values: Values) => {
    const payload = {
      ...values,
      tripId: values.tripId ? values.tripId : null,
      date: new Date(values.date).toISOString(),
    };
    if (entry) {
      await updateEntry(entry.id, payload);
    } else {
      await createEntry(payload);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={entry ? "Edit expense" : "New expense"}>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Title" {...register("title")} error={errors.title?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            step="0.01"
            label="Amount"
            {...register("amount")}
            error={errors.amount?.message}
          />
          <Input label="Currency" maxLength={3} {...register("currency")} error={errors.currency?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Category</label>
            <select
              {...register("category")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Type</label>
            <select
              {...register("type")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/30"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input type="date" label="Date" {...register("date")} error={errors.date?.message} />
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Trip</label>
            <select
              {...register("tripId")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/30"
            >
              <option value="">— No trip —</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input label="Description" {...register("description")} error={errors.description?.message} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {entry ? "Save changes" : "Add expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
