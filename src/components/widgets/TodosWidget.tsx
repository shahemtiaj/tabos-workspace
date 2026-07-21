import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { useTodosStore, type Priority } from "@/stores/todos";
import { GlassCard } from "@/components/glass/GlassPanel";
import { AnimatePresence, motion } from "motion/react";

const priorityColor: Record<Priority, string> = {
  high: "#f43f5e",
  med: "#f59e0b",
  low: "#22d3ee",
};

export function TodosWidget() {
  const { todos, add, toggle, remove } = useTodosStore();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("med");

  const done = todos.filter((t) => t.done).length;
  const pct = todos.length ? Math.round((done / todos.length) * 100) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add(title.trim(), priority);
    setTitle("");
  };

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Tasks</h2>
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" className="-rotate-90">
            <circle cx="14" cy="14" r="11" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
            <circle
              cx="14"
              cy="14"
              r="11"
              stroke="var(--ws-accent)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 11}
              strokeDashoffset={2 * Math.PI * 11 * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset 500ms ease" }}
            />
          </svg>
          <span className="text-xs text-white/60 tabular-nums w-8">{pct}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto -mx-1 px-1 space-y-1.5 min-h-0">
        <AnimatePresence initial={false}>
          {todos.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="group flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5"
            >
              <button
                onClick={() => toggle(t.id)}
                className="h-5 w-5 rounded-md border grid place-items-center transition shrink-0"
                style={{
                  borderColor: t.done ? "transparent" : "rgba(255,255,255,0.2)",
                  background: t.done ? "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" : "transparent",
                }}
              >
                {t.done && <Check className="h-3 w-3" />}
              </button>
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: priorityColor[t.priority] }}
              />
              <span className={`flex-1 text-sm min-w-0 truncate ${t.done ? "line-through text-white/40" : "text-white/85"}`}>
                {t.title}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="opacity-0 group-hover:opacity-100 transition h-6 w-6 grid place-items-center rounded-md hover:bg-white/10 text-white/50"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        onSubmit={submit}
        className="glass-subtle mt-3 flex items-center gap-2 pl-3 pr-1 py-1 rounded-full"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40 min-w-0"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="text-[11px] bg-white/5 border border-white/10 rounded-full px-2 py-1 outline-none"
        >
          <option value="low" className="bg-neutral-900">Low</option>
          <option value="med" className="bg-neutral-900">Med</option>
          <option value="high" className="bg-neutral-900">High</option>
        </select>
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
