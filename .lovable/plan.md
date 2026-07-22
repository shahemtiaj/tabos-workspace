## Goal
Replace hover-based resize with a global **Edit Mode** (toggled via a pencil icon in the TopBar). In edit mode, every tile becomes freely resizable via drag handles on the corners/edges — not just fixed S/M/L presets. Add a curated set of **optional widgets** togglable from Settings.

## 1. New Edit Mode UX

- Add a `Pencil` (Edit) icon in `TopBar` and `ExtTopBar`, next to Settings.
- Toggling it flips `useLayoutStore.editMode`.
- When ON:
  - A soft dashed outline appears around every tile.
  - Tiles show a **drag-resize handle** at the bottom-right corner (and right + bottom edges).
  - Tiles show a Hide (eye-off) button top-right.
  - A floating bottom bar appears: "Editing layout — Reset · Done".
- When OFF: clean view, no handles, hidden tiles disappear.

Hover-only resize buttons removed.

## 2. Free Resize System

Replace the 5 fixed sizes with a **grid span pair** stored per widget:

```ts
tiles: Record<WidgetId, { col: number; row: number }>  // col 2–12, row 1–4
```

Implementation:
- Pointer-drag on the SE handle updates `{col, row}` live.
- Snap to the 12-col grid: `col = clamp(round(pxDelta / cellWidth) + startCol, 2, 12)`.
- `row = clamp(round(pyDelta / rowHeight) + startRow, 1, 4)`.
- Uses `PointerEvent` capture; writes to store on drag-end (throttled during drag via local state to keep it 60fps).
- Migration: map old `TileSize` → `{col,row}` via existing `SIZE_SPANS`.

Keyboard: arrow keys on a focused tile in edit mode adjust span by 1.

## 3. Optional Widgets (togglable in Settings)

Curated additions worth building — all fit the productivity-OS theme:

| Widget | What it does |
|---|---|
| **Quick Launcher** | Cmd/Ctrl-K style command palette pinned as a tile |
| **World Clocks** | Multi-timezone strip (add cities) |
| **Calendar Peek** | Month grid, click day to jot a note |
| **Habit Heatmap** | GitHub-style 90-day heatmap from consistency store |
| **Quote of the Day** | Rotating quotes, refresh button |
| **Crypto/Stocks Ticker** | Free API (CoinGecko), configurable symbols |
| **Currency Converter** | Small utility using exchangerate.host |
| **RSS Reader** | Latest 5 items from a user RSS URL |
| **Scratchpad** | Ephemeral fast-notes (separate from Notes) |
| **Music/Ambient** | Lofi/rain player with volume |

Ship first pass: **World Clocks, Quote of the Day, Scratchpad, Habit Heatmap** (no external keys, no network flakiness). Others listed as "Coming soon" toggles.

## 4. Settings additions

New "Widgets" section in `SettingsSheet`:
- List of all widgets (core + optional) with an on/off switch and a size readout.
- "Reset layout" button.
- Removes the per-widget size dropdown (edit mode handles that now).

## 5. Files to touch

- `src/stores/layout.ts` — rewrite: `tiles: {col,row}`, add `setTile`, keep `hidden`, `editMode`, migration from old shape.
- `src/components/shell/ResizableTile.tsx` — swap span logic; add drag handle + edit outline; remove hover cycle button.
- `src/components/shell/TopBar.tsx` + `extension-src/ExtTopBar.tsx` — add Edit pencil button.
- `src/components/shell/EditModeBar.tsx` (new) — floating "Done / Reset" bar.
- `src/components/shell/SettingsSheet.tsx` — new Widgets section, remove size dropdowns.
- New widgets under `src/components/widgets/`: `WorldClocksWidget.tsx`, `QuoteWidget.tsx`, `ScratchpadWidget.tsx`, `HabitHeatmapWidget.tsx`.
- `src/routes/index.tsx` + `extension-src/App.tsx` — render optional widgets conditionally from layout store.
- Rebuild extension zip via `scripts/build-extension.sh`.

## 6. Out of scope (for this pass)

- Free X/Y positioning (drag-to-move). Grid-flow order stays automatic; only span is user-controlled. Can add later if wanted.
- External-API widgets (crypto, RSS, weather-radar).