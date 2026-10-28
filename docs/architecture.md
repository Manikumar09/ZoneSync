# Code guide

ZoneSync is a static website. HTML provides the page, CSS controls its appearance, and plain JavaScript handles the map and time tools. There is no backend, database, account system, or API secret. Python is only a local development server. Node.js runs checks, tests, and the build.

## Folders

```text
zonesync/
  .github/workflows/pages.yml   Checks and GitHub Pages deployment
  docs/
    architecture.md            This code guide
    deployment.md              Publishing and deployment troubleshooting
    user-guide.md              Instructions for app users
  scripts/
    build.cjs                  Copies src into dist
    check.cjs                  Checks syntax and asset references
    publish_github.py          Creates the GitHub repo and enables Pages
  src/
    assets/zonesync-logo.png   Supplied ZoneSync brand logo
    index.html                 Page layout and accessible controls
    scripts/
      data/cities.js           Starter cities and search fallback
      storage-migration.js     Migrates saved preferences from the previous brand
      theme-init.js            Restores appearance before rendering
      appearance.js            Theme menu and saved theme
      map-config.js            Tile URL and required attribution
      time-conversion.js       Date and timezone conversion functions
      app.js                   Shared state, map, search, and world clocks
      map-preview.js           Pointer readout and map movement feedback
      tabs.js                  Tab switching and keyboard navigation
      calculator.js            Calculator and source date picker
      timezone-list.js         Comparison timeline and pointer controls
    styles/
      base.css                 Page layout and responsive styles
      theme.css                Time tools, shared styling, and transitions
      appearance.css           Theme menu and appearance overrides
  tests/time-conversion.test.cjs
  .editorconfig
  .gitignore
  launch.py                    Local server and browser launcher
  package.json                 Project commands; no installed dependencies
  README.md
```

`dist/` is generated and ignored by Git. Change `src/`, then run `npm run build`. The build removes the previous `dist/`, copies the source, and adds `.nojekyll`. Relative asset paths allow the same build to work at a GitHub Pages repository path.

## Script order

Scripts use ordinary browser script tags rather than a bundler. Keep the order in `index.html` when adding or moving files.

1. `storage-migration.js` copies previous saved clocks and theme settings to ZoneSync keys when those keys are missing. Existing ZoneSync settings take priority. It keeps the previous keys for recovery. This migration applies only on the same site origin. A different hostname, protocol, or localhost port has separate storage. `theme-init.js` then runs in the page head. `appearance.js` is deferred until the page is parsed.
2. Leaflet and tz-lookup load from their pinned CDN URLs.
3. `map-config.js` creates `window.ZONESYNC_MAP`.
4. `time-conversion.js` creates `ZoneSyncTime`, also exported for Node tests.
5. `data/cities.js` supplies `cities`.
6. `app.js` creates the map and shared state. `getElement` finds an element by ID; `selected` is the selected place; `hour12` controls clock formatting. It also defines `select`, `toast`, and other clock helpers used by the controllers.
7. `map-preview.js` adds pointer and movement feedback.
8. `tabs.js` attaches navigation handlers. Its calculator callback runs after the user activates the calculator tab, when all scripts have loaded.
9. `calculator.js` builds the shared `zones` list and calculator controls.
10. `timezone-list.js` uses that list to build comparison controls.

The controllers deliberately preserve the existing shared browser state. They are separate source files, not isolated ES modules. A future module conversion should pass state through explicit imports and test the event flow before removing these globals.

## Events and time calculations

`select(place)` updates the selected map location and dispatches `zonesync-selection`, with `detail.timezone`. The comparison tool follows the new base and removes a comparison that would duplicate it. The calculator follows the map only when the user presses Select from Map.

Tab changes dispatch `zonesync-tab`, with `detail.index`. The comparison tool uses it to clear pointer previews and redraw visible rows.

`ZoneSyncTime.wallTime(epoch, zone)` formats an instant as `YYYY-MM-DDTHH:mm`. `convertWallTime(value, zone)` resolves that local value to an instant. It checks offsets around the requested date, rejects missing times during a forward clock change, and returns the earlier occurrence with `ambiguous: true` when a time repeats.

Comparison scales cover 24 elapsed hours from midnight in the base zone. A daylight saving change may make the final local time different from midnight. Shading marks local hours from 08:00 to 18:00; it is not sunrise data or a business calendar.

## Browser storage and external services

| Item | Purpose |
| --- | --- |
| `zonesync-places` | Saved world-clock locations in localStorage |
| `zonesync-theme` | Selected theme in localStorage |
| OpenStreetMap | Public raster tiles; provider attribution must remain visible |
| Open-Meteo geocoding | Receives city search text and returns matching locations |
| unpkg | Hosts pinned Leaflet 1.9.4 and tz-lookup 6.1.25 assets |
| Google Fonts | Hosts DM Sans and Manrope |
| Browser Intl | Formats dates and supplies timezone rules |
| Browser geolocation | Requests coordinates only when the user selects Use my location |

Saved locations and themes are browser-specific. Comparisons and calculator values are held in memory. There is no cross-device sync or offline tile download. External providers receive normal network request information. Map tile requests can reveal the viewed area. Device coordinates are used for local timezone lookup and to center the map; loading nearby tiles makes requests to the tile provider.

## Working on the app

Keep changes in the file responsible for the feature. Use comments to explain rules, timing, and provider requirements. Preserve element IDs used by JavaScript and ARIA attributes. Respect reduced-motion preferences and retain keyboard controls.

Run `npm run check`, `npm test`, and `npm run build`. The tests cover fractional offsets, date boundaries, invalid dates, missing and repeated hours, and southern hemisphere seasonal offsets. Source checks cover JavaScript parsing, duplicate IDs, and local asset paths. They do not replace browser checks for map loading, touch input, themes, and layout.
