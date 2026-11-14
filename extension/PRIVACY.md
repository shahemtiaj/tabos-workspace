# TabOS — Privacy Policy

Last updated: 2026-11-14

TabOS is a Chrome new tab replacement. **We do not collect, transmit, sell, or
share any personal data.** There is no analytics, no tracking, no account and no
server owned by us.

## What data TabOS stores

Everything you create — workspaces, bookmarks, todos, notes, habits, timers,
recent searches and settings — is stored **locally in your browser** (extension
local storage). It never leaves your device and is removed when you uninstall
the extension. You can download a backup at any time in Settings → Backup.

## Network requests

TabOS requests no Chrome permissions. It only makes these outbound requests,
and only when the related widget is enabled:

| Purpose | Endpoint | Data sent |
| --- | --- | --- |
| Weather forecast (only if you turn weather on; at most every 30 minutes) | api.open-meteo.com | The latitude/longitude of the city you chose |
| City search | geocoding-api.open-meteo.com | The city name you type |
| Approximate area (only if you choose "Use my approximate area"; at most once a day) | get.geojs.io | Your IP address (by the nature of the request) |
| Bookmark icons | google.com/s2/favicons | The domain of bookmarks you added |
| Search | Your chosen engine (Google, DuckDuckGo, Brave, Bing) | Only the query you submit |

Weather is off until you choose a city or your approximate area. Turn it off
again, and hide the Bookmarks and Read Later widgets, to stop all optional
network activity. Nothing is sent in the background.

## Permissions

TabOS declares **no permissions** in its manifest. It cannot read your browsing
history, tabs, cookies or page content.

## Contact

Shah Emtiaj — https://shahemtiaj.com
