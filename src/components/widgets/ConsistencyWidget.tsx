import { Fragment, useState } from "react";
import { Plus, Flame, Trash2 } from "lucide-react";
import { useConsistencyStore, computeStreak, dayKey } from "@/stores/consistency";
import { GlassCard } from "@/components/glass/GlassPanel";

function last7Days() {
  const arr: Date[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const c = new Date(d);
    c.setDate(d.getDate() - i);
    arr.push(c);
  }
  return arr;
}

export function ConsistencyWidget() {
  const { rules, add, remove, toggle } = useConsistencyStore();
  const [title, setTitle] = useState("");
  const days = last7Days();
  const today = dayKey();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add(title.trim());
    setTitle("");
  };

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Consistency</h2>
        <div className="flex items-center gap-1 text-xs text-white/60">
          <Flame className="h-3.5 w-3.5" style={{ color: "var(--ws-accent)" }} />
          <span>Streaks</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 items-center flex-1 min-h-0 overflow-auto">
        {rules.map((r) => {
          const streak = computeStreak(r.history);
          return (
            <>
              <div key={r.id + "-l"} className="flex items-center gap-2 min-w-0 group">
                <button
                  onClick={() => toggle(r.id, today)}
                  className="h-5 w-5 rounded-md border shrink-0"
                  style={{
                    borderColor: r.history[today] ? "transparent" : "rgba(255,255,255,0.2)",
                    background: r.history[today] ? "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" : "transparent",
                  }}
                />
                <span className="text-sm text-white/85 truncate">{r.title}</span>
                <button
                  onClick={() => remove(r.id)}
                  className="opacity-0 group-hover:opacity-100 transition h-6 w-6 grid place-items-center rounded-md hover:bg-white/10 text-white/50 ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <span className="text-[11px] text-white/50 tabular-nums shrink-0">{streak}d</span>
              </div>
              <div key={r.id + "-h"} className="flex gap-1">
                {days.map((d) => {
                  const k = dayKey(d);
                  const on = r.history[k];
                  return (
                    <div
                      key={k}
                      className="h-4 w-4 rounded-[5px]"
                      style={{
                        background: on
                          ? "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))"
                          : "rgba(255,255,255,0.06)",
                      }}
                      title={k}
                    />
                  );
                })}
              </div>
            </>
          );
        })}
      </div>

      <form
        onSubmit={submit}
        className="glass-subtle mt-3 flex items-center gap-2 pl-3 pr-1 py-1 rounded-full"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a rule…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40 min-w-0"
        />
        <button
          type="submit"
          className="h-8 w-8 grid place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          aria-label="Add"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </GlassCard>
  );
}
