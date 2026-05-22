import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail } from "@/components/ui/icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { extractErrorMessage } from "@/services/api";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type Values = z.infer<typeof schema>;

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "ana@ionna.travel", password: "Password123!" },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      onSuccess?.();
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        autoComplete="current-password"
        leftIcon={<Lock size={16} />}
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && <p className="text-sm text-rose-500">{serverError}</p>}
      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        Sign in
      </Button>
      <p className="text-center text-xs text-slate-500">
        Demo: <code>ana@ionna.travel</code> / <code>Password123!</code>
      </p>
    </form>
  );
}
