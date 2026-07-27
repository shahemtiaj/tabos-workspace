import { Globe2, X, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useClock } from "@/hooks/useClock";
import { useSettingsStore } from "@/stores/settings";

type City = { label: string; tz: string };
type S = { cities: City[]; add: (c: City) => void; remove: (i: number) => void };

const useWorldClocks = create<S>()(
  persist(
    (set) => ({
      cities: [
        { label: "New York", tz: "America/New_York" },
        { label: "London", tz: "Europe/London" },
        { label: "Tokyo", tz: "Asia/Tokyo" },
        { label: "Dhaka", tz: "Asia/Dhaka" },
      ],
      add: (c) => set((s) => ({ cities: [...s.cities, c] })),
      remove: (i) => set((s) => ({ cities: s.cities.filter((_, idx) => idx !== i) })),
    }),
    { name: "tabos-world-clocks" },
  ),
);

const TZ_OPTIONS: { tz: string; label: string }[] = [
  { tz: "Pacific/Honolulu", label: "Honolulu" },
  { tz: "America/Anchorage", label: "Anchorage" },
  { tz: "America/Los_Angeles", label: "Los Angeles" },
  { tz: "America/Denver", label: "Denver" },
  { tz: "America/Chicago", label: "Chicago" },
  { tz: "America/New_York", label: "New York" },
  { tz: "America/Toronto", label: "Toronto" },
  { tz: "America/Mexico_City", label: "Mexico City" },
  { tz: "America/Sao_Paulo", label: "São Paulo" },
  { tz: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { tz: "Atlantic/Reykjavik", label: "Reykjavík" },
  { tz: "Europe/London", label: "London" },
  { tz: "Europe/Lisbon", label: "Lisbon" },
  { tz: "Europe/Paris", label: "Paris" },
  { tz: "Europe/Berlin", label: "Berlin" },
  { tz: "Europe/Madrid", label: "Madrid" },
  { tz: "Europe/Rome", label: "Rome" },
  { tz: "Europe/Amsterdam", label: "Amsterdam" },
  { tz: "Europe/Stockholm", label: "Stockholm" },
  { tz: "Europe/Athens", label: "Athens" },
  { tz: "Europe/Istanbul", label: "Istanbul" },
  { tz: "Europe/Moscow", label: "Moscow" },
  { tz: "Africa/Cairo", label: "Cairo" },
  { tz: "Africa/Lagos", label: "Lagos" },
  { tz: "Africa/Johannesburg", label: "Johannesburg" },
  { tz: "Asia/Jerusalem", label: "Jerusalem" },
  { tz: "Asia/Dubai", label: "Dubai" },
  { tz: "Asia/Tehran", label: "Tehran" },
  { tz: "Asia/Karachi", label: "Karachi" },
  { tz: "Asia/Kolkata", label: "Mumbai / Delhi" },
  { tz: "Asia/Kathmandu", label: "Kathmandu" },
  { tz: "Asia/Dhaka", label: "Dhaka" },
  { tz: "Asia/Bangkok", label: "Bangkok" },
  { tz: "Asia/Jakarta", label: "Jakarta" },
  { tz: "Asia/Singapore", label: "Singapore" },
  { tz: "Asia/Hong_Kong", label: "Hong Kong" },
  { tz: "Asia/Shanghai", label: "Shanghai" },
  { tz: "Asia/Seoul", label: "Seoul" },
  { tz: "Asia/Tokyo", label: "Tokyo" },
  { tz: "Australia/Perth", label: "Perth" },
  { tz: "Australia/Sydney", label: "Sydney" },
  { tz: "Pacific/Auckland", label: "Auckland" },
];

export function WorldClocksWidget() {
  const now = useClock();
  const { clock24h } = useSettingsStore();
  const { cities, add, remove } = useWorldClocks();
  const [tz, setTz] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const selected = useMemo(() => TZ_OPTIONS.find((o) => o.tz === tz), [tz]);

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 mb-3">
        <Globe2 className="h-3.5 w-3.5" /> World Clocks
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1 overflow-auto">
        {cities.map((c, i) => {
          let time = "";
          let invalid = false;
          if (now) {
            try {
              time = new Intl.DateTimeFormat("en-US", {
                timeZone: c.tz,
                hour: "numeric",
                minute: "2-digit",
                hour12: !clock24h,
              }).format(now);
            } catch {
              invalid = true;
              time = "Invalid TZ";
            }
          }
          void invalid;
          return (
            <div key={c.label + i} className="glass-subtle rounded-2xl p-3 relative group">
              <div className="text-[10px] uppercase tracking-widest text-white/50">{c.label}</div>
              <div className="text-xl font-mono tabular-nums text-white/90 mt-0.5">{time}</div>
              <button
                onClick={() => remove(i)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-5 w-5 grid place-items-center rounded-full hover:bg-white/10"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim() || !tz.trim()) return;
          add({ label: label.trim(), tz: tz.trim() });
          setLabel("");
          setTz("");
        }}
        className="mt-2 flex gap-1"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="City"
          className="glass-subtle rounded-full px-3 py-1.5 text-xs outline-none flex-1 min-w-0"
        />
        <input
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          placeholder="Asia/Dhaka"
          className="glass-subtle rounded-full px-3 py-1.5 text-xs outline-none flex-1 min-w-0"
        />
        <button className="glass-subtle rounded-full h-8 w-8 grid place-items-center hover:bg-white/10">
          <Plus className="h-3 w-3" />
        </button>
      </form>
    </GlassPanel>
  );
}
