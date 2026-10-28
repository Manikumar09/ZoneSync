/** Preserve saved clocks and appearance settings when upgrading to ZoneSync. */
(() => {
  const previousKeys = [
    ['meridian-places', 'zonesync-places'],
    ['meridian-theme', 'zonesync-theme']
  ];

  for (const [previousKey, currentKey] of previousKeys) {
    try {
      // Keep current settings and retain the old values for recovery.
      if (localStorage.getItem(currentKey) !== null) continue;
      const previousValue = localStorage.getItem(previousKey);
      if (previousValue !== null) localStorage.setItem(currentKey, previousValue);
    } catch {
      // Browser storage is optional; the app still works when it is unavailable.
    }
  }
})();
