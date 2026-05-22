import { useEffect, useState } from "react";

/**
 * iPhone-style status bar.
 *
 * Renders as a static, normal-flow element — mount it as the FIRST child
 * of each layout's phone-shell container so it always sits at the very
 * top of the mobile frame and never moves, floats, or repositions.
 *
 * Self-contained — no external icon libraries; SVGs are inline.
 */
export function StatusBar() {
  const time = useLiveTime();
  const batteryPercent = useBatteryPercent();

  return (
    <div
      aria-hidden="true"
      className="relative z-30 flex h-7 w-full shrink-0 items-center justify-between bg-navy-800 px-6 text-[12px] font-semibold leading-none tracking-tight text-white"
    >
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        <CellularBars />
        <WifiIcon />
        <BatteryIndicator percent={batteryPercent} />
      </div>
    </div>
  );
}

// ─── live time ──────────────────────────────────────────────────────────────

function useLiveTime() {
  const [time, setTime] = useState(() => formatHHMM(new Date()));
  useEffect(() => {
    const tick = () => setTime(formatHHMM(new Date()));
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
  return time;
}

function formatHHMM(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ─── battery ────────────────────────────────────────────────────────────────

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

function useBatteryPercent() {
  const [percent, setPercent] = useState<number>(100);

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== "function") return;

    let detach: (() => void) | undefined;
    nav.getBattery().then((battery) => {
      const sync = () => setPercent(Math.round(battery.level * 100));
      sync();
      battery.addEventListener("levelchange", sync);
      detach = () => battery.removeEventListener("levelchange", sync);
    });
    return () => detach?.();
  }, []);

  return percent;
}

// ─── icons (inline SVG) ─────────────────────────────────────────────────────

function CellularBars() {
  return (
    <svg width="17" height="10" viewBox="0 0 17 10" fill="currentColor">
      <rect x="0" y="7" width="3" height="3" rx="0.6" />
      <rect x="4.5" y="5" width="3" height="5" rx="0.6" />
      <rect x="9" y="3" width="3" height="7" rx="0.6" />
      <rect x="13.5" y="0" width="3" height="10" rx="0.6" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      width="15"
      height="10"
      viewBox="0 0 15 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M1.2 3.6 Q 7.5 -1.4 13.8 3.6" />
      <path d="M3.4 5.7 Q 7.5 1.8 11.6 5.7" />
      <circle cx="7.5" cy="8.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BatteryIndicator({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillWidth = (clamped / 100) * 18;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] tabular-nums opacity-90">{clamped}%</span>
      <svg width="26" height="12" viewBox="0 0 26 12">
        <rect
          x="0.6"
          y="0.6"
          width="22"
          height="10.8"
          rx="2.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <rect x="23.6" y="3.5" width="1.6" height="5" rx="0.6" fill="currentColor" opacity="0.6" />
        <rect x="2.2" y="2.2" width={fillWidth} height="7.6" rx="1.2" fill="currentColor" />
      </svg>
    </div>
  );
}
