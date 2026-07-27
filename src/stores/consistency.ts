import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Rule = {
  id: string;
  title: string;
  history: Record<string, boolean>; // key: YYYY-MM-DD
};

type State = {
  rules: Rule[];
  add: (title: string) => void;
  remove: (id: string) => void;
  toggle: (id: string, dayKey: string) => void;
};

// Local-date key (YYYY-MM-DD) — using toISOString() would shift the day for
// any timezone offset from UTC and corrupt streaks/heatmap near midnight.
export const dayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const useConsistencyStore = create<State>()(
  persist(
    (set) => ({
      rules: [
        { id: "gym", title: "Go to Gym", history: {} },
        { id: "code", title: "Code 3 Hours", history: {} },
        { id: "read", title: "Read Book", history: {} },
        { id: "sleep", title: "Sleep before 11 PM", history: {} },
      ],
      add: (title) => set((s) => ({ rules: [...s.rules, { id: crypto.randomUUID(), title, history: {} }] })),
      remove: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      toggle: (id, dk) =>
        set((s) => ({
          rules: s.rules.map((r) =>
            r.id === id ? { ...r, history: { ...r.history, [dk]: !r.history[dk] } } : r,
          ),
        })),
    }),
    { name: "tabos-consistency" },
  ),
);

export function computeStreak(history: Record<string, boolean>): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = dayKey(d);
    if (history[k]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}
