import { useEffect, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { searchCities, placeFromIp, type CityResult } from "@/lib/weather";
import { useSettingsStore } from "@/stores/settings";

/**
 * Weather location chooser: search a city, use the approximate area from the
 * IP address, or switch weather off. Used in first-run setup and Settings.
 */
export function LocationPicker({ compact = false }: { compact?: boolean }) {
  const { locationMode, manualCity, setPlace, setLocationMode } = useSettingsStore();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(() => {
      searchCities(query)
        .then((r) => {
          if (cancelled) return;
          setResults(r);
          setNote(r.length ? null : "No city found");
        })
        .catch(() => !cancelled && setNote("Search unavailable — check your connection"))
        .finally(() => !cancelled && setBusy(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const useArea = async () => {
    setLocationMode("auto");
    setNote(null);
    try {
      const p = await placeFromIp(true);
      setNote(`Found: ${p.name}`);
    } catch {
      setNote("Couldn't find your area — search for your city instead");
    }
  };

  const current =
    locationMode === "manual" && manualCity
      ? manualCity
      : locationMode === "auto"
        ? "Approximate area (from your internet connection)"
        : "Weather is off";

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="text-xs text-white/55 flex items-center gap-1.5">
          <MapPin className="h-3 w-3" /> {current}
        </div>
      )}
      <div className="glass-subtle flex items-center gap-2 rounded-full pl-3 pr-2 py-1.5">
        <Search className="h-3.5 w-3.5 text-white/50 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your city…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-white/35"
          aria-label="Search city"
        />
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50" />}
      </div>
      {results.length > 0 && (
        <ul className="glass-subtle rounded-2xl p-1 max-h-48 overflow-y-auto">
          {results.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button
                type="button"
                onClick={() => {
                  setPlace({ name: r.name, lat: Number(r.lat.toFixed(4)), lon: Number(r.lon.toFixed(4)) });
                  setQ("");
                  setResults([]);
                  setNote(`Weather set to ${r.name}`);
                }}
                className="w-full text-left rounded-xl px-3 py-1.5 hover:bg-white/10"
              >
                <span className="text-sm text-white/90">{r.name}</span>
                {r.detail && <span className="text-[11px] text-white/45"> · {r.detail}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useArea}
          className={`rounded-full px-3 py-1.5 text-xs hover:bg-white/10 ${locationMode === "auto" ? "bg-white/15 text-white" : "glass-subtle text-white/70"}`}
        >
          Use my approximate area
        </button>
        <button
          type="button"
          onClick={() => {
            setLocationMode("off");
            setNote(null);
          }}
          className={`rounded-full px-3 py-1.5 text-xs hover:bg-white/10 ${locationMode === "off" ? "bg-white/15 text-white" : "glass-subtle text-white/70"}`}
        >
          No weather
        </button>
      </div>
      {note && <p className="text-[11px] text-white/55">{note}</p>}
    </div>
  );
}
