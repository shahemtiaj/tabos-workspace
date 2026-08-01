import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SearchEngine = "google" | "duckduckgo" | "brave" | "bing";
export type LocationMode = "auto" | "manual";
export type FontFamily = "poppins" | "space-grotesk" | "inter" | "system";

export const FONT_STACKS: Record<FontFamily, string> = {
  poppins: '"Poppins", ui-sans-serif, system-ui, sans-serif',
  "space-grotesk": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  system:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

type State = {
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
      userName: "User",
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
      locationMode: "auto",
      manualCity: "",
      manualLat: null,
      manualLon: null,
      tempUnit: "c",
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
    { name: "tabos-settings" },
  ),
);
