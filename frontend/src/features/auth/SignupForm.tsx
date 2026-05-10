import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { extractErrorMessage } from "@/services/api";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Values = z.infer<typeof schema>;

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signup } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      await signup(values.email, values.password, values.name);
      onSuccess?.();
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input label="Name" leftIcon={<UserIcon size={16} />} error={errors.name?.message} {...register("name")} />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        leftIcon={<Lock size={16} />}
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && <p className="text-sm text-rose-500">{serverError}</p>}
      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        Create account
      </Button>
    </form>
  );
}
