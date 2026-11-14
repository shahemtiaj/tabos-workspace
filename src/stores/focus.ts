import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncAcrossTabs } from "@/lib/crossTab";
import { dayKey } from "@/stores/consistency";

// The focus timer stores *when* the current phase ends rather than counting
// seconds down. That keeps it exact while the tab is in the background
// (Chrome slows timers there), lets every open new tab show the same timer,
// and lets it carry on after the tab that started it is closed.

export type Phase = "focus" | "break";

export const FOCUS_PRESETS = [
  { label: "25 / 5", focus: 25, rest: 5 },
  { label: "50 / 10", focus: 50, rest: 10 },
  { label: "15 / 3", focus: 15, rest: 3 },
] as const;

const MIN = 60_000;
const DONE_KEY = "tabos-focus-last-done";

type State = {
  preset: number;
  phase: Phase;
  running: boolean;
  endsAt: number | null; // while running
  remaining: number; // ms, while paused or stopped
  day: string;
  sessions: number; // focus sessions finished today
  setPreset: (i: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  /**
   * Moves on when the running phase has ended. Returns what finished, or null
   * if nothing did (or another tab already handled it).
   */
  settle: (now?: number) => { finished: Phase; late: boolean } | null;
};

const lengthOf = (preset: number, phase: Phase) => {
  const p = FOCUS_PRESETS[preset] ?? FOCUS_PRESETS[0];
  return (phase === "focus" ? p.focus : p.rest) * MIN;
};

export const useFocusStore = create<State>()(
  persist(
    (set, get) => ({
      preset: 0,
      phase: "focus",
      running: false,
      endsAt: null,
      remaining: lengthOf(0, "focus"),
      day: dayKey(),
      sessions: 0,
      setPreset: (preset) =>
        set({ preset, phase: "focus", running: false, endsAt: null, remaining: lengthOf(preset, "focus") }),
      start: () => {
        const s = get();
        if (s.running) return;
        set({ running: true, endsAt: Date.now() + s.remaining });
      },
      pause: () => {
        const s = get();
        if (!s.running || s.endsAt == null) return;
        set({ running: false, remaining: Math.max(0, s.endsAt - Date.now()), endsAt: null });
      },
      reset: () => {
        const s = get();
        set({ phase: "focus", running: false, endsAt: null, remaining: lengthOf(s.preset, "focus") });
      },
      skip: () => {
        const s = get();
        const phase: Phase = s.phase === "focus" ? "break" : "focus";
        set({ phase, running: false, endsAt: null, remaining: lengthOf(s.preset, phase) });
      },
      settle: (now = Date.now()) => {
        const s = get();
        if (!s.running || s.endsAt == null || now < s.endsAt) return null;
        // Several tabs may notice the same ending; only the first one acts.
        try {
          if (localStorage.getItem(DONE_KEY) === String(s.endsAt)) return null;
          localStorage.setItem(DONE_KEY, String(s.endsAt));
        } catch {
          /* storage blocked: act anyway */
        }
        const late = now - s.endsAt > 60_000;
        const today = dayKey(new Date(now));
        const sessions = (s.day === today ? s.sessions : 0) + (s.phase === "focus" ? 1 : 0);
        if (s.phase === "focus") {
          // The break starts straight away, counted from when focus ended.
          const breakEnds = s.endsAt + lengthOf(s.preset, "break");
          if (breakEnds > now) {
            set({ phase: "break", running: true, endsAt: breakEnds, day: today, sessions });
          } else {
            // The break also ended while no tab was open.
            set({ phase: "focus", running: false, endsAt: null, remaining: lengthOf(s.preset, "focus"), day: today, sessions });
          }
          return { finished: "focus", late };
        }
        set({ phase: "focus", running: false, endsAt: null, remaining: lengthOf(s.preset, "focus"), day: today, sessions });
        return { finished: "break", late };
      },
    }),
    { name: "tabos-focus" },
  ),
);

syncAcrossTabs(useFocusStore);

/** A short two-note chime, generated (no audio files, works offline). */
export function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = [880, 1318.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1);
    });
    setTimeout(() => void ctx.close(), 1600);
  } catch {
    /* audio unavailable */
  }
}
