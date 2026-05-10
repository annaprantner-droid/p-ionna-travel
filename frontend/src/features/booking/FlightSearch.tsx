import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftRight } from "lucide-react";
import { useBookingStore } from "@/store/booking.store";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { cn } from "@/utils/cn";

const schema = z.object({
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
  departDate: z.string().min(1, "Depart date is required"),
  returnDate: z.string().optional(),
  cabin: z.enum(["Economy", "Premium Economy", "Business", "First"]).default("Economy"),
  passengers: z.coerce.number().int().positive().default(1),
});

type Values = z.infer<typeof schema>;
type Mode = "RETURN" | "ONE_WAY" | "MULTI_CITY";

export function FlightSearch() {
  const { searchFlights, searching } = useBookingStore();
  const [mode, setMode] = useState<Mode>("RETURN");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: "Singapore",
      to: "London",
      departDate: "2025-06-15",
      returnDate: "2025-07-05",
      cabin: "Economy",
      passengers: 1,
    },
  });

  const swap = () => {
    const f = watch("from");
    const t = watch("to");
    setValue("from", t);
    setValue("to", f);
  };

  const onSubmit = async (values: Values) => {
    await searchFlights({
      from: values.from,
      to: values.to,
      date: values.departDate,
      cabin: values.cabin,
      passengers: values.passengers,
    });
  };

  return (
    <div className="bg-navy-800 px-5 pb-5 pt-2 text-white">
      <div className="flex items-center gap-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
        {(["RETURN", "ONE_WAY", "MULTI_CITY"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn("py-1 transition", mode === m ? "text-white" : "text-white/60")}
          >
            {m.replace("_", "-")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <div className="relative grid grid-cols-2 gap-3">
          <Field label="From" {...register("from")} error={errors.from?.message} />
          <Field label="To" {...register("to")} error={errors.to?.message} />
          <button
            type="button"
            onClick={swap}
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ocean-500 p-2 text-white shadow"
            aria-label="Swap"
          >
            <ArrowLeftRight size={14} />
          </button>
        </div>
        <div className={cn("grid gap-3", mode === "RETURN" ? "grid-cols-2" : "grid-cols-1")}>
          <Field type="date" label="Depart" {...register("departDate")} error={errors.departDate?.message} />
          {mode === "RETURN" && (
            <Field type="date" label="Return" {...register("returnDate")} error={errors.returnDate?.message} />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-white/80">
          <select
            {...register("passengers")}
            className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white focus:outline-none"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n} className="text-slate-800">
                {n} Traveller{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <select
            {...register("cabin")}
            className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white focus:outline-none"
          >
            {["Economy", "Premium Economy", "Business", "First"].map((c) => (
              <option key={c} className="text-slate-800">
                {c}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="ocean" fullWidth size="lg" loading={searching}>
          Search
        </Button>
      </form>
    </div>
  );
}

const Field = ({
  label,
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) => (
  <label className="block">
    <input
      className="h-11 w-full rounded-xl border border-transparent bg-white px-3 text-sm text-slate-800 focus:border-ocean-400 focus:outline-none"
      placeholder={label}
      {...rest}
    />
    {error && <span className="mt-1 block text-[11px] text-rose-300">{error}</span>}
  </label>
);
