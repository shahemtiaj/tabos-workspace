import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings";

export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  const showSeconds = useSettingsStore((s) => s.clockSeconds);
  useEffect(() => {
    setNow(new Date());
    const interval = showSeconds ? 1000 : 15_000;
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [showSeconds]);
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
