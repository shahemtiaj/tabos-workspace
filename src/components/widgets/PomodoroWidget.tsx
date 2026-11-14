import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/glass/GlassPanel";
import { FOCUS_PRESETS, playChime, useFocusStore } from "@/stores/focus";
import { useSettingsStore } from "@/stores/settings";
import { dayKey } from "@/stores/consistency";

const fmt = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export function PomodoroWidget() {
  const f = useFocusStore();
  const sound = useSettingsStore((s) => s.focusSound);
  const setSound = useSettingsStore((s) => s.setFocusSound);
  const [now, setNow] = useState(() => Date.now());

  // Repaint twice a second while running; the time itself comes from endsAt.
  useEffect(() => {
    if (!f.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [f.running]);

  // One precise timeout for the end of the phase (a single timeout is not
  // slowed down in a background tab the way a repeating timer is).
  useEffect(() => {
    if (!f.running || f.endsAt == null) return;
    const finish = () => {
      const done = useFocusStore.getState().settle();
      if (!done) return;
      if (!done.late && useSettingsStore.getState().focusSound) playChime();
      if (done.finished === "focus") {
        toast.success(done.late ? "Your focus session finished while you were away" : "Focus session done — take a break");
      } else if (!done.late) {
        toast("Break's over — ready for the next one?");
      }
    };
    const id = window.setTimeout(finish, Math.max(0, f.endsAt - Date.now()) + 50);
    return () => window.clearTimeout(id);
  }, [f.running, f.endsAt]);

  const remaining = f.running && f.endsAt != null ? f.endsAt - now : f.remaining;
  const preset = FOCUS_PRESETS[f.preset] ?? FOCUS_PRESETS[0];
  const total = (f.phase === "focus" ? preset.focus : preset.rest) * 60_000;
  const pct = Math.min(1, Math.max(0, 1 - remaining / total));
  const sessionsToday = f.day === dayKey() ? f.sessions : 0;

  // Show the countdown in the tab title while it runs.
  useEffect(() => {
    const base = "TabOS — New Tab";
    if (!f.running) {
      document.title = base;
      return;
    }
    document.title = `${fmt(remaining)} · ${f.phase === "focus" ? "Focus" : "Break"} — TabOS`;
  }, [f.running, f.phase, remaining]);
  useEffect(() => () => void (document.title = "TabOS — New Tab"), []);

  const R = 68;
  const C = 2 * Math.PI * R;

  return (
    <GlassCard className="p-5 h-full flex flex-col items-center justify-between gap-2">
      <div className="w-full flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-white/40">
          {f.phase === "focus" ? "Focus" : "Break"}
        </div>
        <div className="flex items-center gap-1">
          {FOCUS_PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => f.setPreset(i)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition ${f.preset === i ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"}`}
              title={`${p.focus} min focus, ${p.rest} min break`}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setSound(!sound)}
            className="h-6 w-6 grid place-items-center rounded-full text-white/45 hover:text-white hover:bg-white/10"
            aria-label={sound ? "Mute end-of-session sound" : "Play a sound when a session ends"}
            title={sound ? "Sound on" : "Sound off"}
          >
            {sound ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          </button>
        </div>
      </div>
      <div className={`relative ${f.running ? "animate-breath" : ""}`}>
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <circle
            cx="80"
            cy="80"
            r={R}
            stroke={f.phase === "focus" ? "url(#pomo-grad)" : "rgba(52,211,153,0.85)"}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.5s linear" }}
          />
          <defs>
            <linearGradient id="pomo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ws-accent)" />
              <stop offset="100%" stopColor="var(--ws-accent-2)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-mono text-3xl tabular-nums font-semibold">{fmt(remaining)}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
              {sessionsToday > 0 ? `${sessionsToday} done today` : f.phase === "focus" ? "ready" : "breathe"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => (f.running ? f.pause() : f.start())}
          className="h-11 w-11 grid place-items-center rounded-full text-white accent-glow"
          style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          aria-label={f.running ? "Pause" : "Start"}
        >
          {f.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <button
          onClick={f.reset}
          className="h-11 w-11 grid place-items-center rounded-full glass-subtle hover:bg-white/10 transition"
          aria-label="Reset"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={f.skip}
          className="h-11 w-11 grid place-items-center rounded-full glass-subtle hover:bg-white/10 transition"
          aria-label={f.phase === "focus" ? "Skip to break" : "Skip break"}
          title={f.phase === "focus" ? "Skip to break" : "Skip break"}
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </GlassCard>
  );
}
