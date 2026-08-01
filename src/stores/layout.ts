import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

export type WidgetId =
  // core
  | "search"
  | "bookmarks"
  | "clock"
  | "weather"
  | "pomodoro"
  | "todos"
  | "consistency"
  | "notes"
  | "activity"
  // optional
  | "worldClocks"
  | "quote"
  | "scratchpad"
  | "heatmap"
  | "countdown"
  | "calculator"
  | "ambient"
  | "readLater"
  | "water";

export type Tile = { col: number; row: number };

export const MIN_COL = 2;
export const MAX_COL = 12;
export const MIN_ROW = 1;
export const MAX_ROW = 6;

// Default sizes (col of 12, row units of ~140px)
const defaults: Record<WidgetId, Tile> = {
  search: { col: 12, row: 1 },
  bookmarks: { col: 8, row: 2 },
  clock: { col: 4, row: 1 },
  weather: { col: 4, row: 1 },
  pomodoro: { col: 4, row: 2 },
  todos: { col: 4, row: 2 },
  consistency: { col: 4, row: 2 },
  notes: { col: 6, row: 2 },
  activity: { col: 6, row: 2 },
  worldClocks: { col: 6, row: 1 },
  quote: { col: 6, row: 1 },
  scratchpad: { col: 4, row: 2 },
  heatmap: { col: 8, row: 2 },
  countdown: { col: 4, row: 2 },
  calculator: { col: 4, row: 2 },
  ambient: { col: 4, row: 1 },
  readLater: { col: 5, row: 2 },
  water: { col: 4, row: 2 },
};

// Which widgets are enabled/visible by default
const defaultEnabled: Record<WidgetId, boolean> = {
  search: true,
  bookmarks: true,
  clock: true,
  weather: true,
  pomodoro: true,
  todos: true,
  consistency: true,
  notes: true,
  activity: true,
  calculator: true,
  worldClocks: false,
  quote: false,
  scratchpad: false,
  heatmap: false,
  countdown: false,
  ambient: false,
  readLater: false,
  water: false,
};

// Widgets that cannot be hidden
export const MANDATORY_WIDGETS: WidgetId[] = ["search"];

export const OPTIONAL_WIDGETS: WidgetId[] = [
  "worldClocks",
  "quote",
  "scratchpad",
  "heatmap",
  "countdown",
  "ambient",
  "readLater",
  "water",
];


type State = {
  tiles: Record<WidgetId, Tile>;
  enabled: Record<WidgetId, boolean>;
  editMode: boolean;
  setTile: (id: WidgetId, tile: Tile) => void;
  toggleEnabled: (id: WidgetId) => void;
  setEnabled: (id: WidgetId, v: boolean) => void;
  setEditMode: (v: boolean) => void;
  reset: () => void;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Migrate legacy persisted shape { sizes, hidden }
const storage: PersistStorage<State> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const st = parsed?.state ?? {};
      if (st.tiles && st.enabled) return parsed;
      // migrate
      const SIZE_SPANS: Record<string, Tile> = {
        sm: { col: 4, row: 1 },
        md: { col: 4, row: 2 },
        lg: { col: 6, row: 2 },
        xl: { col: 8, row: 2 },
        full: { col: 12, row: 2 },
      };
      const tiles = { ...defaults };
      if (st.sizes) {
        for (const k of Object.keys(st.sizes)) {
          const span = SIZE_SPANS[st.sizes[k]];
          if (span && k in tiles) (tiles as any)[k] = span;
        }
      }
      const enabled = { ...defaultEnabled };
      if (st.hidden) {
        for (const k of Object.keys(st.hidden)) {
          if (k in enabled) (enabled as any)[k] = !st.hidden[k];
        }
      }
      return { state: { ...st, tiles, enabled, editMode: false }, version: parsed.version };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(name);
  },
};

export const useLayoutStore = create<State>()(
  persist(
    (set) => ({
      tiles: defaults,
      enabled: defaultEnabled,
      editMode: false,
      setTile: (id, tile) =>
        set((s) => ({
          tiles: {
            ...s.tiles,
            [id]: {
              col: clamp(tile.col, MIN_COL, MAX_COL),
              row: clamp(tile.row, MIN_ROW, MAX_ROW),
            },
          },
        })),
      toggleEnabled: (id) =>
        set((s) =>
          MANDATORY_WIDGETS.includes(id)
            ? s
            : { enabled: { ...s.enabled, [id]: !s.enabled[id] } },
        ),
      setEnabled: (id, v) =>
        set((s) =>
          MANDATORY_WIDGETS.includes(id) ? s : { enabled: { ...s.enabled, [id]: v } },
        ),
      setEditMode: (editMode) => set({ editMode }),
      reset: () => set({ tiles: defaults, enabled: defaultEnabled }),
    }),
    {
      name: "tabos-layout-v2",
      storage,
      version: 2,
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<State>;
        // v2: calculator promoted to a core widget — enable it for existing users
        if (version < 2) {
          return {
            ...p,
            enabled: { ...(p.enabled ?? {}), calculator: true },
            tiles: { ...(p.tiles ?? {}), calculator: defaults.calculator },
          } as State;
        }
        return p as State;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        const enabled = { ...defaultEnabled, ...(p.enabled ?? {}) };
        for (const m of MANDATORY_WIDGETS) enabled[m] = true;
        return {
          ...current,
          ...p,
          tiles: { ...defaults, ...(p.tiles ?? {}) },
          enabled,
        };
      },
    },

  ),
);
