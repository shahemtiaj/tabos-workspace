import { create } from "zustand";
import { persist } from "zustand/middleware";
import { syncAcrossTabs } from "@/lib/crossTab";

export type SearchEngine = "google" | "duckduckgo" | "brave" | "bing";
// off: no weather requests at all. auto: city-level location from the IP
// address. manual: a city the user picked.
export type LocationMode = "off" | "auto" | "manual";
export type FontFamily = "poppins" | "space-grotesk" | "inter" | "system";

export const FONT_STACKS: Record<FontFamily, string> = {
  poppins: '"Poppins", ui-sans-serif, system-ui, sans-serif',
  "space-grotesk": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  system:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

type State = {
  onboarded: boolean;
  userName: string;
  searchEngine: SearchEngine;
  clockSeconds: boolean;
  clock24h: boolean;
  glassBlur: number;
  glassIntensity: number;
  radius: number;
  fontFamily: FontFamily;
  uiScale: number; // 80 - 130 (%)
  bgDim: number; // 0 - 60 (% overlay opacity)
  recentSearchLimit: number; // 0 - 10 recent search suggestions
  // Location
  locationMode: LocationMode;
  manualCity: string;
  manualLat: number | null;
  manualLon: number | null;
  tempUnit: "c" | "f";
  focusSound: boolean;
  setOnboarded: (v: boolean) => void;
  setPlace: (p: { name: string; lat: number; lon: number }) => void;
  setFocusSound: (v: boolean) => void;
  setUserName: (v: string) => void;
  setSearchEngine: (v: SearchEngine) => void;
  setClockSeconds: (v: boolean) => void;
  setClock24h: (v: boolean) => void;
  setGlassBlur: (v: number) => void;
  setGlassIntensity: (v: number) => void;
  setRadius: (v: number) => void;
  setFontFamily: (v: FontFamily) => void;
  setUiScale: (v: number) => void;
  setBgDim: (v: number) => void;
  setRecentSearchLimit: (v: number) => void;
  setLocationMode: (v: LocationMode) => void;
  setManualCity: (v: string) => void;
  setManualLat: (v: number | null) => void;
  setManualLon: (v: number | null) => void;
  setTempUnit: (v: "c" | "f") => void;
};

export const useSettingsStore = create<State>()(
  persist(
    (set) => ({
      onboarded: false,
      userName: "",
      searchEngine: "google",
      clockSeconds: false,
      clock24h: false,
      glassBlur: 28,
      glassIntensity: 6,
      radius: 28,
      fontFamily: "poppins",
      uiScale: 100,
      bgDim: 0,
      recentSearchLimit: 5,
      locationMode: "off",
      manualCity: "",
      manualLat: null,
      manualLon: null,
      tempUnit: "c",
      focusSound: true,
      setOnboarded: (onboarded) => set({ onboarded }),
      setPlace: (p) => set({ locationMode: "manual", manualCity: p.name, manualLat: p.lat, manualLon: p.lon }),
      setFocusSound: (focusSound) => set({ focusSound }),
      setUserName: (userName) => set({ userName }),
      setSearchEngine: (searchEngine) => set({ searchEngine }),
      setClockSeconds: (clockSeconds) => set({ clockSeconds }),
      setClock24h: (clock24h) => set({ clock24h }),
      setGlassBlur: (glassBlur) => set({ glassBlur }),
      setGlassIntensity: (glassIntensity) => set({ glassIntensity }),
      setRadius: (radius) => set({ radius }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setUiScale: (uiScale) => set({ uiScale }),
      setBgDim: (bgDim) => set({ bgDim }),
      setRecentSearchLimit: (recentSearchLimit) => set({ recentSearchLimit }),
      setLocationMode: (locationMode) => set({ locationMode }),
      setManualCity: (manualCity) => set({ manualCity }),
      setManualLat: (manualLat) => set({ manualLat }),
      setManualLon: (manualLon) => set({ manualLon }),
      setTempUnit: (tempUnit) => set({ tempUnit }),
    }),
    {
      name: "tabos-settings",
      version: 1,
      // Settings saved by v1.2 and earlier: that person has used TabOS already,
      // so skip the first-run setup and keep the location choice they had.
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<State>;
        if (version < 1) return { ...p, onboarded: true, userName: p.userName === "User" ? "" : p.userName } as State;
        return p as State;
      },
    },
  ),
);

syncAcrossTabs(useSettingsStore);
