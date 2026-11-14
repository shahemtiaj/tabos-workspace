# TabOS — Your New Tab, Reimagined

TabOS replaces Chrome's default New Tab with a premium, glassmorphic productivity workspace: bookmarks, tasks, notes, focus timer, weather, and a whole bento grid of widgets you can resize and rearrange.

Built by [Shah Emtiaj](https://shahemtiaj.com) · v1.3.0

---

## Highlights

- **Workspaces** — Default, AI, Video, Design, Dev, Study and Business profiles, each with its own accent, wallpaper tint and bookmark set.
- **Bento grid layout** — free-form resizing with drag handles in Edit Mode; every widget snaps to a 12-column grid.
- **Command palette** — `Ctrl/Cmd + K` to jump to workspaces, bookmarks, todos and settings.
- **Productivity widgets** — Todos with priorities and a progress ring, Consistency tracker with streaks and heatmap, Markdown notes with clickable links, Scratchpad, Read Later, Countdown, Hydration tracker.
- **Focus tools** — circular Pomodoro timer and procedural ambient sounds (rain, brown noise, waves) generated offline via Web Audio.
- **Scientific calculator** — trigonometry, logs, roots, factorials, constants, DEG/RAD toggle, memory keys and history.
- **Clocks & weather** — digital/analog clock, multi-timezone world clocks, animated weather with manual or IP-based location.
- **Search** — Google, DuckDuckGo, Brave or Bing, with recent-search suggestions and direct URL detection.
- **Deep customization** — blur, glass intensity, corner radius, fonts, UI scale, background dimming, per-widget visibility.

## Privacy

TabOS requests **no Chrome permissions** and collects no analytics. All data lives in local browser storage, and Settings → Backup downloads it as a file. The only outbound requests are optional: Open-Meteo (weather — off until you choose a city, at most every 30 minutes), GeoJS (approximate area, only if you choose it, at most once a day) and Google favicons (bookmark icons). See [`extension/PRIVACY.md`](extension/PRIVACY.md).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TanStack Start (web) / standalone Vite SPA (extension) |
| Styling | Tailwind CSS v4 with semantic design tokens |
| State | Zustand with persisted stores |
| Animation | Motion for React |
| Extension | Manifest V3, `chrome_url_overrides` only |

## Project structure

```text
src/
  components/
    glass/      Glass primitives (panels, cards)
    shell/      TopBar, command palette, settings, edit mode, tiles
    widgets/    Every dashboard widget
  stores/       Zustand stores (workspace, layout, todos, notes, …)
  lib/          Design tokens, workspace presets, version, utils
  routes/       TanStack Start file-based routes
extension-src/  Standalone MV3 build entry (reuses src/ widgets)
extension/      Built MV3 package (manifest, icons, assets)
scripts/        build-extension.sh — compiles and zips the release
```

## Development

Requires Node.js 20+ and npm.

```sh
npm install
npm run dev      # web app at http://localhost:8080
npm run build    # production web build
npm run lint
```

## Building the Chrome extension

```sh
npm run build:extension      # or: node scripts/build-extension.mjs
```

This compiles `extension-src/` into a self-contained SPA, writes it into `extension/`, and produces `public/tabos-extension-v<version>.zip`. It runs on any OS (no `zip` tool needed) and stops if `src/lib/version.ts` and `extension/manifest.json` disagree — bump both on release.

### Test in Chrome

```sh
npm i -D playwright
node tests/e2e.mjs            # optional: pass a Chrome / Chromium path
```

Loads the built extension and checks first-run setup, weather caching, bookmarks, the focus timer, backup and restore, upgrades from 1.2.x and that open tabs stay in step. Weather and icon requests are answered locally, so no network is needed.

### Install locally

1. Download or build the zip and unzip it.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the unzipped folder.
5. Open a new tab.

## License

All rights reserved © Shah Emtiaj.
