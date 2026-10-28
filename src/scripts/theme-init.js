/**
 * Restore the saved theme before the page renders to avoid a flash of the default theme.
 */

try {
  const theme = localStorage.getItem('zonesync-theme');
  if (['mono', 'bright', 'midnight'].includes(theme)) document.documentElement.dataset.theme = theme;
} catch {/* Use the default theme when browser storage is unavailable. */}
