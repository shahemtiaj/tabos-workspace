import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WidgetId =
  | "bookmarks"
  | "clock"
  | "weather"
  | "pomodoro"
  | "todos"
  | "consistency"
  | "notes"
  | "activity";

export type TileSize = "sm" | "md" | "lg" | "xl" | "full";

export const SIZE_ORDER: TileSize[] = ["sm", "md", "lg", "xl", "full"];

export const SIZE_SPANS: Record<TileSize, { col: number; row: number }> = {
  sm: { col: 4, row: 1 },
  md: { col: 4, row: 2 },
  lg: { col: 6, row: 2 },
  xl: { col: 8, row: 2 },
  full: { col: 12, row: 2 },
};

const defaults: Record<WidgetId, TileSize> = {
  bookmarks: "xl",
  clock: "sm",
  weather: "sm",
  pomodoro: "md",
  todos: "md",
  consistency: "md",
  notes: "lg",
  activity: "lg",
};

type State = {
  sizes: Record<WidgetId, TileSize>;
  hidden: Partial<Record<WidgetId, boolean>>;
  editMode: boolean;
  setSize: (id: WidgetId, size: TileSize) => void;
  cycleSize: (id: WidgetId) => void;
  toggleHidden: (id: WidgetId) => void;
  setEditMode: (v: boolean) => void;
  reset: () => void;
};

export const useLayoutStore = create<State>()(
  persist(
    (set, get) => ({
      sizes: defaults,
      hidden: {},
      editMode: false,
      setSize: (id, size) => set((s) => ({ sizes: { ...s.sizes, [id]: size } })),
      cycleSize: (id) => {
        const cur = get().sizes[id] ?? "md";
        const next = SIZE_ORDER[(SIZE_ORDER.indexOf(cur) + 1) % SIZE_ORDER.length];
        set((s) => ({ sizes: { ...s.sizes, [id]: next } }));
      },
      toggleHidden: (id) =>
        set((s) => ({ hidden: { ...s.hidden, [id]: !s.hidden[id] } })),
      setEditMode: (editMode) => set({ editMode }),
      reset: () => set({ sizes: defaults, hidden: {} }),
    }),
    { name: "tabos-layout" },
  ),
);
