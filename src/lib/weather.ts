// Weather and location, with caching.
//
// A new-tab page opens dozens of times a day. Location is looked up at most
// once a day and the forecast at most every 30 minutes; the last result is
// shown immediately (and offline) while a fresh one loads.

export type Place = { lat: number; lon: number; name: string };
export type WeatherNow = {
  temp: number;
  feels: number;
  high: number;
  low: number;
  code: number;
  isDay: boolean;
  place: string;
  at: number; // when it was fetched
};

const WEATHER_KEY = "tabos-weather-cache";
const PLACE_KEY = "tabos-place-cache";
const WEATHER_TTL = 30 * 60 * 1000;
const PLACE_TTL = 24 * 60 * 60 * 1000;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — caching is optional */
  }
}

async function getJson(url: string, timeoutMs = 8000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Approximate location from the IP address (city level). Cached for a day. */
export async function placeFromIp(force = false): Promise<Place> {
  const cached = read<Place & { at: number }>(PLACE_KEY);
  if (!force && cached && Date.now() - cached.at < PLACE_TTL) return cached;
  const d = await getJson("https://get.geojs.io/v1/ip/geo.json");
  const lat = parseFloat(d.latitude);
  const lon = parseFloat(d.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("no location");
  const place = { lat, lon, name: d.city || d.region || d.country || "Your area" };
  write(PLACE_KEY, { ...place, at: Date.now() });
  return place;
}

export type CityResult = Place & { detail: string };

/** City search for the location picker (Open-Meteo geocoding). */
export async function searchCities(query: string): Promise<CityResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const d = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&format=json`,
  );
  return (d.results ?? []).map((r: Record<string, unknown>) => ({
    lat: Number(r.latitude),
    lon: Number(r.longitude),
    name: String(r.name),
    detail: [r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

export function cachedWeather(): WeatherNow | null {
  return read<WeatherNow & { key: string }>(WEATHER_KEY);
}

export async function fetchWeather(place: Place, unit: "c" | "f", force = false): Promise<WeatherNow> {
  const key = `${place.lat.toFixed(2)},${place.lon.toFixed(2)},${unit}`;
  const cached = read<WeatherNow & { key: string }>(WEATHER_KEY);
  if (!force && cached && cached.key === key && Date.now() - cached.at < WEATHER_TTL) return cached;
  const u = unit === "f" ? "fahrenheit" : "celsius";
  const d = await getJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,is_day` +
      `&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto&temperature_unit=${u}`,
  );
  const w: WeatherNow & { key: string } = {
    key,
    temp: Math.round(d.current.temperature_2m),
    feels: Math.round(d.current.apparent_temperature),
    high: Math.round(d.daily.temperature_2m_max[0]),
    low: Math.round(d.daily.temperature_2m_min[0]),
    code: Number(d.current.weather_code),
    isDay: d.current.is_day === 1,
    place: place.name,
    at: Date.now(),
  };
  write(WEATHER_KEY, w);
  return w;
}

export type Condition = "clear" | "partly" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm";

/** WMO weather interpretation codes, as used by Open-Meteo. */
export function describe(code: number): { label: string; kind: Condition } {
  if (code === 0) return { label: "Clear", kind: "clear" };
  if (code === 1) return { label: "Mostly clear", kind: "partly" };
  if (code === 2) return { label: "Partly cloudy", kind: "partly" };
  if (code === 3) return { label: "Overcast", kind: "cloudy" };
  if (code === 45 || code === 48) return { label: "Fog", kind: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", kind: "drizzle" };
  if (code >= 61 && code <= 67) return { label: code >= 66 ? "Freezing rain" : "Rain", kind: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", kind: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", kind: "rain" };
  if (code === 85 || code === 86) return { label: "Snow showers", kind: "snow" };
  if (code >= 95) return { label: "Thunderstorm", kind: "storm" };
  return { label: "Cloudy", kind: "cloudy" };
}

export function ago(at: number): string {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
