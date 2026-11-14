import { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudMoon,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
} from "lucide-react";
import { GlassCard } from "@/components/glass/GlassPanel";
import { OPEN_SETTINGS_EVENT } from "@/components/shell/CommandPalette";
import { useSettingsStore } from "@/stores/settings";
import {
  ago,
  cachedWeather,
  describe,
  fetchWeather,
  placeFromIp,
  searchCities,
  type Condition,
  type Place,
  type WeatherNow,
} from "@/lib/weather";

function WeatherIcon({ kind, isDay }: { kind: Condition; isDay: boolean }) {
  const cls = "h-10 w-10 text-white/85";
  switch (kind) {
    case "clear":
      return isDay ? <Sun className={`${cls} wx-spin text-amber-200`} /> : <Moon className={`${cls} wx-float`} />;
    case "partly":
      return isDay ? <CloudSun className={`${cls} wx-float`} /> : <CloudMoon className={`${cls} wx-float`} />;
    case "fog":
      return <CloudFog className={`${cls} wx-float`} />;
    case "drizzle":
      return <CloudDrizzle className={`${cls} wx-rain`} />;
    case "rain":
      return <CloudRain className={`${cls} wx-rain`} />;
    case "snow":
      return <CloudSnow className={`${cls} wx-float`} />;
    case "storm":
      return <CloudLightning className={`${cls} wx-flash`} />;
    default:
      return <Cloud className={`${cls} wx-float`} />;
  }
}

const openSettings = () => window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));

export function WeatherWidget() {
  const { locationMode, manualCity, manualLat, manualLon, tempUnit, setLocationMode } = useSettingsStore();
  // Show the last known weather straight away; refresh in the background.
  const [w, setW] = useState<WeatherNow | null>(() => (locationMode === "off" ? null : cachedWeather()));
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (locationMode === "off") {
      setW(null);
      setErr(null);
      return;
    }
    let cancelled = false;
    const force = refreshKey > 0;
    setErr(null);
    setLoading(true);

    (async () => {
      let place: Place;
      if (locationMode === "manual") {
        if (manualLat != null && manualLon != null) {
          place = { lat: manualLat, lon: manualLon, name: manualCity || "Your city" };
        } else if (manualCity.trim()) {
          const [hit] = await searchCities(manualCity);
          if (!hit) throw new Error("city");
          place = hit;
        } else {
          throw new Error("city");
        }
      } else {
        place = await placeFromIp(force);
      }
      const now = await fetchWeather(place, tempUnit, force);
      if (!cancelled) setW(now);
    })()
      .catch((e: Error) => {
        if (cancelled) return;
        // Never guess a place: say what went wrong and keep any last result.
        if (e.message === "city") setErr("City not found");
        else if (locationMode === "auto" && !navigator.onLine) setErr("Offline");
        else setErr(locationMode === "auto" ? "Couldn't find your location" : "Weather unavailable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locationMode, manualCity, manualLat, manualLon, tempUnit, refreshKey]);

  const header = (
    <div className="flex items-center justify-between">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Weather</div>
      {locationMode !== "off" && (
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="h-6 w-6 grid place-items-center rounded-full text-white/40 hover:text-white hover:bg-white/10"
          aria-label="Refresh weather"
          title={w ? `Updated ${ago(w.at)}` : "Refresh"}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );

  if (locationMode === "off") {
    return (
      <GlassCard className="p-5 h-full flex flex-col justify-between gap-3">
        {header}
        <p className="text-sm text-white/60">Show the weather for where you are.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openSettings}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
            style={{ background: "linear-gradient(135deg, var(--ws-accent), var(--ws-accent-2))" }}
          >
            Choose city
          </button>
          <button
            type="button"
            onClick={() => setLocationMode("auto")}
            className="glass-subtle rounded-full px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
            title="Uses your IP address to find your approximate city"
          >
            Use my area
          </button>
        </div>
      </GlassCard>
    );
  }

  const d = w ? describe(w.code) : null;
  return (
    <GlassCard className="p-5 h-full flex flex-col justify-between gap-2">
      {header}
      {w && d ? (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-5xl font-semibold tabular-nums text-white">
              {w.temp}°<span className="text-2xl text-white/60">{tempUnit.toUpperCase()}</span>
            </div>
            <div className="text-sm text-white/75 mt-1">{d.label}</div>
            <div className="text-[11px] text-white/45 mt-0.5 tabular-nums">
              H {w.high}° · L {w.low}° · Feels {w.feels}°
            </div>
            <button
              type="button"
              onClick={openSettings}
              className="mt-2 text-xs text-white/50 hover:text-white/80 flex items-center gap-1 max-w-full"
              title="Change location"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{w.place}</span>
              {err && <span className="text-amber-200/70 shrink-0">· {ago(w.at)}</span>}
            </button>
          </div>
          <WeatherIcon kind={d.kind} isDay={w.isDay} />
        </div>
      ) : err ? (
        <div className="flex flex-col gap-2 items-start">
          <div className="text-sm text-white/60">{err}</div>
          <button
            type="button"
            onClick={openSettings}
            className="glass-subtle rounded-full px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
          >
            Choose city
          </button>
        </div>
      ) : (
        <div className="text-white/40 text-sm">Loading…</div>
      )}
    </GlassCard>
  );
}
