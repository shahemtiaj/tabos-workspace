import { useEffect, useState } from "react";
import { Cloud, MapPin } from "lucide-react";
import { GlassCard } from "@/components/glass/GlassPanel";
import { isExtension } from "@/lib/env";

type Weather = { temp: number; code: number; city: string };

const codeToLabel = (c: number) => {
  if (c === 0) return "Clear";
  if (c < 3) return "Partly Cloudy";
  if (c < 50) return "Cloudy";
  if (c < 70) return "Rain";
  if (c < 80) return "Snow";
  return "Storm";
};

export function WeatherWidget() {
  const [w, setW] = useState<Weather | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (lat: number, lon: number, city: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`,
        );
        const j = await res.json();
        if (cancelled) return;
        setW({ temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, city });
      } catch {
        if (!cancelled) setErr("Unavailable");
      }
    };
    if (!navigator.geolocation) {
      load(37.77, -122.42, "San Francisco");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => load(pos.coords.latitude, pos.coords.longitude, "Your location"),
      () => load(37.77, -122.42, "San Francisco"),
      { timeout: 4000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GlassCard className="p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Weather</div>
        <Cloud className="h-4 w-4 text-white/40" />
      </div>
      {err ? (
        <div className="text-sm text-white/50">{err}</div>
      ) : w ? (
        <div>
          <div className="text-5xl font-semibold tabular-nums text-white">{w.temp}°</div>
          <div className="text-sm text-white/70 mt-1">{codeToLabel(w.code)}</div>
          <div className="mt-2 text-xs text-white/50 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {w.city}
          </div>
        </div>
      ) : (
        <div className="text-white/40 text-sm">Loading…</div>
      )}
    </GlassCard>
  );
}
