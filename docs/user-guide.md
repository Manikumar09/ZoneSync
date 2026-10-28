# MunuteAtlas user guide

MunuteAtlas helps you find local times, save world clocks, convert dates, and compare timezones. No account is needed. Open the deployed website in a current browser, or run `python3 launch.py` from the application folder.

## Find a place

Enter a city in the search box and choose a result. You can also click a map marker or any point on the map. Drag the map to move and use the plus and minus controls to zoom. The map readout previews the timezone under the pointer or near the map center. Click to select it.

The selected-area card shows the timezone, GMT offset, current local time, and date. A timezone region name may be shown instead of a street address or nearest city. Coordinates near borders may resolve to a neighboring region because the lookup uses geographic timezone data.

Use the location button if you want to find the time near your current position. Your browser asks for permission. If you decline, search or click the map instead. Location detection works on HTTPS sites and localhost.

Choose 12-hour or 24-hour at the top of the page to change time formatting.

## Save world clocks

1. Select a location.
2. Press Save location.
3. Open the World clock tab to see saved places.
4. Select a card to return to that place on the map.
5. Press the remove button on a card to remove it.

Saved places stay in this browser. Clearing site data removes them. They are not synced to your other devices. On a first visit the app starts with London, New York, Tokyo, and Sydney.

## Convert a date and time

1. Open Timezone calculator.
2. Choose the source timezone under From timezone.
3. Press the calendar button to choose the source date and time.
4. Choose the destination timezone.
5. Press the conversion button, or change a field to update the result.

The destination card shows the local time and date for the same instant. The day message tells you whether the destination is on the same calendar date, an earlier date, or a later date. Select from Map uses the current map selection as the source. Swap exchanges the timezones while preserving the instant when the source time is valid.

Choose region names such as `America/New_York` rather than assuming a fixed abbreviation such as EST. The browser applies the daylight saving rules for the selected date. A skipped spring time is rejected. If a time occurs twice when clocks go back, the app chooses the earlier occurrence and displays a message.

## Compare timezones

1. Select the base region on the map.
2. Open Time zone list.
3. Choose a comparison zone and press Add.
4. Add up to five unique comparison zones.
5. Choose a date in the base timezone.
6. Click a point on a scale or drag its mint pointer.

All rows show the same instant. The date, time, and GMT offset update together. Remove a comparison using its chip. Selecting a new map region changes the base. A matching comparison is removed to prevent duplicates.

Mint shading means 08:00 to 18:00 in that row's local time. It is a planning guide, not actual daylight or opening hours. Scales cover 24 elapsed hours from base midnight; clock changes can alter the final local hour. Today returns to today's base date and resets the pointer to its start.

On a phone, swipe horizontally to see the scale and tap to select a time. Drag the pointer to make a precise selection. The time popup appears while dragging. Hover and wheel scrolling do not select a time.

When a scale has keyboard focus:

| Key | Action |
| --- | --- |
| Left / Right | Move by one minute |
| Shift + Left / Right | Move by one hour |
| Up / Down | Move forward / back by one hour |
| Page Up / Page Down | Move forward / back by one hour |
| Home / End | Move to the start / end of the scale |

## Appearance and navigation

Open Theme and choose Black & White, Bright, or Midnight. The choice stays in this browser. Use the arrow keys to move through the theme menu and Escape to close it. Use Left, Right, Home, or End on the time-tool tabs. Reduced-motion settings are respected.

## Accuracy and privacy

Clocks depend on your device clock and browser timezone database. Keep both updated. Future timezone rules can change. The app does not contact a time synchronization server.

Saved world clocks and themes remain in local browser storage. City searches go to Open-Meteo. Map tiles, libraries, and fonts load from external services. The app has no account system, analytics integration, or server database. See the README for provider links and usage requirements.

## Common problems

| Problem | What to try |
| --- | --- |
| Blank map | Check your internet connection and refresh. A provider or network may block tiles. |
| City search fails | Try a starter city such as London, Tokyo, or Mumbai, or use the timezone dropdowns. |
| Saved places disappear | Use the same browser and site address. Private browsing or cleared site data can remove saved settings. |
| Location permission is denied | Search for a city or select it on the map. |
| Local files do not load tiles | Run `python3 launch.py` and use the localhost address rather than opening HTML directly. |
| Time seems wrong | Check your device time, selected date, timezone, and browser updates. |
| A local time is rejected | Choose a valid time outside the daylight saving gap. |

For a code or app problem, use the Issues tab in the GitHub repository after it has been created. Include the browser version, timezone, selected date, and steps to reproduce the issue. Do not post private coordinates or credentials.
