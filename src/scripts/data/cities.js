/**
 * Default city markers and offline search suggestions. Loaded before app.js.
 */

const cities = [['London', 51.5074, -.1278, 'Europe/London'], ['New York', 40.7128, -74.006, 'America/New_York'], ['Tokyo', 35.6762, 139.6503, 'Asia/Tokyo'], ['Sydney', -33.8688, 151.2093, 'Australia/Sydney'], ['Bengaluru', 12.9716, 77.5946, 'Asia/Kolkata'], ['Mumbai', 19.076, 72.8777, 'Asia/Kolkata'], ['Delhi', 28.6139, 77.209, 'Asia/Kolkata'], ['Paris', 48.8566, 2.3522, 'Europe/Paris'], ['Dubai', 25.2048, 55.2708, 'Asia/Dubai'], ['Singapore', 1.3521, 103.8198, 'Asia/Singapore'], ['Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles'], ['Kathmandu', 27.7172, 85.324, 'Asia/Kathmandu']].map(([name, lat, lon, tz]) => ({
  name,
  lat,
  lon,
  tz
}));
