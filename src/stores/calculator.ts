import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CalcEntry = { expr: string; result: string; at: number };

type State = {
  history: CalcEntry[];
  push: (expr: string, result: string) => void;
  clear: () => void;
};

export const useCalculatorStore = create<State>()(
  persist(
    (set) => ({
      history: [],
      push: (expr, result) =>
        set((s) => ({ history: [{ expr, result, at: Date.now() }, ...s.history].slice(0, 12) })),
      clear: () => set({ history: [] }),
    }),
    { name: "tabos-calculator" },
  ),
);
