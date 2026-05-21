import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Car,
  ChevronRight,
  Paperclip,
  PenSquare,
  Plane,
  ShoppingBag,
  Sparkles,
  Tickets,
  UtensilsCrossed,
  X,
} from "@/components/ui/icons";
import type { LucideIcon } from "@/components/ui/icons";
import { tripApi } from "@/services/trip.service";
import { bookingApi } from "@/services/booking.service";
import { walletApi } from "@/services/wallet.service";
import type { Booking, TripDetail, WalletEntry } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { ExpenseFormModal } from "@/features/wallet/ExpenseFormModal";
import { useAuthStore } from "@/store/auth.store";
import { buildSortedEvents } from "./TripDetailPage";

/**
 * Full-screen detail view for a single timeline event (flight, hotel, dining,
 * or activity). One layout, four content adaptations.
 *
 * Routed at /trips/:tripId/event/:kind/:id where:
 *   kind = "booking"  →  trip.bookings.find(...)
 *   kind = "entry"    →  trip.walletEntries.find(...)
 *
 * Independent from the existing /bookings/:id boarding-pass screen, which
 * is still used by the swipe/chevron navigation on the trip timeline.
 */
export function TripEventDetailPage() {
  const { tripId = "", kind = "", id = "" } = useParams<{
    tripId: string;
    kind: string;
    id: string;
  }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<EditDraft>({});

  const refresh = () => {
    setLoading(true);
    tripApi
      .get(tripId)
      .then(setTrip)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const event = useMemo(() => {
    if (!trip) return null;
    if (kind === "booking") return trip.bookings.find((b) => b.id === id) ?? null;
    if (kind === "entry") return trip.walletEntries.find((e) => e.id === id) ?? null;
    return null;
  }, [trip, kind, id]);

  // Carousel navigation through every event of the trip in strict
  // chronological order (see buildSortedEvents). Each swipe-left, chevron
  // tap or right-peek click advances to the next event; clicking the
  // left-peek card goes back to the previous event. The cycle wraps at
  // both ends so the controls always feel responsive.
  const { prevEventLink, nextEventLink } = useMemo(() => {
    if (!trip) return { prevEventLink: null as string | null, nextEventLink: null as string | null };
    const events = buildSortedEvents(trip);
    if (events.length === 0) return { prevEventLink: null, nextEventLink: null };
    const currentIdx = events.findIndex((e) => e.kind === kind && e.id === id);
    const next = events[currentIdx < 0 ? 0 : (currentIdx + 1) % events.length];
    const prev = events[currentIdx <= 0 ? events.length - 1 : currentIdx - 1];
    return {
      nextEventLink: `/trips/${trip.id}/event/${next.kind}/${next.id}`,
      prevEventLink: `/trips/${trip.id}/event/${prev.kind}/${prev.id}`,
    };
  }, [trip, kind, id]);

  const goToNextEvent = () => {
    if (nextEventLink) navigate(nextEventLink);
  };

  const goToPrevEvent = () => {
    if (prevEventLink) navigate(prevEventLink);
  };

  const swipeHandlers = useSwipeLeft(goToNextEvent);

  // Exit edit mode whenever the user navigates to a different event so the
  // draft doesn't bleed across cards.
  useEffect(() => {
    setIsEditing(false);
    setDraft({});
  }, [kind, id]);

  const startEdit = () => {
    if (!event) return;
    if (kind === "booking") {
      const b = event as Booking;
      const meta = parseMetadata(b.metadata);
      setDraft({
        fromCity: b.fromCity ?? "",
        toCity: b.toCity ?? "",
        airline: b.airline ?? "",
        flightNumber: b.flightNumber ?? "",
        departureTime: toTimeInput(b.departureTime ?? b.startDate),
        arrivalTime: toTimeInput(b.arrivalTime ?? b.endDate ?? b.startDate),
        reference: b.reference,
        hotelName: b.hotelName ?? "",
        hotelAddress: b.hotelAddress ?? "",
        startDateISO: b.startDate,
        endDateISO: b.endDate ?? b.startDate,
        startDate: toDateInput(b.startDate),
        endDate: toDateInput(b.endDate ?? b.startDate),
        terminalFrom: meta.terminalFrom ?? "",
        terminalTo: meta.terminalTo ?? "",
        ticketNumber: meta.ticketNumber ?? "",
        phone: meta.phone ?? "",
        roomType: meta.roomType ?? "",
        checkInTime: meta.checkInTime ?? "",
        checkOutTime: meta.checkOutTime ?? "",
      });
    } else if (kind === "entry") {
      const e = event as WalletEntry;
      setDraft({
        entryTitle: e.title,
        entryDate: toDateInput(e.date),
        entryDateISO: e.date,
        entryDescription: e.description ?? "",
      });
    }
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!event) return;
    setSaving(true);
    try {
      if (kind === "booking") {
        const b = event as Booking;
        const prevMeta = parseMetadata(b.metadata);
        const newMeta = {
          ...prevMeta,
          terminalFrom: draft.terminalFrom ?? prevMeta.terminalFrom,
          terminalTo: draft.terminalTo ?? prevMeta.terminalTo,
          ticketNumber: draft.ticketNumber ?? prevMeta.ticketNumber,
          phone: draft.phone ?? prevMeta.phone,
          roomType: draft.roomType ?? prevMeta.roomType,
          checkInTime: draft.checkInTime ?? prevMeta.checkInTime,
          checkOutTime: draft.checkOutTime ?? prevMeta.checkOutTime,
        };
        const update: Record<string, unknown> = {
          fromCity: draft.fromCity ?? b.fromCity,
          toCity: draft.toCity ?? b.toCity,
          airline: draft.airline ?? b.airline,
          flightNumber: draft.flightNumber ?? b.flightNumber,
          reference: draft.reference ?? b.reference,
          hotelName: draft.hotelName ?? b.hotelName,
          hotelAddress: draft.hotelAddress ?? b.hotelAddress,
          metadata: newMeta,
        };
        if (draft.departureTime && draft.startDateISO) {
          update.departureTime = mergeDateTime(draft.startDateISO, draft.departureTime);
        }
        if (draft.arrivalTime) {
          const ref = draft.endDateISO ?? draft.startDateISO ?? b.startDate;
          update.arrivalTime = mergeDateTime(ref, draft.arrivalTime);
        }
        if (draft.startDate) {
          update.startDate = new Date(draft.startDate).toISOString();
        }
        if (draft.endDate) {
          update.endDate = new Date(draft.endDate).toISOString();
        }
        if (b.type === "FLIGHT" && draft.fromCity && draft.toCity) {
          update.title = `${draft.fromCity} → ${draft.toCity}`;
        } else if (b.type === "HOTEL" && draft.hotelName) {
          update.title = draft.hotelName;
        }
        await bookingApi.update(b.id, update);
      } else if (kind === "entry") {
        const e = event as WalletEntry;
        const update: Record<string, unknown> = {
          title: draft.entryTitle ?? e.title,
          description: draft.entryDescription ?? e.description,
        };
        if (draft.entryDate) {
          update.date = new Date(draft.entryDate).toISOString();
        }
        await walletApi.update(e.id, update);
      }
      setIsEditing(false);
      setDraft({});
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof EditDraft, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  if (loading || !trip) {
    return (
      <div className="flex justify-center py-12 text-slate-400">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-full bg-slate-100 p-6 text-center">
        <Link
          to={`/trips/${tripId}`}
          className="inline-flex items-center gap-2 text-sm text-navy-700 underline"
        >
          <ArrowLeft size={14} /> Back to itinerary
        </Link>
        <p className="mt-4 text-sm text-slate-500">Event not found.</p>
      </div>
    );
  }

  const headerDate =
    kind === "booking"
      ? new Date((event as Booking).startDate)
      : new Date((event as WalletEntry).date);

  return (
    <div className="relative flex h-full touch-pan-y select-none flex-col bg-slate-100" {...swipeHandlers}>
      <Hero trip={trip} />

      {/* Carousel area — fills the remaining height. The main card stretches
          to fill that space; peek cards on each side hint at adjacent events
          and are clickable to navigate. */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden px-4 pt-3">
        {/* left peek */}
        <button
          type="button"
          onClick={goToPrevEvent}
          aria-label="Previous event"
          className="absolute left-0 top-3 bottom-2 z-0 flex w-[80%]
                     -translate-x-[calc(100%-12px)] cursor-pointer flex-col overflow-hidden rounded-3xl
                     shadow-[0_4px_18px_rgba(15,26,51,0.1)] focus:outline-none"
        >
          <div className="bg-navy-800 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-transparent">
            &nbsp;
          </div>
          <div className="flex-1 bg-white" />
        </button>
        {/* right peek */}
        <button
          type="button"
          onClick={goToNextEvent}
          aria-label="Next event"
          className="absolute right-0 top-3 bottom-2 z-0 flex w-[80%]
                     translate-x-[calc(100%-12px)] cursor-pointer flex-col overflow-hidden rounded-3xl
                     shadow-[0_4px_18px_rgba(15,26,51,0.1)] focus:outline-none"
        >
          <div className="bg-navy-800 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-transparent">
            &nbsp;
          </div>
          <div className="flex-1 bg-white" />
        </button>

        <article className="relative z-10 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_6px_28px_rgba(15,26,51,0.14)]">
          <header className="shrink-0 bg-navy-800 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white">
            {formatDateHeader(headerDate)}
          </header>
          {/* Scrollable body — content sits at the top, whitespace fills the
              rest so the action buttons stay anchored to the bottom of the card. */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {kind === "booking" && (event as Booking).type === "FLIGHT" && (
              <FlightBody
                booking={event as Booking}
                isEditing={isEditing}
                draft={draft}
                setField={setField}
              />
            )}
            {kind === "booking" && (event as Booking).type === "HOTEL" && (
              <HotelBody
                booking={event as Booking}
                isEditing={isEditing}
                draft={draft}
                setField={setField}
              />
            )}
            {kind === "entry" && (
              <EntryBody
                entry={event as WalletEntry}
                isEditing={isEditing}
                draft={draft}
                setField={setField}
              />
            )}
          </div>

          {/* Action buttons live INSIDE the card at the bottom right */}
          <div className="shrink-0 flex justify-end gap-3 px-5 pb-4 pt-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-navy-800 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex h-12 items-center justify-center rounded-full bg-navy-800 px-5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  aria-label="View attachment"
                  onClick={() => setAttachmentOpen(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  aria-label="Edit"
                  onClick={startEdit}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-700"
                >
                  <PenSquare size={18} />
                </button>
              </>
            )}
          </div>
        </article>
      </div>

      {/* Arrow indicator sits below the card, above the bottom nav. */}
      {!isEditing && nextEventLink && (
        <div className="shrink-0 flex justify-center pb-2">
          <button
            type="button"
            onClick={goToNextEvent}
            aria-label="Next event"
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-800 transition hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-navy-300"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      )}

      {attachmentOpen && event && (
        <AttachmentPreview
          event={event}
          kind={kind}
          trip={trip}
          onClose={() => setAttachmentOpen(false)}
        />
      )}

      <ExpenseFormModal
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          refresh();
        }}
        defaultTripId={tripId}
      />
    </div>
  );
}

// ─── hero (shared with the timeline view, kept local to this file) ──────────

function Hero({ trip }: { trip: TripDetail }) {
  const range = `${formatHeroDate(trip.startDate)} - ${formatHeroDateWithYear(trip.endDate)}`;
  return (
    <div className="relative h-16 w-full shrink-0 overflow-hidden bg-navy-800">
      {trip.imageUrl && (
        <img
          src={trip.imageUrl}
          alt={trip.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <Link
        to={`/trips/${trip.id}`}
        aria-label="Back to timeline"
        className="absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow"
      >
        <ArrowLeft size={14} />
      </Link>
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/25 to-transparent px-5 pb-1.5 text-white">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-extrabold tracking-wide">{trip.name.toUpperCase()}</h1>
          <span className="text-[10px] font-medium tracking-wider opacity-95">{range}</span>
        </div>
      </div>
    </div>
  );
}

// ─── inline edit shared types ───────────────────────────────────────────────

interface EditDraft {
  // booking — flight
  fromCity?: string;
  toCity?: string;
  airline?: string;
  flightNumber?: string;
  departureTime?: string; // HH:MM
  arrivalTime?: string;   // HH:MM
  reference?: string;
  // booking — hotel
  hotelName?: string;
  hotelAddress?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startDateISO?: string;
  endDateISO?: string;
  // booking — metadata
  terminalFrom?: string;
  terminalTo?: string;
  ticketNumber?: string;
  phone?: string;
  roomType?: string;
  checkInTime?: string;
  checkOutTime?: string;
  // wallet entry
  entryTitle?: string;
  entryDate?: string;
  entryDateISO?: string;
  entryDescription?: string;
}

interface EditProps {
  isEditing: boolean;
  draft: EditDraft;
  setField: (key: keyof EditDraft, value: string) => void;
}

function InlineText({
  isEditing,
  value,
  onChange,
  className = "",
  inputClassName = "",
  type = "text",
  placeholder,
}: {
  isEditing: boolean;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputClassName?: string;
  type?: string;
  placeholder?: string;
}) {
  if (isEditing) {
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          "w-full min-w-0 bg-transparent border-b border-dashed border-navy-300 focus:border-navy-700 focus:outline-none " +
          className +
          " " +
          inputClassName
        }
      />
    );
  }
  return <span className={className}>{value || placeholder || "—"}</span>;
}

function toTimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mergeDateTime(dateRefIso: string, timeHHMM: string): string {
  const d = new Date(dateRefIso);
  const [h, m] = timeHHMM.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

// ─── shared card pieces ─────────────────────────────────────────────────────

function CardHeader({
  title,
  subtitle,
  Icon,
  subtitleVariant = "default",
}: {
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
  /** "address" applies a 30% reduction (hotel city, restaurant location,
   *  any other location subtitle). "default" applies the standard 15%
   *  reduction (e.g. flight's "Singapore Airlines SQ226"). */
  subtitleVariant?: "default" | "address";
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-1">
      <div className="min-w-0 flex-1">
        <h2 className="text-[24px] font-extrabold leading-tight text-navy-900">{title}</h2>
        {subtitle && (
          <p
            className={
              "mt-1 text-slate-400 " +
              (subtitleVariant === "address" ? "text-[11px]" : "text-[14px]")
            }
          >
            {subtitle}
          </p>
        )}
      </div>
      <span className="flex-shrink-0 text-navy-800">
        <Icon size={40} strokeWidth={1.7} />
      </span>
    </div>
  );
}

function Divider() {
  return <div className="my-3 h-px bg-slate-100" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
      {children}
    </div>
  );
}

function Value({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mt-1 text-[17px] font-bold text-navy-900 ${className}`}>{children}</div>;
}

function ReservationBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-slate-100 px-4 py-3 shadow-[0_2px_8px_rgba(15,26,51,0.06)]">
      {children}
    </div>
  );
}

function DetailsRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[78px_1fr] gap-4">
      <Label>DETAILS</Label>
      <div className="text-[10px] leading-relaxed text-navy-900">{children}</div>
    </div>
  );
}

// ─── body per event type ────────────────────────────────────────────────────

function FlightBody({ booking, isEditing, draft, setField }: { booking: Booking } & EditProps) {
  const dep = new Date(booking.departureTime ?? booking.startDate);
  const arr = new Date(booking.arrivalTime ?? booking.endDate ?? booking.startDate);
  const meta = parseMetadata(booking.metadata);
  const title =
    booking.fromCity && booking.toCity
      ? `${booking.fromCity} to ${booking.toCity}`
      : booking.title;
  const subtitle = [booking.airline, booking.flightNumber].filter(Boolean).join(" ");

  return (
    <>
      {isEditing ? (
        <EditableHeader
          fromValue={draft.fromCity ?? ""}
          toValue={draft.toCity ?? ""}
          subtitleValue={`${draft.airline ?? ""} ${draft.flightNumber ?? ""}`.trim()}
          onFromChange={(v) => setField("fromCity", v)}
          onToChange={(v) => setField("toCity", v)}
          onSubtitleChange={(v) => {
            // first word = airline, rest = flight number (best-effort split)
            const parts = v.split(" ");
            const last = parts.pop() ?? "";
            setField("airline", parts.join(" "));
            setField("flightNumber", last);
          }}
          Icon={Plane}
        />
      ) : (
        <CardHeader title={title} subtitle={subtitle} Icon={Plane} />
      )}
      <Divider />

      <SegmentRow
        label="DEPARTS"
        time={isEditing ? (draft.departureTime ?? "") : formatTime12(dep)}
        code={isEditing ? (draft.fromCity ?? "").slice(0, 3).toUpperCase() : shortCode(booking.fromCity)}
        terminal={isEditing ? (draft.terminalFrom ?? "") : (meta.terminalFrom ?? "—")}
        isEditing={isEditing}
        onTimeChange={(v) => setField("departureTime", v)}
        onTerminalChange={(v) => setField("terminalFrom", v)}
        timeInputType="time"
      />
      <Divider />
      <SegmentRow
        label="ARRIVES"
        time={isEditing ? (draft.arrivalTime ?? "") : formatTime12(arr)}
        code={isEditing ? (draft.toCity ?? "").slice(0, 3).toUpperCase() : shortCode(booking.toCity)}
        terminal={isEditing ? (draft.terminalTo ?? "") : (meta.terminalTo ?? "—")}
        isEditing={isEditing}
        onTimeChange={(v) => setField("arrivalTime", v)}
        onTerminalChange={(v) => setField("terminalTo", v)}
        timeInputType="time"
      />

      <ReservationBox>
        <div>
          <Label>RESERVATION NR.</Label>
          <InlineText
            isEditing={isEditing}
            value={isEditing ? (draft.reference ?? "") : booking.reference}
            onChange={(v) => setField("reference", v)}
            className="mt-1 inline-block text-[15px] font-bold tracking-wide text-navy-900"
          />
        </div>
        {(isEditing || meta.ticketNumber) && (
          <div>
            <Label>TICKET NR.</Label>
            <InlineText
              isEditing={isEditing}
              value={isEditing ? (draft.ticketNumber ?? "") : (meta.ticketNumber ?? "")}
              onChange={(v) => setField("ticketNumber", v)}
              className="mt-1 inline-block text-[15px] font-bold tracking-wide text-navy-900"
            />
          </div>
        )}
      </ReservationBox>
    </>
  );
}

function SegmentRow({
  label,
  time,
  code,
  terminal,
  isEditing = false,
  onTimeChange,
  onTerminalChange,
  timeInputType = "text",
}: {
  label: string;
  time: string;
  code: string;
  terminal: string;
  isEditing?: boolean;
  onTimeChange?: (v: string) => void;
  onTerminalChange?: (v: string) => void;
  timeInputType?: string;
}) {
  return (
    <div className="grid grid-cols-3 items-start gap-x-4">
      <div>
        <Label>{label}</Label>
        {isEditing && onTimeChange ? (
          <input
            type={timeInputType}
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[17px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
          />
        ) : (
          <Value>{time}</Value>
        )}
      </div>
      <div className="pt-[2px]">
        <div className="text-[17px] font-bold text-navy-900">{code}</div>
      </div>
      <div>
        <Label>TERMINAL</Label>
        {isEditing && onTerminalChange ? (
          <input
            type="text"
            value={terminal}
            onChange={(e) => onTerminalChange(e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[17px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
          />
        ) : (
          <Value>{terminal}</Value>
        )}
      </div>
    </div>
  );
}

function EditableHeader({
  fromValue,
  toValue,
  subtitleValue,
  onFromChange,
  onToChange,
  onSubtitleChange,
  Icon,
}: {
  fromValue: string;
  toValue: string;
  subtitleValue: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  Icon: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-4 pb-1">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <input
            value={fromValue}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="From"
            className="min-w-0 flex-1 bg-transparent border-b border-dashed border-navy-300 text-[20px] font-extrabold leading-tight text-navy-900 focus:border-navy-700 focus:outline-none"
          />
          <span className="text-[20px] font-extrabold text-navy-900">→</span>
          <input
            value={toValue}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="To"
            className="min-w-0 flex-1 bg-transparent border-b border-dashed border-navy-300 text-[20px] font-extrabold leading-tight text-navy-900 focus:border-navy-700 focus:outline-none"
          />
        </div>
        <input
          value={subtitleValue}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Airline + flight number"
          className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[14px] text-slate-500 focus:border-navy-700 focus:outline-none"
        />
      </div>
      <span className="flex-shrink-0 text-navy-800">
        <Icon size={40} strokeWidth={1.7} />
      </span>
    </div>
  );
}

function HotelBody({ booking, isEditing, draft, setField }: { booking: Booking } & EditProps) {
  const checkIn = new Date(booking.startDate);
  const checkOut = booking.endDate ? new Date(booking.endDate) : checkIn;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000),
  );
  const meta = parseMetadata(booking.metadata);
  const subtitle = shortAddress(booking.hotelAddress) ?? booking.toCity ?? "";

  const addressLines = (booking.hotelAddress ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      {isEditing ? (
        <div className="flex items-start justify-between gap-4 pb-1">
          <div className="min-w-0 flex-1 space-y-1">
            <input
              value={draft.hotelName ?? ""}
              onChange={(e) => setField("hotelName", e.target.value)}
              placeholder="Hotel name"
              className="w-full bg-transparent border-b border-dashed border-navy-300 text-[24px] font-extrabold leading-tight text-navy-900 focus:border-navy-700 focus:outline-none"
            />
            <input
              value={draft.hotelAddress ?? ""}
              onChange={(e) => setField("hotelAddress", e.target.value)}
              placeholder="Address"
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[11px] text-slate-500 focus:border-navy-700 focus:outline-none"
            />
          </div>
          <span className="flex-shrink-0 text-navy-800">
            <BedDouble size={40} strokeWidth={1.7} />
          </span>
        </div>
      ) : (
        <CardHeader
          title={booking.hotelName ?? booking.title}
          subtitle={subtitle}
          Icon={BedDouble}
          subtitleVariant="address"
        />
      )}
      <Divider />

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Label>CHECK-IN</Label>
          {isEditing ? (
            <input
              type="date"
              value={draft.startDate ?? ""}
              onChange={(e) => setField("startDate", e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[15px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
            />
          ) : (
            <Value>{formatMonthDay(checkIn)}</Value>
          )}
        </div>
        <div>
          <Label>TIME</Label>
          {isEditing ? (
            <input
              type="time"
              value={draft.checkInTime ?? ""}
              onChange={(e) => setField("checkInTime", e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[15px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
            />
          ) : (
            <div className="mt-1 text-[15px] font-bold text-navy-900">
              {meta.checkInTime ?? "—"}
            </div>
          )}
        </div>
      </div>
      <Divider />
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Label>CHECK-OUT</Label>
          {isEditing ? (
            <input
              type="date"
              value={draft.endDate ?? ""}
              onChange={(e) => setField("endDate", e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[15px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
            />
          ) : (
            <Value>{formatMonthDay(checkOut)}</Value>
          )}
        </div>
        <div>
          <Label>TIME</Label>
          {isEditing ? (
            <input
              type="time"
              value={draft.checkOutTime ?? ""}
              onChange={(e) => setField("checkOutTime", e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[15px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
            />
          ) : (
            <div className="mt-1 text-[15px] font-bold text-navy-900">
              {meta.checkOutTime ?? "—"}
            </div>
          )}
        </div>
      </div>
      <Divider />

      {isEditing ? (
        <div className="grid grid-cols-[78px_1fr] gap-4">
          <Label>DETAILS</Label>
          <div className="space-y-1">
            <input
              value={draft.hotelAddress ?? ""}
              onChange={(e) => setField("hotelAddress", e.target.value)}
              placeholder="Address (comma-separated lines)"
              className="w-full bg-transparent border-b border-dashed border-navy-300 text-[10px] text-navy-900 focus:border-navy-700 focus:outline-none"
            />
            <input
              value={draft.phone ?? ""}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Phone"
              className="w-full bg-transparent border-b border-dashed border-navy-300 text-[10px] text-navy-900 focus:border-navy-700 focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <DetailsRow>
          <div className="font-medium">{booking.hotelName ?? booking.title}</div>
          {addressLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {meta.phone && <div className="mt-1">{meta.phone}</div>}
        </DetailsRow>
      )}

      <ReservationBox>
        <div>
          <Label>RESERVATION NR.</Label>
          <InlineText
            isEditing={isEditing}
            value={isEditing ? (draft.reference ?? "") : booking.reference}
            onChange={(v) => setField("reference", v)}
            className="mt-1 inline-block text-[15px] font-bold tracking-wide text-navy-900"
          />
        </div>
        <div>
          <Label>ROOM</Label>
          {isEditing ? (
            <input
              value={draft.roomType ?? ""}
              onChange={(e) => setField("roomType", e.target.value)}
              placeholder="Room type"
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[15px] font-bold text-navy-900 focus:border-navy-700 focus:outline-none"
            />
          ) : (
            <div className="mt-1 text-[15px] font-bold text-navy-900">
              {nights} {nights === 1 ? "Night" : "Nights"}
              {meta.roomType ? ` | ${meta.roomType}` : ""}
            </div>
          )}
        </div>
      </ReservationBox>
    </>
  );
}

function EntryBody({ entry, isEditing, draft, setField }: { entry: WalletEntry } & EditProps) {
  const date = new Date(entry.date);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  const { title, location } = splitEntryTitle(entry);
  const Icon = iconForCategory(entry.category);
  const meta = parseEntryMeta(entry.description);
  const isActivity = entry.category === "ACTIVITY";

  return (
    <>
      {isEditing ? (
        <div className="flex items-start justify-between gap-4 pb-1">
          <div className="min-w-0 flex-1 space-y-1">
            <input
              value={draft.entryTitle ?? ""}
              onChange={(e) => setField("entryTitle", e.target.value)}
              placeholder="Title — Location"
              className="w-full bg-transparent border-b border-dashed border-navy-300 text-[24px] font-extrabold leading-tight text-navy-900 focus:border-navy-700 focus:outline-none"
            />
            <input
              value={draft.entryDate ?? ""}
              onChange={(e) => setField("entryDate", e.target.value)}
              type="date"
              className="mt-1 w-full bg-transparent border-b border-dashed border-navy-300 text-[11px] text-slate-500 focus:border-navy-700 focus:outline-none"
            />
          </div>
          <span className="flex-shrink-0 text-navy-800">
            <Icon size={40} strokeWidth={1.7} />
          </span>
        </div>
      ) : (
        <CardHeader title={title} subtitle={location ?? ""} Icon={Icon} subtitleVariant="address" />
      )}
      <Divider />

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Label>TIME</Label>
          <Value>{hasTime ? formatTime12(date) : "—"}</Value>
        </div>
        <div>
          <Label>BOOKING</Label>
          <Value>{meta.pax ? `${meta.pax} pax` : "—"}</Value>
        </div>
      </div>

      {(meta.placeName || meta.address || meta.phone) && (
        <>
          <Divider />
          <DetailsRow>
            {meta.placeName && <div>{meta.placeName}</div>}
            {meta.address
              ?.split(",")
              .map((line, i) => <div key={i}>{line.trim()}</div>)}
            {meta.phone && <div className="mt-1 underline decoration-navy-900/30 underline-offset-4">{meta.phone}</div>}
          </DetailsRow>
        </>
      )}

      <ReservationBox>
        {isActivity && (
          <div>
            <Label>TYPE</Label>
            <div className="mt-1 text-[15px] font-bold tracking-wide text-navy-900">
              {meta.type ?? "—"}
            </div>
          </div>
        )}
        <div>
          <Label>RESERVATION NAME</Label>
          <div className="mt-1 text-[15px] font-bold tracking-wide text-navy-900">
            {meta.reservationName ?? "—"}
          </div>
        </div>
      </ReservationBox>
    </>
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

function parseMetadata(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

interface EntryMeta {
  placeName?: string;
  address?: string;
  phone?: string;
  pax?: number;
  reservationName?: string;
  type?: string;
}

function parseEntryMeta(raw: string | null): EntryMeta {
  if (!raw) return {};
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return {};
  try {
    return JSON.parse(trimmed) as EntryMeta;
  } catch {
    return {};
  }
}

function shortCode(city: string | null): string {
  if (!city) return "—";
  return city.slice(0, 3).toUpperCase();
}

function shortAddress(addr: string | null): string | null {
  if (!addr) return null;
  const parts = addr.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 2].replace(/\s+\d.*$/, "");
    const tokens = cityPart.split(/\s+/);
    if (tokens.length >= 2) {
      return `${tokens.slice(0, -1).join(" ")}, ${tokens[tokens.length - 1]}`;
    }
    return cityPart;
  }
  return parts[0] ?? null;
}

function splitEntryTitle(entry: WalletEntry): { title: string; location: string | null } {
  const title = entry.title.trim();
  const parts = title.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    return { title: titleCase(parts[0]), location: parts.slice(1).join(" — ") };
  }
  return { title: titleCase(title), location: null };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function iconForCategory(category: string): LucideIcon {
  switch (category) {
    case "FOOD":
      return UtensilsCrossed;
    case "TRANSPORT":
      return Car;
    case "ACTIVITY":
      return Tickets;
    case "SHOPPING":
      return ShoppingBag;
    case "FLIGHT":
      return Plane;
    case "HOTEL":
      return BedDouble;
    default:
      return Sparkles;
  }
}

function formatDateHeader(d: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d).toUpperCase();
  const date = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
  return `${weekday} | ${date}`;
}

function formatTime12(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .toUpperCase();
}

function formatMonthDay(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
    .format(d)
    .toUpperCase();
}

function formatHeroDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
    .format(d)
    .toUpperCase();
}

function formatHeroDateWithYear(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
}

// ─── attachment preview ────────────────────────────────────────────────────

/**
 * Full-screen document preview that renders a styled e-ticket / booking
 * confirmation for the currently-displayed event. Opens when the paperclip
 * FAB is tapped on the carousel detail view. Scrolls vertically inside the
 * phone frame; the close (X) button at the top-right dismisses it.
 */
function AttachmentPreview({
  event,
  kind,
  trip,
  onClose,
}: {
  event: Booking | WalletEntry;
  kind: string;
  trip: TripDetail;
  onClose: () => void;
}) {
  const passengerName = useAuthStore((s) => s.user?.name ?? "Ana Traveler").toUpperCase();

  // Close on Escape so the overlay feels like a real modal on web too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/65 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative my-2 w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-navy-800 transition hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        {kind === "booking" && (event as Booking).type === "FLIGHT" && (
          <RawFileDocument src={FLIGHT_TICKET_FILE} />
        )}
        {kind === "booking" && (event as Booking).type === "HOTEL" && (
          <HotelConfirmationDocument booking={event as Booking} passengerName={passengerName} />
        )}
        {kind === "entry" && (
          <EntryReceiptDocument entry={event as WalletEntry} tripName={trip.name} passengerName={passengerName} />
        )}
      </div>
    </div>
  );
}

function DocHeader({ eyebrow, brand }: { eyebrow: string; brand: string }) {
  return (
    <div className="border-b border-slate-200 px-6 pb-4 pt-7">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {eyebrow}
      </div>
      <div className="mt-2 text-xl font-extrabold tracking-tight text-navy-900">{brand}</div>
    </div>
  );
}

function DocLabelValue({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-semibold text-navy-900">{value}</div>
    </div>
  );
}

function DocSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 px-6 py-4 last:border-b-0">
      {title && (
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Path (served from /public) to the real uploaded flight ticket. Flight
 * attachment previews render this raw file directly — no templating.
 */
const FLIGHT_TICKET_FILE = "/sq-ticket.png";

/**
 * Renders an uploaded document file as-is inside the modal: a PDF via an
 * embedded <iframe>, or an image via a full-width <img>. The surrounding
 * modal (dark backdrop, close button, scrollable content) is unchanged.
 */
function RawFileDocument({ src }: { src: string }) {
  const isPdf = src.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return (
      <iframe
        src={src}
        title="Ticket document"
        className="block h-[78vh] w-full rounded-2xl"
      />
    );
  }
  return <img src={src} alt="Ticket document" className="block w-full rounded-2xl" />;
}

function HotelConfirmationDocument({
  booking,
  passengerName,
}: {
  booking: Booking;
  passengerName: string;
}) {
  const meta = parseMetadata(booking.metadata);
  const checkIn = new Date(booking.startDate);
  const checkOut = booking.endDate ? new Date(booking.endDate) : checkIn;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000),
  );
  const addressLines = (booking.hotelAddress ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <DocHeader eyebrow="Hotel Confirmation" brand={booking.hotelName ?? booking.title} />

      <DocSection>
        <div className="grid grid-cols-2 gap-4">
          <DocLabelValue label="Guest" value={passengerName} />
          <DocLabelValue label="Status" value={(booking.status ?? "CONFIRMED").toUpperCase()} />
          <DocLabelValue label="Booking Reference" value={booking.reference} />
          {meta.roomType && <DocLabelValue label="Room" value={meta.roomType} />}
        </div>
      </DocSection>

      <DocSection title="Stay">
        <div className="grid grid-cols-2 gap-4">
          <DocLabelValue
            label="Check-in"
            value={
              <>
                {formatDocDate(checkIn)}
                <span className="ml-2 text-slate-500">{meta.checkInTime ?? "—"}</span>
              </>
            }
          />
          <DocLabelValue
            label="Check-out"
            value={
              <>
                {formatDocDate(checkOut)}
                <span className="ml-2 text-slate-500">{meta.checkOutTime ?? "—"}</span>
              </>
            }
          />
          <DocLabelValue label="Nights" value={String(nights)} />
        </div>
      </DocSection>

      <DocSection title="Hotel">
        <div className="space-y-1 text-[12px] leading-relaxed text-navy-900">
          <div className="font-medium">{booking.hotelName ?? booking.title}</div>
          {addressLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          {meta.phone && <div className="mt-1 text-slate-600">{meta.phone}</div>}
        </div>
      </DocSection>

      <DocSection title="Notes">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Please present a valid photo ID and the credit card used at booking when
          checking in. Late check-out is subject to availability and may incur an
          additional charge.
        </p>
      </DocSection>
    </>
  );
}

function EntryReceiptDocument({
  entry,
  tripName,
  passengerName,
}: {
  entry: WalletEntry;
  tripName: string;
  passengerName: string;
}) {
  const { title, location } = splitEntryTitle(entry);
  const meta = parseEntryMeta(entry.description);
  const date = new Date(entry.date);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

  return (
    <>
      <DocHeader eyebrow="Reservation Confirmation" brand={title} />

      <DocSection>
        <div className="grid grid-cols-2 gap-4">
          <DocLabelValue label="Reservation Name" value={meta.reservationName ?? passengerName} />
          <DocLabelValue label="Trip" value={tripName} />
          <DocLabelValue label="Date" value={formatDocDate(date)} />
          {hasTime && <DocLabelValue label="Time" value={formatTime24(date)} />}
          {meta.pax && <DocLabelValue label="Party" value={`${meta.pax} pax`} />}
          {meta.type && <DocLabelValue label="Type" value={meta.type} />}
        </div>
      </DocSection>

      {(location || meta.placeName || meta.address || meta.phone) && (
        <DocSection title="Venue">
          <div className="space-y-1 text-[12px] leading-relaxed text-navy-900">
            {(meta.placeName ?? location) && (
              <div className="font-medium">{meta.placeName ?? location}</div>
            )}
            {meta.address?.split(",").map((line, i) => (
              <div key={i}>{line.trim()}</div>
            ))}
            {meta.phone && <div className="mt-1 text-slate-600">{meta.phone}</div>}
          </div>
        </DocSection>
      )}

      <DocSection title="Notes">
        <p className="text-[11px] leading-relaxed text-slate-500">
          Please arrive 10 minutes before your scheduled time. Cancellations made
          less than 24 hours in advance may be subject to a fee.
        </p>
      </DocSection>
    </>
  );
}

function formatDocDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatTime24(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── swipe-left hook ────────────────────────────────────────────────────────

const SWIPE_DISTANCE_THRESHOLD = 50;
const SWIPE_VERTICAL_TOLERANCE = 50;

/**
 * Same swipe behaviour as the timeline screen: a 50 px leftward gesture
 * (touch on mobile, mouse drag on desktop) advances to the next event.
 * Mouse listeners attach to `window` on drag-start so the gesture still
 * resolves even if the cursor leaves the page area.
 */
function useSwipeLeft(onSwipeLeft: () => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const resolveSwipe = (endX: number, endY: number) => {
    if (!startRef.current) return;
    const dx = endX - startRef.current.x;
    const dy = endY - startRef.current.y;
    startRef.current = null;
    if (dx < -SWIPE_DISTANCE_THRESHOLD && Math.abs(dy) < SWIPE_VERTICAL_TOLERANCE) {
      onSwipeLeft();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      resolveSwipe(ev.clientX, ev.clientY);
    };
    const handleMouseMove = (_ev: MouseEvent) => {
      // attached only so the mouseup listener is paired symmetrically
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    resolveSwipe(t.clientX, t.clientY);
  };

  const onTouchCancel = () => {
    startRef.current = null;
  };

  return { onMouseDown, onTouchStart, onTouchEnd, onTouchCancel };
}
