# Changelog

## 1.3.0

### Privacy and weather
- Weather is off until you choose: search your city, or allow your approximate area. Before, every new tab sent your IP address to GeoJS by default.
- Weather is cached for 30 minutes and your area for a day, instead of being fetched on every new tab. The last result shows instantly, and offline.
- No more silent San Francisco weather when your location can't be found.
- Correct conditions (rain showers were shown as "Storm", fog as "Cloudy"), today's high and low, "feels like", and gently animated icons.

### Focus timer
- The break now runs after each focus session.
- A chime and a message when a session or break ends.
- Keeps exact time in the background, survives reloading or closing the tab, and every open tab shows the same timer. The countdown appears in the tab title.
- Counts the sessions you finish each day; skip button.

### First run and your data
- A short setup on first install: your name, your weather location, your starting workspace.
- No more demo tasks, habits and notes for new users.
- Settings → Backup: download all your data, restore it, or erase it.
- Open TabOS tabs stay in step: a change in one tab is no longer undone by an older tab.
- Deleting a workspace asks first and can be undone.

### Bookmarks and layout
- Drag bookmarks to reorder them, and edit them. Web addresses are checked.
- A letter icon shows when a site icon can't load, so bookmarks are never blank.
- "Recent & Frequent" now shows the bookmarks you actually open, instead of repeating your bookmark list.
- Each workspace's own background colours are applied.
- Widgets fill gaps in the grid; a new tab no longer fades in from a blur.
- The unused profile button is gone; the greeting no longer says "User".

### Project
- `npm run build:extension` is plain Node and works on any computer.
- `tests/e2e.mjs`: a browser test of the main flows.

