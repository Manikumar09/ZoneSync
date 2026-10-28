/**
 * Public map provider configuration. Keep the attribution visible.
 */

// Public OpenStreetMap raster tiles. No API key is required.
// Configure another provider here if your deployment needs a different service.
window.ZONESYNC_MAP = Object.freeze({
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
});
