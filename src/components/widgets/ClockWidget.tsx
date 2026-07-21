import { useClock, formatTime } from "@/hooks/useClock";
import { useSettingsStore } from "@/stores/settings";
import { useHydrated } from "@/hooks/useHydrated";
import { GlassCard } from "@/components/glass/GlassPanel";

export function ClockWidget() {
  const hydrated = useHydrated();
  const now = useClock();
  const { clockSeconds, clock24h } = useSettingsStore();

  return (
    <GlassCard className="p-6 h-full flex flex-col justify-between">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Local Time</div>
      <div className="flex flex-col items-start">
        <div
          className="font-mono tabular-nums text-5xl md:text-6xl font-semibold text-gradient leading-none"
          style={{ letterSpacing: "-0.02em" }}
        >
          {hydrated && now ? formatTime(now, { seconds: clockSeconds, h24: clock24h }) : "--:--"}
        </div>
        <div className="mt-3 text-sm text-white/60">
          {hydrated && now
            ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
            : ""}
        </div>
      </div>
    </GlassCard>
  );
}
