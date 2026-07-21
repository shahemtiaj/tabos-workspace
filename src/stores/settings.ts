import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SearchEngine = "google" | "duckduckgo" | "brave" | "bing";

type State = {
  userName: string;
  searchEngine: SearchEngine;
  clockSeconds: boolean;
  clock24h: boolean;
  glassBlur: number; // px
  glassIntensity: number; // 0-100 (alpha percentage of white)
  radius: number; // px for panels
  setUserName: (v: string) => void;
  setSearchEngine: (v: SearchEngine) => void;
  setClockSeconds: (v: boolean) => void;
  setClock24h: (v: boolean) => void;
  setGlassBlur: (v: number) => void;
  setGlassIntensity: (v: number) => void;
  setRadius: (v: number) => void;
};

export const useSettingsStore = create<State>()(
  persist(
    (set) => ({
      userName: "Shah",
      searchEngine: "google",
      clockSeconds: false,
      clock24h: false,
      glassBlur: 28,
      glassIntensity: 6,
      radius: 28,
      setUserName: (userName) => set({ userName }),
      setSearchEngine: (searchEngine) => set({ searchEngine }),
      setClockSeconds: (clockSeconds) => set({ clockSeconds }),
      setClock24h: (clock24h) => set({ clock24h }),
      setGlassBlur: (glassBlur) => set({ glassBlur }),
      setGlassIntensity: (glassIntensity) => set({ glassIntensity }),
      setRadius: (radius) => set({ radius }),
    }),
    { name: "tabos-settings" },
  ),
);
