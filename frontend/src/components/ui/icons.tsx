import type { ComponentType, SVGProps, ReactNode } from "react";

/**
 * Project-wide icon set. All icons are inline SVG, thin-stroke (1.5 px),
 * geometric, and rendered in `currentColor` so they inherit the parent
 * text colour (navy in most contexts).
 *
 * The exported component names mirror the lucide-react names previously
 * used, so existing call sites stay unchanged — only the import source
 * switches from `lucide-react` to `@/components/ui/icons`.
 *
 * Plane is the only intentionally-solid icon, matching the brief: a sleek
 * filled silhouette pointing diagonally up-right.
 */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

/** Drop-in replacement for lucide-react's `LucideIcon` type. */
export type LucideIcon = ComponentType<IconProps>;

function Stroke({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

// ─── Plane (solid diagonal silhouette, pointing up-right) ──────────────────

export function Plane({ size = 24, color = "currentColor", className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      {...rest}
    >
      <g transform="rotate(45 12 12)">
        <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </g>
    </svg>
  );
}
export const PlaneTakeoff = Plane;

// ─── Hotel / Bed ───────────────────────────────────────────────────────────

export function BedDouble(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 20v-9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9" />
      <path d="M3 17h18" />
      <path d="M3 20h18" />
      <path d="M5 13h6v-2.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V13Z" />
      <path d="M13 13h6v-2.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V13Z" />
    </Stroke>
  );
}
export const Hotel = BedDouble;

// ─── Cutlery (crossed fork & knife) ────────────────────────────────────────

export function UtensilsCrossed(props: IconProps) {
  return (
    <Stroke {...props}>
      {/* Fork */}
      <path d="M16 2v6c0 1.1.9 2 2 2v12" />
      <path d="M18 2v6" />
      <path d="M20 2v6c0 1.1-.9 2-2 2" />
      {/* Knife crossed over */}
      <path d="M3 22l7-7" />
      <path d="M6 8c-1-1-1-3 0-4l1-1c1-1 3-1 4 0l6 6" />
    </Stroke>
  );
}

// ─── Ticket (single — wallet nav) ──────────────────────────────────────────

export function Ticket(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </Stroke>
  );
}
export const Wallet = Ticket;

// ─── Tickets (two stacked — activity event) ────────────────────────────────

export function Tickets(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5.5 7.5 14 3a1 1 0 0 1 1.3.4L17 6.5" />
      <rect x="2" y="8" width="20" height="13" rx="2" />
      <path d="M6 11v1" />
      <path d="M6 15v1" />
      <path d="M6 19v1" />
    </Stroke>
  );
}

// ─── Globe (P-IONNA nav) ───────────────────────────────────────────────────

export function Globe2(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </Stroke>
  );
}

// ─── User / Person ─────────────────────────────────────────────────────────

export function User(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Stroke>
  );
}

// ─── Paperclip ─────────────────────────────────────────────────────────────

export function Paperclip(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M21 11.5 12.5 20a5.5 5.5 0 0 1-7.78-7.78l9-9a3.5 3.5 0 0 1 4.95 4.95l-9 9a1.5 1.5 0 1 1-2.12-2.12L15.5 7" />
    </Stroke>
  );
}

// ─── Edit / Pen ────────────────────────────────────────────────────────────

export function PenSquare(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M14 4 4 14v6h6L20 10" />
      <path d="m14 4 3-3 4 4-3 3" />
      <path d="m14 4 6 6" />
    </Stroke>
  );
}
export const Pencil = PenSquare;

// ─── Chevrons ──────────────────────────────────────────────────────────────

export function ChevronRight(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m9 6 6 6-6 6" />
    </Stroke>
  );
}

export function ChevronLeft(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m15 6-6 6 6 6" />
    </Stroke>
  );
}

// ─── Hamburger menu (three thin equal lines) ───────────────────────────────

export function Menu(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Stroke>
  );
}

// ─── Arrows ────────────────────────────────────────────────────────────────

export function ArrowLeft(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Stroke>
  );
}

export function ArrowUp(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </Stroke>
  );
}

export function ArrowLeftRight(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </Stroke>
  );
}

// ─── Misc utility ──────────────────────────────────────────────────────────

export function X(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Stroke>
  );
}

export function Plus(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Stroke>
  );
}

export function Trash2(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </Stroke>
  );
}

export function LogOut(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Stroke>
  );
}

export function Mail(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </Stroke>
  );
}

export function Lock(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Stroke>
  );
}

export function Mic(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </Stroke>
  );
}

// ─── Timeline category icons ───────────────────────────────────────────────

export function Car(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 17h14" />
      <path d="m4 12 2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5" />
      <path d="M4 12h16v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-2-2H8a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1v-5Z" />
      <circle cx="8" cy="16" r="1" />
      <circle cx="16" cy="16" r="1" />
    </Stroke>
  );
}

export function ShoppingBag(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 8h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Stroke>
  );
}

export function Sparkles(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 4v3" />
      <path d="M12 17v3" />
      <path d="M4 12h3" />
      <path d="M17 12h3" />
      <path d="m6 6 2 2" />
      <path d="m16 16 2 2" />
      <path d="m6 18 2-2" />
      <path d="m16 8 2-2" />
    </Stroke>
  );
}

// ─── Activity (running figure, solid silhouette) ───────────────────────────

export function PersonRunning({ size = 24, color = "currentColor", className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      {...rest}
    >
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9 1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 6.3V11h2V7.6l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
    </svg>
  );
}
