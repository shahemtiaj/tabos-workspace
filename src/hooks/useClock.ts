import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings";

export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  const showSeconds = useSettingsStore((s) => s.clockSeconds);
  const h24 = useSettingsStore((s) => s.clock24h);
  useEffect(() => {
    setNow(new Date());
    const interval = showSeconds ? 1000 : 15_000;
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
    // h24 is included so the displayed time re-renders promptly when the
    // 12h/24h toggle changes instead of waiting up to 15s for the next tick.
  }, [showSeconds, h24]);
  return now;
}

export function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

export function formatTime(d: Date, opts: { seconds: boolean; h24: boolean }) {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: opts.seconds ? "2-digit" : undefined,
    hour12: !opts.h24,
  });
}

export function formatDate(d: Date) {
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}
