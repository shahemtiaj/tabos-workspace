import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassPanel";

const PRESETS = [
  { label: "25 / 5", work: 25 * 60 },
  { label: "50 / 10", work: 50 * 60 },
  { label: "15 / 3", work: 15 * 60 },
];

export function PomodoroWidget() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [remaining, setRemaining] = useState(preset.work);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => setRemaining(preset.work), [preset]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const pct = 1 - remaining / preset.work;
  const R = 68;
  const C = 2 * Math.PI * R;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <GlassCard className="p-5 h-full flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Focus</div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition ${preset.label === p.label ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className={`relative ${running ? "animate-breath" : ""}`}>
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <circle
            cx="80"
            cy="80"
            r={R}
            stroke="url(#pomo-grad)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          <defs>
            <linearGradient id="pomo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ws-accent)" />
              <stop offset="100%" stopColor="var(--ws-accent-2)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center font-mono text-3xl tabular-nums font-semibold">
          {mm}:{ss}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="h-11 w-11 grid place-items-center rounded-full text-white accent-glow"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setRemaining(preset.work);
          }}
          className="h-11 w-11 grid place-items-center rounded-full glass-subtle hover:bg-white/10 transition"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </GlassCard>
  );
}
