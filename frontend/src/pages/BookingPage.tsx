import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  BedDouble,
  PersonRunning,
  Plane,
} from "@/components/ui/icons";
import type { LucideIcon } from "@/components/ui/icons";
import { cn } from "@/utils/cn";

/**
 * Booking tab — a self-contained four-screen flow:
 *   1. home      → FLIGHT / HOTEL / ACTIVITY launchers + inspiration cards
 *   2. flight    → flight search form + inline results
 *   3. hotel     → hotel search form + inline results
 *   4. activity  → activity search form + inline results
 *
 * Navigation is driven by local state (no routing), so the BOOKING tab in
 * the bottom navigation stays active on every screen and the phone frame
 * keeps its fixed height — only the white content area scrolls.
 */
type Screen = "home" | "flight" | "hotel" | "activity";

export function BookingPage() {
  const [screen, setScreen] = useState<Screen>("home");
  const backToHome = () => setScreen("home");

  return (
    <div className="flex h-full flex-col">
      {screen === "home" && <BookingHome onSelect={setScreen} />}
      {screen === "flight" && <FlightSearchScreen onBack={backToHome} />}
      {screen === "hotel" && <HotelSearchScreen onBack={backToHome} />}
      {screen === "activity" && <ActivitySearchScreen onBack={backToHome} />}
    </div>
  );
}

// ─── Screen 1 — Booking home ─────────────────────────────────────────────────

const INSPIRATION = [
  {
    title: "Singapore city lights are calling you ...",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  },
  {
    title: "Discover Philippines islands!",
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
  },
  {
    title: "Outback vs. Grand Canyon",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  },
];

function BookingHome({ onSelect }: { onSelect: (s: Screen) => void }) {
  return (
    <>
      <div className="shrink-0 bg-navy-800 px-4 pb-7 pt-3">
        <div className="flex items-start justify-around">
          <CircleButton label="FLIGHT" Icon={Plane} onClick={() => onSelect("flight")} />
          <CircleButton label="HOTEL" Icon={BedDouble} onClick={() => onSelect("hotel")} />
          <CircleButton label="ACTIVITY" Icon={PersonRunning} onClick={() => onSelect("activity")} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="space-y-4 p-4">
          {INSPIRATION.map((card) => (
            <div key={card.title} className="relative h-44 overflow-hidden rounded-2xl shadow-sm">
              <img
                src={card.image}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/5" />
              <h3 className="absolute left-5 top-5 max-w-[78%] text-2xl font-extrabold leading-tight text-white drop-shadow-md">
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CircleButton({
  label,
  Icon,
  onClick,
}: {
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean-500 text-white shadow-md transition hover:bg-ocean-600">
        <Icon size={30} />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
        {label}
      </span>
    </button>
  );
}

// ─── Screen 2 — Flight search ────────────────────────────────────────────────

function FlightSearchScreen({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState("RETURN");
  const [from, setFrom] = useState("Singapore");
  const [to, setTo] = useState("London");
  const search = useSearch();

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <SearchShell
      Icon={Plane}
      onBack={onBack}
      results={search.hasResults ? <FlightResults from={from} to={to} /> : null}
    >
      <Toggle options={["RETURN", "ONE-WAY", "MULTI-CITY"]} value={mode} onChange={setMode} />

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <TextField value={from} onChange={setFrom} placeholder="From" />
        <TextField value={to} onChange={setTo} placeholder="To" />
        <button
          type="button"
          onClick={swap}
          aria-label="Swap origin and destination"
          className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ocean-500 text-white shadow"
        >
          <ArrowLeftRight size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <DateField defaultValue="2025-06-15" />
        <DateField defaultValue="2025-07-05" />
      </div>

      <TappableLine>1 Traveller&nbsp;&nbsp;&nbsp;Economy Class</TappableLine>

      <SearchButton searching={search.searching} onClick={search.run} />
    </SearchShell>
  );
}

// ─── Screen 3 — Hotel search ─────────────────────────────────────────────────

function HotelSearchScreen({ onBack }: { onBack: () => void }) {
  const [destination, setDestination] = useState("Singapore");
  const search = useSearch();

  return (
    <SearchShell
      Icon={BedDouble}
      onBack={onBack}
      results={search.hasResults ? <HotelResults /> : null}
    >
      <TextField value={destination} onChange={setDestination} placeholder="Destination" />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <DateField defaultValue="2025-06-15" />
        <DateField defaultValue="2025-07-05" />
      </div>

      <TappableLine>2 Adults&nbsp;&nbsp;&nbsp;0 Children&nbsp;&nbsp;&nbsp;1 Room</TappableLine>

      <SearchButton searching={search.searching} onClick={search.run} />
    </SearchShell>
  );
}

// ─── Screen 4 — Activity search ──────────────────────────────────────────────

function ActivitySearchScreen({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState("SPECIFIC");
  const [activity, setActivity] = useState("Jungle Hike");
  const [location, setLocation] = useState("Singapore");
  const search = useSearch();

  return (
    <SearchShell
      Icon={PersonRunning}
      onBack={onBack}
      results={search.hasResults ? <ActivityResults /> : null}
    >
      <Toggle options={["SPECIFIC", "SURPRISE-ME"]} value={mode} onChange={setMode} />

      <div className="mt-4">
        <TextField value={activity} onChange={setActivity} placeholder="Activity" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <TextField value={location} onChange={setLocation} placeholder="Location" />
        <DateField defaultValue="2025-07-04" />
      </div>

      <TappableLine>2 Adults</TappableLine>

      <SearchButton searching={search.searching} onClick={search.run} />
    </SearchShell>
  );
}

// ─── search state ────────────────────────────────────────────────────────────

function useSearch() {
  const [searching, setSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const run = () => {
    setSearching(true);
    setHasResults(false);
    window.setTimeout(() => {
      setSearching(false);
      setHasResults(true);
    }, 1500);
  };

  return { searching, hasResults, run };
}

// ─── flight results ──────────────────────────────────────────────────────────

const AIRPORT_CODES: Record<string, string> = {
  singapore: "SIN",
  london: "LHR",
  "kuala lumpur": "KUL",
  tokyo: "HND",
  sydney: "SYD",
  "new york": "JFK",
  paris: "CDG",
  dubai: "DXB",
  bangkok: "BKK",
  "hong kong": "HKG",
  perth: "PER",
  cebu: "CEB",
};

function airportCode(city: string): string {
  const key = city.trim().toLowerCase();
  return AIRPORT_CODES[key] ?? (city.trim().slice(0, 3).toUpperCase() || "—");
}

const FLIGHTS = [
  { airline: "Singapore Airlines", brand: "#1f2e5b", initials: "SQ", dep: "09:00", arr: "14:30", duration: "13h 30m", stops: "Direct", price: "420" },
  { airline: "Qatar Airways", brand: "#5c0a2e", initials: "QR", dep: "11:45", arr: "06:15", duration: "16h 10m", stops: "1 Stop", price: "385" },
  { airline: "British Airways", brand: "#1d4f91", initials: "BA", dep: "21:30", arr: "05:55", duration: "13h 25m", stops: "Direct", price: "510" },
  { airline: "Emirates", brand: "#9b1b30", initials: "EK", dep: "02:10", arr: "13:40", duration: "17h 30m", stops: "1 Stop", price: "465" },
];

function FlightResults({ from, to }: { from: string; to: string }) {
  const fromCode = airportCode(from);
  const toCode = airportCode(to);
  return (
    <ul className="space-y-3 p-4">
      {FLIGHTS.map((f) => (
        <li
          key={f.airline}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,26,51,0.06)]"
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white"
              style={{ backgroundColor: f.brand }}
            >
              {f.initials}
            </span>
            <span className="text-sm font-semibold text-navy-800">{f.airline}</span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div>
              <div className="text-lg font-bold text-navy-900">{f.dep}</div>
              <div className="text-xs text-slate-500">{fromCode}</div>
            </div>
            <div className="flex-1 text-center text-[11px] text-slate-400">
              <div>
                {f.duration} · {f.stops}
              </div>
              <div className="my-1 h-px bg-slate-200" />
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-navy-900">{f.arr}</div>
              <div className="text-xs text-slate-500">{toCode}</div>
            </div>
          </div>

          <div className="mt-2 text-right">
            <span className="text-xs text-slate-400">from </span>
            <span className="text-xl font-extrabold text-navy-900">£{f.price}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── hotel results ───────────────────────────────────────────────────────────

const HOTELS = [
  { name: "Marina Bay Sands", stars: 5, area: "Marina Bay", desc: "Rooftop pool · City view · Free breakfast", price: "180", accent: "#2f4072" },
  { name: "The Fullerton Hotel", stars: 5, area: "Downtown Core", desc: "Heritage building · Spa · Riverside", price: "165", accent: "#149e7a" },
  { name: "Parkroyal Collection", stars: 4, area: "Pickering", desc: "Garden terraces · Infinity pool · Gym", price: "140", accent: "#1f8cea" },
  { name: "Hotel Boss", stars: 3, area: "Lavender", desc: "Near MRT · Pool · Food court", price: "72", accent: "#37a3ff" },
];

function HotelResults() {
  return (
    <ul className="space-y-3 p-4">
      {HOTELS.map((h) => (
        <li
          key={h.name}
          className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_2px_10px_rgba(15,26,51,0.06)]"
        >
          <CardImage
            src={`https://picsum.photos/seed/${picsumSeed(h.name)}/400/200`}
            alt={h.name}
            accent={h.accent}
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-navy-900">{h.name}</div>
            <Stars count={h.stars} />
            <div className="text-xs text-slate-400">{h.area}</div>
            <div className="mt-1 text-xs text-slate-600">{h.desc}</div>
            <div className="mt-2 text-right">
              <span className="text-xs text-slate-400">from </span>
              <span className="text-base font-extrabold text-navy-900">£{h.price}</span>
              <span className="text-xs text-slate-400">/night</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Builds a stable Picsum seed from a card name (alphanumeric, no spaces). */
function picsumSeed(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, "") || "travel";
}

/**
 * Rounded-corner card thumbnail. Loads a Picsum photo (unique per seed). If
 * the image fails to load it falls back to a CSS gradient built from the
 * card's accent colour, so a broken-image icon is never shown. Consistent
 * 96×96 size across hotel and activity cards.
 */
function CardImage({ src, alt, accent }: { src: string; alt: string; accent: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="h-24 w-24 shrink-0 rounded-xl"
        style={{ backgroundImage: `linear-gradient(135deg, ${accent} 0%, ${accent}80 100%)` }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-24 w-24 shrink-0 rounded-xl object-cover"
    />
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="my-0.5 text-sm leading-none text-amber-400" aria-label={`${count} stars`}>
      {"★".repeat(count)}
      <span className="text-slate-200">{"★".repeat(Math.max(0, 5 - count))}</span>
    </div>
  );
}

// ─── activity results ────────────────────────────────────────────────────────

const ACTIVITIES = [
  { name: "Jungle Hike & Waterfalls", category: "Outdoor · Adventure", duration: "3 hours", rating: 4.8, reviews: 124, price: "45", accent: "#149e7a" },
  { name: "Marina Bay Kayak Tour", category: "Outdoor · Water", duration: "2 hours", rating: 4.6, reviews: 89, price: "38", accent: "#37a3ff" },
  { name: "Heritage Food Walk", category: "Cultural · Food", duration: "4 hours", rating: 4.9, reviews: 210, price: "55", accent: "#9b1b30" },
  { name: "Night Safari Experience", category: "Wildlife · Family", duration: "3.5 hours", rating: 4.7, reviews: 156, price: "62", accent: "#2f4072" },
];

function ActivityResults() {
  return (
    <ul className="space-y-3 p-4">
      {ACTIVITIES.map((a) => (
        <li
          key={a.name}
          className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_2px_10px_rgba(15,26,51,0.06)]"
        >
          <CardImage
            src={`https://picsum.photos/seed/${picsumSeed(a.name)}/400/200`}
            alt={a.name}
            accent={a.accent}
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-navy-900">{a.name}</div>
            <span className="mt-1 inline-block rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-700">
              {a.category}
            </span>
            <div className="mt-1 text-xs text-slate-500">{a.duration}</div>
            <div className="mt-1 text-xs text-amber-500">
              ★ {a.rating} <span className="text-slate-400">· {a.reviews} reviews</span>
            </div>
            <div className="mt-1 text-right">
              <span className="text-xs text-slate-400">from </span>
              <span className="text-base font-extrabold text-navy-900">£{a.price}</span>
              <span className="text-xs text-slate-400">/person</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─── shared search-screen pieces ─────────────────────────────────────────────

function SearchShell({
  Icon,
  onBack,
  children,
  results,
}: {
  Icon: LucideIcon;
  onBack: () => void;
  children: React.ReactNode;
  results?: React.ReactNode;
}) {
  return (
    <>
      <div className="shrink-0 bg-navy-800 px-5 pb-6 pt-2 text-white">
        <div className="relative flex h-10 items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to booking home"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-white"
          >
            <ArrowLeft size={22} />
          </button>
          <Icon size={28} />
        </div>
        {children}
      </div>
      {/* White content area — search results scroll here within the fixed frame */}
      <div className="flex-1 overflow-y-auto bg-white">{results}</div>
    </>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-5 pt-1 text-[12px] font-semibold uppercase tracking-[0.15em]">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "pb-0.5 transition",
            value === o ? "border-b-2 border-white text-white" : "text-white/55",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-lg bg-white px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-400/50"
    />
  );
}

function DateField({ defaultValue }: { defaultValue?: string }) {
  return (
    <input
      type="date"
      defaultValue={defaultValue}
      className="h-12 w-full rounded-lg bg-white px-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-400/50"
    />
  );
}

function TappableLine({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="mt-4 block text-left text-[15px] font-medium text-white transition hover:text-white/80"
    >
      {children}
    </button>
  );
}

function SearchButton({ searching, onClick }: { searching: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={searching}
      onClick={onClick}
      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ocean-500 text-base font-bold text-white transition hover:bg-ocean-600 disabled:opacity-80"
    >
      {searching && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {searching ? "Searching…" : "Search"}
    </button>
  );
}
