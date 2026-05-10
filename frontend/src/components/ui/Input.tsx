import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightSlot, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-ocean-400 focus-within:ring-2 focus-within:ring-ocean-400/30",
            error && "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-300/40",
          )}
        >
          {leftIcon && <span className="text-slate-400">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none",
              className,
            )}
            {...rest}
          />
          {rightSlot}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
