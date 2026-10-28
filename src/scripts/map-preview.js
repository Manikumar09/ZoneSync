/**
 * Map pointer readout and movement feedback. Requires app.js.
 */

// Preview the pointer position, or map center while panning/on touch screens.
if (map) {
  const readout = document.querySelector('.map-caption');
  readout.classList.add('navigation-readout');
  readout.replaceChildren();
  const heading = document.createElement('strong');
  const coordinates = document.createElement('span');
  const timezone = document.createElement('span');
  const instruction = document.createElement('small');
  instruction.textContent = 'Move across the map · Click to select';
  readout.append(heading, coordinates, timezone, instruction);
  readout.setAttribute('aria-label', 'Location and GMT timezone under pointer or map center');
  let position = map.getCenter(),
    frame = null;
  function previewLocation() {
    frame = null;
    const lat = Math.max(-90, Math.min(90, position.lat));
    const lon = ((position.lng + 180) % 360 + 360) % 360 - 180;
    coordinates.textContent = `${Math.abs(lat).toFixed(4)}° ${lat < 0 ? 'S' : 'N'} · ${Math.abs(lon).toFixed(4)}° ${lon < 0 ? 'W' : 'E'}`;
    if (typeof tzlookup !== 'function') {
      heading.textContent = 'Map location';
      timezone.textContent = 'Timezone lookup unavailable — refresh when connected';
      return;
    }
    try {
      const tz = tzlookup(lat, lon);
      const nearby = cities.find(c => Math.hypot(c.lat - lat, (c.lon - lon + 540) % 360 - 180) < .3);
      heading.textContent = nearby ? nearby.name : 'Timezone region: ' + tz.replaceAll('_', ' ');
      timezone.textContent = offset(tz).replace('UTC', 'GMT') + ' · ' + time(tz);
    } catch {
      heading.textContent = 'Map location';
      timezone.textContent = 'Timezone unavailable at this location';
    }
  }
  function queuePreview(latlng) {
    position = latlng;
    if (frame === null) frame = requestAnimationFrame(previewLocation);
  }
  map.on('mousemove', e => queuePreview(e.latlng));
  map.on('move', () => queuePreview(map.getCenter()));
  map.on('mouseout', () => queuePreview(map.getCenter()));
  map.on('click', e => queuePreview(e.latlng));
  map.on('moveend', () => queuePreview(map.getCenter()));
  setInterval(() => queuePreview(position), 1000);
  previewLocation();
}
if (map) {
  map.on('movestart', () => document.querySelector('.map-wrap').classList.add('is-moving'));
  map.on('moveend', () => document.querySelector('.map-wrap').classList.remove('is-moving'));
}
