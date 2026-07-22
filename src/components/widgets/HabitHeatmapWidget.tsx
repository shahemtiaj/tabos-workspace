import { Flame } from "lucide-react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { useConsistencyStore, dayKey } from "@/stores/consistency";

export function HabitHeatmapWidget() {
  const rules = useConsistencyStore((s) => s.rules);
  const days = 91; // 13 weeks × 7
  const today = new Date();
  const cells: { key: string; count: number; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = dayKey(d);
    const total = rules.length;
    const count = rules.reduce((n, r) => n + (r.history[k] ? 1 : 0), 0);
    cells.push({ key: k, count, total });
  }

  const color = (count: number, total: number) => {
    if (!total || !count) return "rgba(255,255,255,0.06)";
    const t = count / total;
    return `color-mix(in oklab, var(--ws-accent) ${20 + Math.round(t * 70)}%, transparent)`;
  };

  return (
    <GlassPanel className="h-full w-full p-5 flex flex-col">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 mb-3">
        <Flame className="h-3.5 w-3.5" /> Habit Heatmap · last 13 weeks
      </div>
      <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1 auto-cols-fr">
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key} · ${c.count}/${c.total}`}
            className="rounded-[3px] w-full h-full min-h-2"
            style={{ background: color(c.count, c.total) }}
          />
        ))}
      </div>
    </GlassPanel>
  );
}
