import { cn } from "@/utils/cn";

interface LogoProps {
  size?: number;
  /** Kept for API compatibility with call sites; the PNG already has the
   *  wordmark embedded so this is a no-op. */
  variant?: "white" | "compact";
  className?: string;
  /** Kept for API compatibility; the PNG is a complete logo. */
  withWordmark?: boolean;
}

/**
 * Brand logo. Renders the supplied iONNA Travel PNG from /public.
 * The `size` prop controls the rendered width (height auto-scales,
 * matching the 1:1 source so layouts are preserved).
 */
export function Logo({ size = 96, className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="iONNA Travel"
      width={size}
      height={size}
      className={cn("inline-block object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
