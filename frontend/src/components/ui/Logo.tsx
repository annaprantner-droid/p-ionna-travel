import { cn } from "@/utils/cn";

interface LogoProps {
  size?: number;
  variant?: "white" | "compact";
  className?: string;
  withWordmark?: boolean;
}

/**
 * The "iONNA" globe logo, rebuilt as scalable SVG so it lives crisply in the
 * loading screen, top bar, and auth screen at any size.
 */
export function Logo({ size = 96, variant = "white", className, withWordmark = true }: LogoProps) {
  const stroke = variant === "white" ? "#ffffff" : "#0f1a33";
  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <defs>
          <clipPath id="globe-clip">
            <circle cx="100" cy="100" r="78" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="78" fill="#37a3ff" />
        <g clipPath="url(#globe-clip)">
          <path
            d="M-10 70 Q 50 40 110 90 T 240 90"
            fill="none"
            stroke="#149e7a"
            strokeWidth="42"
            strokeLinecap="round"
          />
          <path
            d="M-10 150 Q 70 120 140 160 T 240 140"
            fill="none"
            stroke="#149e7a"
            strokeWidth="36"
            strokeLinecap="round"
          />
        </g>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontWeight={800}
          fontSize="86"
          fill={stroke}
          letterSpacing="-2"
        >
          i
        </text>
        <circle cx="118" cy="100" r="22" stroke={stroke} strokeWidth="8" fill="none" />
      </svg>
      {withWordmark && (
        <div className="mt-3 text-center">
          <div className={cn("text-2xl font-extrabold tracking-wide", variant === "white" ? "text-white" : "text-navy-900")}>
            iONNA
          </div>
          <div className={cn("text-[10px] tracking-[0.4em]", variant === "white" ? "text-white/80" : "text-navy-700/70")}>
            TRAVEL
          </div>
        </div>
      )}
    </div>
  );
}
