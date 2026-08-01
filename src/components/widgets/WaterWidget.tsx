import { Droplets, Minus, Plus } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useHydrated } from "@/hooks/useHydrated";
import { dayKey } from "@/stores/consistency";

type S = {
  day: string;
  glasses: number;
  goal: number;
  add: (n: number) => void;
  setGoal: (n: number) => void;
};

export const useWaterStore = create<S>()(
  persist(
    (set) => ({
      day: dayKey(),
      glasses: 0,
      goal: 8,
      add: (n) =>
        set((s) => {
          const today = dayKey();
          const base = s.day === today ? s.glasses : 0;
          return { day: today, glasses: Math.max(0, base + n) };
        }),
      setGoal: (goal) => set({ goal: Math.max(1, goal) }),
    }),
    { name: "tabos-water" },
  ),
);

export function WaterWidget() {
  const hydrated = useHydrated();
  const { day, glasses, goal, add, setGoal } = useWaterStore();
  const count = hydrated && day === dayKey() ? glasses : 0;
  const pct = Math.min(100, Math.round((count / goal) * 100));

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/50 mb-3">
        <span className="flex items-center gap-2">
          <Droplets className="h-3.5 w-3.5" /> Hydration
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setGoal(goal - 1)}
            className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10"
            aria-label="Lower goal"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="tabular-nums text-white/60">{goal}</span>
          <button
            onClick={() => setGoal(goal + 1)}
            className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10"
            aria-label="Raise goal"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="text-4xl font-semibold tabular-nums leading-none">{count}</div>
        <div className="text-xs text-white/40 pb-1">of {goal} glasses · {pct}%</div>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--ws-accent), var(--ws-accent-2))",
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            onClick={() => add(i < count ? -(count - i) : i + 1 - count)}
            aria-label={`Set ${i + 1} glasses`}
            className={`h-6 w-6 rounded-lg grid place-items-center transition ${
              i < count ? "bg-sky-400/70 text-white" : "glass-subtle text-white/30"
            }`}
          >
            <Droplets className="h-3 w-3" />
          </button>
        ))}
      </div>

      <div className="mt-auto pt-3 flex gap-2">
        <button
          onClick={() => add(1)}
          className="flex-1 rounded-full py-2 text-xs text-white font-medium"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          + Glass
        </button>
        <button
          onClick={() => add(-1)}
          className="glass-subtle rounded-full px-4 py-2 text-xs hover:bg-white/10"
        >
          Undo
        </button>
      </div>
    </GlassPanel>
  );
}
