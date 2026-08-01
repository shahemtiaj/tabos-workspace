import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentSearch = { q: string; at: number };

type State = {
  recent: RecentSearch[];
  push: (q: string) => void;
  remove: (q: string) => void;
  clear: () => void;
};

export const useSearchStore = create<State>()(
  persist(
    (set) => ({
      recent: [],
      push: (q) =>
        set((s) => {
          const query = q.trim();
          if (!query) return s;
          const rest = s.recent.filter((r) => r.q.toLowerCase() !== query.toLowerCase());
          return { recent: [{ q: query, at: Date.now() }, ...rest].slice(0, 30) };
        }),
      remove: (q) => set((s) => ({ recent: s.recent.filter((r) => r.q !== q) })),
      clear: () => set({ recent: [] }),
    }),
    { name: "tabos-search-history" },
  ),
);
