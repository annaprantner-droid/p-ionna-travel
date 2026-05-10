import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWalletStore } from "@/store/wallet.store";
import type { Trip } from "@/types";

const schema = z.object({
  name: z.string().min(1).max(80),
  destination: z.string().min(1).max(120),
  country: z.string().min(1).max(60),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  budget: z.coerce.number().nonnegative().optional(),
  currency: z.string().length(3).default("USD"),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  notes: z.string().max(500).optional(),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  trip?: Trip | null;
}

const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

export function TripFormModal({ open, onClose, trip }: Props) {
  const { createTrip, updateTrip } = useWalletStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "USD",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: trip?.name ?? "",
        destination: trip?.destination ?? "",
        country: trip?.country ?? "",
        startDate: toDateInput(trip?.startDate),
        endDate: toDateInput(trip?.endDate),
        budget: trip?.budget ?? 0,
        currency: trip?.currency ?? "USD",
        imageUrl: trip?.imageUrl ?? "",
        notes: trip?.notes ?? "",
      });
    }
  }, [open, trip, reset]);

  const onSubmit = async (values: Values) => {
    const payload = {
      ...values,
      imageUrl: values.imageUrl?.trim() ? values.imageUrl : null,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    };
    if (trip) {
      await updateTrip(trip.id, payload);
    } else {
      await createTrip(payload);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={trip ? "Edit trip" : "New trip"}>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Trip name" {...register("name")} error={errors.name?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Destination" {...register("destination")} error={errors.destination?.message} />
          <Input label="Country" {...register("country")} error={errors.country?.message} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input type="date" label="Start" {...register("startDate")} error={errors.startDate?.message} />
          <Input type="date" label="End" {...register("endDate")} error={errors.endDate?.message} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            step="0.01"
            label="Budget"
            {...register("budget")}
            error={errors.budget?.message}
          />
          <Input label="Currency" maxLength={3} {...register("currency")} error={errors.currency?.message} />
        </div>
        <Input label="Image URL" {...register("imageUrl")} error={errors.imageUrl?.message} />
        <Input label="Notes" {...register("notes")} error={errors.notes?.message} />
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            {trip ? "Save changes" : "Create trip"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
