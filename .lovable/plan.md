# TabOS — Build Plan

A premium New Tab replacement styled as a native macOS + Material 3 hybrid. Built in parallel as (1) a fully interactive web app in Lovable for iteration and (2) an MV3 Chrome extension bundle that reuses the same React build.

## Design System

- **Palette (Midnight Indigo):** bg `#0a0a1a`, surface `#141432`, elevated `#1e1e5a`, accent `#4f46e5`. Glass tints derived per workspace via `color-mix`.
- **Typography:** Poppins (display/UI) + Space Grotesk (numerics/labels), loaded via `<link>` in `__root.tsx`.
- **Tokens (src/styles.css):** `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-saturation`, `--accent`, `--accent-glow`, `--radius-panel: 28px`, `--radius-card: 20px`, `--shadow-float`, `--shadow-inset`, `--motion-spring`, gradients for aurora/mesh backgrounds.
- **Primitives:** `<GlassPanel>`, `<GlassCard>`, `<FloatingBar>`, `<PillButton>`, `<AccentGlow>`, `<BentoCell>` — all consuming CSS vars so workspace tint cascades globally.
- **Motion:** Motion for React with spring presets (`stiffness: 260, damping: 26`), hover lift `translateY(-2px)+scale(1.01)`, panel entrance staggered fade+blur, workspace switch cross-fade with blur transition.

## Layout — Bento Grid

```text
┌───────────────────────────────────────────────────────────────┐
│  FloatingTopBar: greeting · clock · search · workspaces · ⚙︎ │
├───────────────────────────────────────────────────────────────┤
│  ┌──── Bookmarks (2x2 or 3x2) ────┐  ┌── Clock ──┐ ┌ Weather┐│
│  │                                 │  └───────────┘ └────────┘│
│  │                                 │  ┌── Pomodoro ──────────┐│
│  └─────────────────────────────────┘  └──────────────────────┘│
│  ┌─── Todos ────┐  ┌── Consistency ──┐  ┌── Quick Notes ────┐ │
│  └──────────────┘  └─────────────────┘  └───────────────────┘ │
│  ┌── Recent Activity ─────────────────────────────────────────┐│
│  └────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

Grid is CSS Grid `grid-template-areas` with breakpoints for 1080p / 1440p / 4K / ultrawide / laptop. Widgets are draggable cells (dnd-kit) with size variants (S/M/L).

## Folder Structure

```text
src/
  routes/
    __root.tsx              # fonts, providers, background aurora layer
    index.tsx               # NewTab surface (bento canvas)
    settings.tsx            # settings layout
    settings.index.tsx      # general
    settings.workspaces.tsx
    settings.widgets.tsx
    settings.appearance.tsx
  components/
    shell/       TopBar, WorkspaceSwitcher, CommandPalette, BackgroundLayer
    glass/       GlassPanel, GlassCard, FloatingBar, AccentGlow
    widgets/     Bookmarks/, Todos/, Consistency/, Clock/, Weather/,
                 Pomodoro/, Notes/, RecentActivity/, Search/
    bento/       BentoGrid, BentoCell, DragHandle, ResizeHandles
    ui/          shadcn primitives
  stores/        workspace.ts, todos.ts, consistency.ts, notes.ts,
                 pomodoro.ts, settings.ts, bookmarks.ts (Zustand + persist)
  lib/
    storage/     adapter.ts (chrome.storage.sync|local with localStorage fallback)
    workspaces/  presets.ts (Default/AI/Video/Design/Dev/Study/Business)
    bookmarks/   seed.ts, favicon.ts
    weather/     open-meteo client
    motion/      springs, easings
    search/      engines.ts
  hooks/         useWorkspace, useHydrated, useHotkeys, useClock, useDrag
  styles.css     tokens, @theme, @utility glass, @utility bento-cell
extension/       # MV3 build output
  manifest.json  # newtab override + chrome_url_overrides
  newtab.html
  assets/
```

## State Management

- **Zustand** with a pluggable persist middleware. The storage adapter chooses `chrome.storage.sync` (extension), `chrome.storage.local` (large blobs), or `localStorage` (web dev).
- Stores: `workspaceStore` (active id, list, per-ws overrides), `bookmarksStore` (per-workspace collections), `todosStore`, `consistencyStore` (streaks, heatmap), `notesStore`, `pomodoroStore`, `settingsStore` (glass intensity, blur, radius, font, motion).
- All render-visible reads from storage go through `useHydrated()` to avoid SSR mismatch.

## Workspace System

- Preset seed shipped in `lib/workspaces/presets.ts` — each preset defines `id`, `name`, `icon`, `accent`, `glassTint`, `wallpaper` (gradient or image), `widgets[]` (which widgets + sizes), `bookmarks[]`.
- Switching a workspace updates CSS vars on `<html>` (`--accent`, `--glass-tint`, `--wallpaper`) → entire UI recolors with a 400ms cross-fade+blur.
- CRUD: create, rename, duplicate, delete, import/export JSON (drag-drop `.tabos.json`).
- Switcher = pill row in TopBar + `⌘K` command palette.

## Widget Specs (v1)

- **Bookmarks:** grid of `GlassCard` tiles, favicon via `https://www.google.com/s2/favicons?domain=…&sz=128`, dnd-kit reordering, right-click context menu (Radix), add/edit dialog.
- **Todos:** sections Today/Upcoming/Recurring, priority chip, subtasks, progress ring (SVG), quick-add input at bottom, completion checkmark with spring.
- **Consistency:** daily rules list + 7-day heatmap strip + monthly grid on expand, current/longest streak, consistency score (rules_done / rules_total * 100 rolling 30d).
- **Clock:** digital default, analog toggle, seconds toggle, 12/24 toggle — settings live in `settingsStore`.
- **Notes:** markdown textarea with live preview toggle, checklist syntax `[ ]`, autosave debounced 500ms.
- **Pomodoro:** SVG ring, presets 25/5, 50/10, custom; floating breathing animation while running.
- **Weather:** Open-Meteo (no API key), geolocation with manual city fallback, Lucide animated icons.
- **Recent Activity:** `chrome.topSites` + `chrome.history` in extension; mock data on web.
- **Search:** floating bar with engine dropdown (Google/DDG/Brave/Bing/custom), `⌘/` focus.

## Customization Panel (`/settings`)

Sliders/toggles bound to `settingsStore`: glass intensity (0–100 → alpha), blur (8–40px), transparency, corner radius (12–36), font selector, motion speed (0.5×–1.5×), theme (auto/light/dark), widget visibility & order (dnd list), bookmark layout (grid/list/compact).

## Chrome Extension (MV3)

- `extension/manifest.json`:
  ```json
  {
    "manifest_version": 3,
    "name": "TabOS",
    "version": "1.0.0",
    "chrome_url_overrides": { "newtab": "newtab.html" },
    "permissions": ["storage", "topSites", "history", "favicon"],
    "icons": { "16": "icon.png", "48": "icon.png", "128": "icon.png" }
  }
  ```
- Vite build outputs a static bundle → copied into `extension/` with `newtab.html` as the entry.
- Storage adapter auto-detects `chrome.storage` and syncs preferences via `sync`, bulk data via `local`.
- Packaged via `nix run nixpkgs#zip` into `public/tabos-extension.zip` with an in-app download button + install steps.

## Development Roadmap

1. **Foundation** — tokens, fonts, `__root` background aurora, `<GlassPanel>` primitives, bento grid skeleton, TopBar with static greeting/clock.
2. **Workspaces** — presets, switcher, CSS-var theming, persistence adapter, settings→workspaces CRUD.
3. **Bookmarks + Search** — cards, favicon, dnd, context menu, add dialog; floating search with engines.
4. **Todos + Consistency + Notes** — three data widgets with stores, animations, quick-add.
5. **Clock + Pomodoro + Weather + Recent Activity** — utility widgets, Open-Meteo, chrome.* fallbacks.
6. **Customization** — settings panel, live token overrides, import/export.
7. **Motion polish** — spring presets, workspace crossfade, hover micro-interactions, ripple.
8. **Extension packaging** — manifest, build script, zip, download UI, install instructions.
9. **QA passes** — responsive (1080p→4K→ultrawide→laptop), light/dark auto, keyboard shortcuts (`⌘K`, `⌘/`, `⌘,`).

## Out of Scope (v1)

Cloud sync beyond `chrome.storage.sync`, multi-device account auth, AI features inside widgets, browser history search UI beyond recents.
