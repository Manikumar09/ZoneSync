/**
 * Shared application state, world clocks, map selection, saved places, and city search.
 * Loaded before the time-tool controllers. See docs/architecture.md for dependencies.
 */

const getElement = id => document.getElementById(id);
let hour12 = true,
  selected = {
    name: 'London',
    lat: 51.5074,
    lon: -.1278,
    tz: 'Europe/London'
  },
  map,
  marker,
  request = 0;
let saved;
// Keep the existing storage key so saved places survive the source reorganization.
try {
  saved = JSON.parse(localStorage.getItem('meridian-places'));
} catch {}
if (!Array.isArray(saved) || !saved.every(x => x && x.tz && Number.isFinite(x.lat))) saved = cities.slice(0, 4);
saved = saved.map(({
  lat,
  lon,
  tz
}) => ({
  lat,
  lon,
  tz,
  name: tz.split('/').pop().replaceAll('_', ' ')
}));
try {
  localStorage.setItem('meridian-places', JSON.stringify(saved));
} catch {}
let toastTimer;
function toast(t) {
  getElement('toast').textContent = t;
  getElement('toast').style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => getElement('toast').style.display = 'none', 3500);
}
function persist() {
  try {
    localStorage.setItem('meridian-places', JSON.stringify(saved));
  } catch {
    toast('Your browser could not save locations for future visits.');
  }
}
function offset(tz) {
  return new Intl.DateTimeFormat('en', {
    timeZone: tz,
    timeZoneName: 'longOffset'
  }).formatToParts(new Date()).find(x => x.type === 'timeZoneName').value.replace('GMT', 'UTC');
}
function minutes(tz) {
  let s = offset(tz).replace('UTC', '');
  if (!s) return 0;
  let m = s.match(/([+-])(\d+):(\d+)/);
  return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0;
}
function time(tz, seconds = false) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds ? {
      second: '2-digit'
    } : {}),
    hour12
  }).format(new Date());
}
function tick() {
  const now = new Date();
  let parts = new Intl.DateTimeFormat('en-US', {
    timeZone: selected.tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12
  }).formatToParts(now);
  getElement('clock').replaceChildren();
  for (const p of parts) {
    const el = document.createElement(p.type === 'dayPeriod' ? 'small' : 'span');
    el.textContent = p.value;
    getElement('clock').append(el);
  }
  getElement('date').textContent = new Intl.DateTimeFormat('en-US', {
    timeZone: selected.tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(now);
  getElement('offset').textContent = offset(selected.tz).replace('UTC', 'GMT');
  document.querySelectorAll('[data-clock]').forEach(el => el.textContent = time(el.dataset.clock));
  document.querySelectorAll('[data-offset]').forEach(el => el.textContent = offset(el.dataset.offset));
}
function select(p, fly = true) {
  // Comparison controls follow this event; the calculator changes source on request.
  selected = p;
  getElement('place').textContent = p.tz.split('/').pop().replaceAll('_', ' ');
  getElement('tz').textContent = p.tz;
  getElement('save').textContent = saved.some(x => x.tz === p.tz && x.name === p.name) ? '✓  Location saved' : '＋  Save location';
  if (map) {
    marker.setLatLng([p.lat, p.lon]);
    if (fly) map.flyTo([p.lat, p.lon], Math.max(map.getZoom(), 4), {
      duration: 1.4,
      animate: !matchMedia('(prefers-reduced-motion: reduce)').matches
    });
  }
  tick();
  window.dispatchEvent(new CustomEvent('meridian-selection', {
    detail: {
      timezone: p.tz
    }
  }));
  document.querySelector('.info').classList.remove('selection-enter');
  requestAnimationFrame(() => document.querySelector('.info').classList.add('selection-enter'));
}
function renderCards() {
  getElement('cards').replaceChildren();
  getElement('count').textContent = saved.length;
  for (const p of saved) {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('aria-label', 'Show ' + p.name);
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = p.name;
    const zone = document.createElement('div');
    zone.className = 'card-zone';
    zone.textContent = p.tz;
    const clock = document.createElement('div');
    clock.className = 'card-time';
    clock.dataset.clock = p.tz;
    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';
    const off = document.createElement('span');
    off.dataset.offset = p.tz;
    const live = document.createElement('span');
    live.textContent = '● Live';
    bottom.append(off, live);
    const remove = document.createElement('button');
    remove.className = 'remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Remove ' + p.name);
    remove.onclick = e => {
      e.stopPropagation();
      saved = saved.filter(x => x !== p);
      persist();
      renderCards();
      select(selected, false);
    };
    card.append(title, zone, clock, bottom, remove);
    card.onclick = () => select(p);
    card.onkeydown = e => {
      if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        select(p);
      }
    };
    getElement('cards').append(card);
  }
  if (!saved.length) {
    getElement('cards').textContent = 'Select a location on the map and save it to start your world clock.';
  }
  tick();
}
getElement('save').onclick = () => {
  if (saved.some(x => x.tz === selected.tz && x.name === selected.name)) {
    toast('This location is already in your world clock.');
    return;
  }
  saved.push({
    ...selected
  });
  persist();
  renderCards();
  select(selected, false);
  toast('Location added to your world clock');
};
for (const [id, v] of [['h12', true], ['h24', false]]) getElement(id).onclick = () => {
  hour12 = v;
  getElement('h12').classList.toggle('active', v);
  getElement('h24').classList.toggle('active', !v);
  getElement('h12').setAttribute('aria-pressed', v);
  getElement('h24').setAttribute('aria-pressed', !v);
  tick();
};
function point(lat, lon) {
  lon = ((lon + 180) % 360 + 360) % 360 - 180;
  try {
    if (typeof tzlookup !== 'function') throw Error();
    const tz = tzlookup(Math.max(-90, Math.min(90, lat)), lon);
    select({
      name: tz.split('/').pop().replaceAll('_', ' '),
      lat,
      lon,
      tz
    }, false);
    if (map) map.panTo([lat, lon], {
      animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: .8
    });
  } catch {
    toast('Timezone lookup could not load. Please check your connection and refresh.');
  }
}
if (typeof L !== 'undefined') {
  map = L.map('map', {
    zoomControl: false,
    minZoom: 2,
    maxZoom: 18,
    worldCopyJump: true
  }).setView([24, 15], 2);
  L.control.zoom({
    position: 'topright'
  }).addTo(map);
  const tiles = L.tileLayer(window.MERIDIAN_MAP.tileUrl, {
    attribution: window.MERIDIAN_MAP.attribution,
    maxZoom: 19,
    referrerPolicy: 'strict-origin-when-cross-origin'
  }).addTo(map);
  let failed = false;
  tiles.on('tileerror', () => {
    if (!failed) {
      failed = true;
      toast(location.protocol === 'file:' ? 'Map access needs localhost. Run python3 launch.py from the application folder.' : 'Map tiles are unavailable or blocked by the provider or network. City search is still available.');
    }
  });
  marker = L.marker([selected.lat, selected.lon], {
    icon: L.divIcon({
      className: '',
      html: '<div class="pin"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(map);
  cities.forEach(p => L.circleMarker([p.lat, p.lon], {
    radius: 4,
    color: '#fff',
    weight: 2,
    fillColor: '#607c69',
    fillOpacity: 1
  }).addTo(map).bindTooltip(p.name, {
    direction: 'top'
  }).on('click', e => {
    L.DomEvent.stopPropagation(e);
    select(p);
  }));
  map.on('click', e => point(e.latlng.lat, e.latlng.lng));
} else {
  getElement('map').textContent = 'The map could not load. Please check your connection. You can still search for a city.';
  getElement('map').style.padding = '90px 30px';
}
document.querySelector('.locate').onclick = () => {
  if (!navigator.geolocation) {
    toast('Location access is unavailable in this browser.');
    return;
  }
  toast('Finding your location…');
  navigator.geolocation.getCurrentPosition(p => {
    point(p.coords.latitude, p.coords.longitude);
    if (map) map.flyTo([p.coords.latitude, p.coords.longitude], 6);
  }, () => toast('Location access was unavailable. Search for your city instead.'), {
    timeout: 10000
  });
};
function showResults(items, message) {
  getElement('results').replaceChildren();
  if (message) {
    const p = document.createElement('p');
    p.style.padding = '14px';
    p.textContent = message;
    getElement('results').append(p);
  }
  for (const p of items) {
    const b = document.createElement('button');
    b.textContent = p.name + (p.country ? ', ' + p.country : '') + ' · ' + p.tz;
    b.onclick = () => {
      select(p);
      getElement('search').value = '';
      getElement('results').replaceChildren();
    };
    getElement('results').append(b);
  }
}
let timer;
getElement('search').oninput = () => {
  clearTimeout(timer);
  const q = getElement('search').value.trim();
  const n = ++request;
  if (!q) {
    showResults([]);
    return;
  }
  const local = cities.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  showResults(local, local.length ? null : 'Searching…');
  timer = setTimeout(async () => {
    try {
      const res = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=6&language=en&format=json');
      if (!res.ok) throw Error();
      const data = await res.json();
      if (n !== request) return;
      const found = (data.results || []).filter(p => p.timezone).map(p => ({
        name: p.name,
        country: p.country,
        lat: p.latitude,
        lon: p.longitude,
        tz: p.timezone
      }));
      showResults(found.length ? found : local, found.length || local.length ? null : 'No locations found. Try a nearby city.');
    } catch {
      if (n === request) showResults(local, local.length ? null : 'Search is unavailable. Try London, Tokyo, Mumbai, or select the map.');
    }
  }, 350);
};
getElement('search').onkeydown = e => {
  if (e.key === 'Escape') showResults([]);
  if (e.key === 'Enter') getElement('results').querySelector('button')?.click();
};
document.addEventListener('click', e => {
  if (!e.target.closest('.search-box')) showResults([]);
});
renderCards();
select(selected, false);
setInterval(tick, 1000);
if (location.protocol === 'file:') {
  const warning = document.createElement('div');
  warning.setAttribute('role', 'alert');
  warning.style.cssText = 'background:#fff3d6;color:#694e14;padding:14px 4%;line-height:1.6';
  warning.textContent = 'Map access may be blocked when opened as a file. Close this tab and run python3 launch.py to open the app through localhost.';
  document.body.prepend(warning);
}
