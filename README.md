# ZoneSync

ZoneSync is a world clock and timezone planning app. Use an interactive map to find local times, save places, convert dates between timezones, and compare a shared moment across regions.

The app runs in your browser. No account, backend server, database, or API key is needed.

## Hosting status

The code includes a GitHub Actions workflow for GitHub Pages. The existing repository is [Manikumar09/ZoneSync](https://github.com/Manikumar09/ZoneSync), and the website address after a successful deployment is:

```text
https://manikumar09.github.io/ZoneSync/
```

This address becomes available after the code is pushed, Pages is enabled, and deployment succeeds. It is not a confirmed live deployment. See the [deployment guide](docs/deployment.md) for the publishing steps.

## Features

- Search for a city or select an area on the world map.
- See the selected timezone, GMT offset, local time, and date.
- Save and remove world-clock locations in your browser.
- Convert a date and time between IANA timezones.
- Handle fractional offsets and daylight saving changes.
- Compare a base region with one to five other timezones.
- Select the same instant across aligned time scales.
- Switch between 12-hour and 24-hour formats.
- Choose Black & White, Bright, or Midnight appearance.
- Use keyboard controls and a responsive layout on smaller screens.

## Run locally

Install Python 3, then run from this folder:

```sh
python3 launch.py
```

The launcher serves `src/` on a free localhost port and opens your browser. Press Ctrl+C in the terminal to stop it. No Python packages are needed.

To use a fixed port without opening a browser automatically:

```sh
python3 launch.py --port 8765 --no-browser
```

Open `http://127.0.0.1:8765/`. Use HTTP rather than opening `index.html` as a file so map requests have a valid referrer.

## App user guide

### Find and save a place

Search for a city and choose a result, click the map, or select a city marker. The selected-area card updates with the local time and timezone. Press Save location to add it to World clock. Select a saved card to return to it; use its remove button to delete it.

The location button asks your browser for permission to use your position. If you prefer, select a place manually. Choose 12-hour or 24-hour at the top of the app.

### Convert a time

Open Timezone calculator. Choose a source timezone, use the calendar button to set the date and time, and choose a destination timezone. Press Convert time. The result includes the destination date, GMT offset, and calendar-day difference. Swap exchanges the zones; Select from Map sets the source to the current map selection.

Times skipped when clocks move forward are rejected. Times repeated when clocks go back use the earlier occurrence, with an explanation. Region names such as `America/New_York` apply the rules for the selected date.

### Compare timezones

Open Time zone list. The map selection is your base region. Add one to five unique comparison zones, choose a base date, and click the scale or drag the mint pointer. Every row shows the same instant. On a phone, swipe horizontally and tap the scale, or drag its pointer.

With a scale focused, Left and Right move one minute. Shift + Left or Right moves one hour. Up, Down, Page Up, and Page Down move by an hour. Home and End select the scale boundaries. Hover and scrolling do not change the selected time.

Mint shading marks local 08:00–18:00 as a planning guide. Scales cover 24 elapsed hours from base midnight, so daylight saving changes can change the ending local hour. Today returns to today's base date at the start of the scale.

### Change appearance

Open Theme and choose Black & White, Bright, or Midnight. The choice is saved in this browser. Theme menus and time-tool tabs support keyboard navigation. The app respects reduced-motion preferences.

Read the [full user guide](docs/user-guide.md) for detailed controls, privacy notes, and troubleshooting.

## Development

Use Node.js 22 or newer and npm for checks and builds. The project has no npm dependencies, so no install step or lockfile is needed.

```sh
npm run check
npm test
npm run build
```

| Command | Purpose |
| --- | --- |
| `npm start` | Launch the Python development server |
| `npm run check` | Check JavaScript syntax, HTML IDs, and local asset paths |
| `npm test` | Test timezone conversion, invalid dates, offsets, and clock changes |
| `npm run build` | Copy source files into the generated `dist/` folder |

Edit `src/`, not `dist/`. The build replaces `dist/`. Documentation belongs in `docs/`. See the [code guide](docs/architecture.md) for the complete folder structure, file responsibilities, script order, shared state, and events.

```text
.github/workflows/   Automated checks and Pages deployment
src/index.html       Page layout
src/assets/          ZoneSync logo
src/scripts/         Map, clocks, calculator, comparison, and appearance code
src/scripts/data/    Default city data
src/styles/          Layout and theme styles
scripts/             Build, checks, and GitHub publishing tools
tests/               Time conversion tests
docs/                User, code, and deployment guides
launch.py            Local server
```

The source is formatted for reading, with feature files and comments for non-obvious rules. Existing saved clocks and appearance preferences are migrated to ZoneSync storage keys on the same site address. The controllers still share browser state; they are not ES modules. Browser checks are also needed for layout, touch input, and external service loading.

## Publish to GitHub

The publishing script connects this folder to your existing public repository, `Manikumar09/ZoneSync`, pushes the committed code, enables Pages, and starts the workflow. It does not create a repository. Use a terminal with internet access:

```sh
gh auth login --hostname github.com
python3 scripts/publish_github.py
```

Commit any local changes before publishing. The script checks the signed-in account and refuses an unrelated remote. It never force-pushes. If the remote has commits that are not present locally, a normal push stops without overwriting them. See the [deployment guide](docs/deployment.md) for details.

After setup, each push to `main` runs the checks and publishes the built app. Pull requests only check and build. GitHub Pages hosts the website while your computer is off. GitHub Actions performs deployments; it is not an always-running application server. Check the Actions result before treating the planned address as live.

The workflow follows GitHub's [custom Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). No application secrets are needed. Local `.env` files, `.openai/` hosting state, caches, and build output are ignored by Git.

## Data, providers, and privacy

| Provider or storage | Use |
| --- | --- |
| Leaflet 1.9.4 | Displays the map; loaded from unpkg |
| OpenStreetMap | Public raster map tiles |
| tz-lookup 6.1.25 | Looks up a timezone from coordinates in the browser |
| Open-Meteo | City search and geocoding |
| Browser Intl | Local time formatting and timezone rules |
| Google Fonts | DM Sans and Manrope fonts |
| localStorage | Saved clocks (`zonesync-places`) and theme (`zonesync-theme`) |

City search sends search text to Open-Meteo. Map tiles, fonts, and libraries make requests to external providers. A tile request can reveal the viewed map area. Location detection requires browser permission. No street-address lookup is performed. There is no app account, analytics integration, or server database.

Saved places and themes stay in this browser and do not sync across devices. Calculator values and comparison selections are not saved between visits. Clearing site data removes saved preferences. Clocks use your device time and browser timezone database, so keep them updated. The app requires internet access for external assets, maps, and city search.

Map configuration is in `src/scripts/map-config.js`. Keep visible attribution and follow the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/). Public tiles do not offer an uptime guarantee; review provider terms before increasing traffic or changing the service. See [Open-Meteo](https://open-meteo.com/) for its service terms.

## Troubleshooting

- If the map is blank, check your connection, refresh, and try city search or the timezone dropdowns.
- If localhost will not start on a fixed port, omit `--port` to choose a free one.
- If GitHub cannot be reached, use a terminal with network access before changing authentication.
- If deployment fails, inspect the Actions log and confirm Pages uses GitHub Actions as its source.
- If saved clocks disappear, check that you are using the same browser and site address.
- If a time is rejected, check for a daylight saving gap or an invalid date.

No custom domain is configured. Use the Pages address after deployment succeeds.

## Support and licensing

After the repository is created, report bugs through its Issues tab with the browser version and steps to reproduce the problem. Official support contact details have not been provided.

No license has been selected for the application code. Public source visibility does not grant an open-source license. External libraries and data retain their own licenses and attribution requirements.
