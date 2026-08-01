import { CalendarClock, Plus, X } from "lucide-react";
import { useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useHydrated } from "@/hooks/useHydrated";

export type CountdownEvent = { id: string; label: string; date: string };

type S = {
  events: CountdownEvent[];
  add: (label: string, date: string) => void;
  remove: (id: string) => void;
};

export const useCountdownStore = create<S>()(
  persist(
    (set) => ({
      events: [],
      add: (label, date) =>
        set((s) => ({
          events: [...s.events, { id: crypto.randomUUID(), label, date }].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        })),
      remove: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: "tabos-countdown" },
  ),
);

function daysUntil(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function CountdownWidget() {
  const hydrated = useHydrated();
  const { events, add, remove } = useCountdownStore();
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 mb-3">
        <CalendarClock className="h-3.5 w-3.5" /> Countdowns
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {hydrated && events.length === 0 && (
          <p className="text-sm text-white/40">No events yet — add a date below.</p>
        )}
        {hydrated &&
          events.map((e) => {
            const d = daysUntil(e.date);
            const past = d !== null && d < 0;
            return (
              <div
                key={e.id}
                className="glass-subtle rounded-2xl px-3 py-2 flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{e.label}</div>
                  <div className="text-[10px] text-white/40">{e.date}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-semibold tabular-nums leading-none ${past ? "text-white/35" : ""}`}
                  >
                    {d === null ? "—" : Math.abs(d)}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40">
                    {d === 0 ? "today" : past ? "days ago" : "days"}
                  </div>
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10 text-white/40"
                  aria-label={`Remove ${e.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
      </div>

      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!label.trim() || !date) return;
          add(label.trim(), date);
          setLabel("");
          setDate("");
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Event…"
          className="glass-subtle flex-1 min-w-0 rounded-full px-3 py-2 text-xs outline-none placeholder:text-white/30"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="glass-subtle rounded-full px-3 py-2 text-xs outline-none [color-scheme:dark]"
        />
        <button
          type="submit"
          className="h-8 w-8 grid place-items-center rounded-full text-white shrink-0"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          aria-label="Add event"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </GlassPanel>
  );
}
