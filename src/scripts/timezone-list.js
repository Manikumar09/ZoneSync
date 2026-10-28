/**
 * Shared timeline for a base timezone and up to five comparison zones.
 */

(() => {
  let base = selected.tz,
    comparisons = [],
    start = 0,
    rows = [],
    currentMinute = 720,
    previewMinute = null,
    dragging = false,
    frame = null,
    lastPointer = null;
  const picker = getElement('compare-zone-picker');
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Choose a timezone to compare…';
  picker.append(placeholder);
  for (const zone of zones) {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone.replaceAll('_', ' ');
    picker.append(option);
  }
  const formatters = new Map();
  function formatAt(epoch, zone, kind) {
    const key = zone + '|' + kind + '|' + hour12;
    if (!formatters.has(key)) formatters.set(key, new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      ...(kind === 'date' ? {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      } : kind === 'offset' ? {
        timeZoneName: 'longOffset'
      } : {
        hour: '2-digit',
        minute: '2-digit',
        hour12
      })
    }));
    const fmt = formatters.get(key);
    return kind === 'offset' ? fmt.formatToParts(new Date(epoch)).find(p => p.type === 'timeZoneName').value : fmt.format(new Date(epoch));
  }
  const dateInZone = (instant, zone) => formatAt(instant, zone, 'date');
  const clockInZone = (instant, zone) => formatAt(instant, zone, 'clock');
  const popup = document.createElement('div');
  popup.className = 'scale-time-popup';
  popup.id = 'scale-time-popup';
  popup.setAttribute('role', 'tooltip');
  popup.hidden = true;
  document.body.append(popup);
  function hidePreview() {
    previewMinute = null;
    lastPointer = null;
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    popup.hidden = true;
    updateMoment();
  }
  function minuteAt(event, track) {
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(1440, Math.round((event.clientX - rect.left) / rect.width * 1440)));
  }
  function showPopup(event, zone) {
    const epoch = start + (previewMinute ?? currentMinute) * 60000;
    popup.replaceChildren();
    for (const [tag, text] of [['small', zone.replaceAll('_', ' ')], ['strong', clockInZone(epoch, zone)], ['span', dateInZone(epoch, zone) + ' · ' + formatAt(epoch, zone, 'offset')], ['small', 'Base: ' + clockInZone(epoch, base) + ' · ' + 'Release to set time']]) {
      const el = document.createElement(tag);
      el.textContent = text;
      popup.append(el);
    }
    popup.hidden = false;
    const bounds = popup.getBoundingClientRect();
    popup.style.left = Math.max(8, Math.min(event.clientX + 18, window.innerWidth - bounds.width - 8)) + 'px';
    popup.style.top = Math.max(8, event.clientY + bounds.height + 24 > window.innerHeight ? event.clientY - bounds.height - 14 : event.clientY + 20) + 'px';
  }
  function pinMinute(minute) {
    currentMinute = Math.max(0, Math.min(1440, minute));
    previewMinute = null;
    updateMoment();
  }
  function inspect(event, track, zone) {
    if (!rows.length || !dragging) return;
    lastPointer = {
      event,
      track,
      zone
    };
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (!lastPointer || !dragging) return;
      const p = lastPointer;
      previewMinute = minuteAt(p.event, p.track);
      if (dragging) currentMinute = previewMinute;
      updateMoment();
      showPopup(p.event, p.zone);
    });
  }
  function refreshOptions() {
    for (const option of picker.options) option.disabled = option.value === base || comparisons.includes(option.value);
    if (picker.selectedOptions[0]?.disabled) picker.value = '';
    getElement('add-compare-zone').disabled = comparisons.length >= 5 || !picker.value;
  }
  function updateSelection() {
    hidePreview();
    getElement('compare-base-zone').textContent = base.replaceAll('_', ' ');
    getElement('compare-selection-status').textContent = `${comparisons.length} of 5 selected. ` + (comparisons.length < 1 ? 'Add at least 1 timezone to compare.' : 'Add up to 5 different timezones.');
    getElement('compare-chips').replaceChildren();
    for (const zone of comparisons) {
      const chip = document.createElement('button');
      chip.className = 'compare-chip';
      chip.textContent = zone.replaceAll('_', ' ') + ' ×';
      chip.setAttribute('aria-label', 'Remove ' + zone);
      chip.onclick = () => {
        comparisons = comparisons.filter(z => z !== zone);
        updateSelection();
      };
      getElement('compare-chips').append(chip);
    }
    refreshOptions();
    getElement('compare-empty').hidden = comparisons.length >= 1;
    getElement('compare-simulation').hidden = comparisons.length < 1;
    if (comparisons.length >= 1) drawScales();
  }
  getElement('compare-date').value = ZoneSyncTime.wallTime(Date.now(), base).slice(0, 10);
  function drawScales() {
    // These are elapsed-hour scales. A clock change can shift the ending wall time.
    hidePreview();
    rows = [];
    getElement('compare-scales').replaceChildren();
    getElement('compare-error').textContent = '';
    try {
      start = ZoneSyncTime.convertWallTime(getElement('compare-date').value + 'T00:00', base).epoch;
    } catch (e) {
      getElement('compare-error').textContent = e.message;
      getElement('compare-moment').textContent = 'Choose a valid date';
      return;
    }
    for (const [index, zone] of [base, ...comparisons].entries()) {
      const row = document.createElement('article');
      row.className = 'scale-row' + (index === 0 ? ' base-scale' : '');
      const heading = document.createElement('div');
      heading.className = 'scale-row-heading';
      const name = document.createElement('strong');
      name.textContent = (index === 0 ? 'BASE · ' : '') + zone.replaceAll('_', ' ');
      const current = document.createElement('span');
      heading.append(name, current);
      const track = document.createElement('div');
      track.className = 'time-scale';
      track.tabIndex = 0;
      track.setAttribute('role', 'slider');
      track.setAttribute('aria-label', 'Selected time on ' + zone);
      track.setAttribute('aria-valuemin', '0');
      track.setAttribute('aria-valuemax', '1440');
      for (let hour = 0; hour < 24; hour++) {
        const epoch = start + hour * 3600000;
        const wall = ZoneSyncTime.wallTime(epoch, zone);
        const localHour = +wall.slice(11, 13);
        const cell = document.createElement('button');
        cell.className = 'scale-cell ' + (localHour >= 8 && localHour < 18 ? 'business-hour' : 'other-hour');
        cell.textContent = wall.slice(11);
        const cellLabel = dateInZone(epoch, zone) + ' · ' + clockInZone(epoch, zone) + ' · ' + zone;
        cell.setAttribute('aria-label', 'Compare ' + cellLabel);
        cell.tabIndex = -1;
        cell.onclick = event => {
          pinMinute(Number.isFinite(event.clientX) && event.detail !== 0 ? minuteAt(event, track) : hour * 60);
        };
        track.append(cell);
      }
      const cursor = document.createElement('div');
      cursor.className = 'scale-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.title = 'Drag to set time';
      track.append(cursor);
      track.onpointermove = event => {
        if (dragging) inspect(event, track, zone);
      };
      track.onpointerleave = () => {
        if (!dragging) hidePreview();
      };
      track.onpointerdown = event => {
        if (event.button !== 0 || event.pointerType === 'touch' && !event.target.closest('.scale-cursor')) return;
        event.preventDefault();
        dragging = true;
        track.setPointerCapture(event.pointerId);
        pinMinute(minuteAt(event, track));
        previewMinute = currentMinute;
        showPopup(event, zone);
      };
      track.onpointerup = event => {
        if (!dragging) return;
        dragging = false;
        hidePreview();
        pinMinute(minuteAt(event, track));
      };
      track.onpointercancel = () => {
        dragging = false;
        hidePreview();
      };
      track.onlostpointercapture = () => {
        if (dragging) {
          dragging = false;
          hidePreview();
        }
      };
      track.onkeydown = event => {
        const steps = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowDown: -60,
          ArrowUp: 60,
          PageDown: -60,
          PageUp: 60
        };
        if (event.key in steps || ['Home', 'End'].includes(event.key)) {
          event.preventDefault();
          hidePreview();
          pinMinute(event.key === 'Home' ? 0 : event.key === 'End' ? 1440 : currentMinute + steps[event.key] * (event.shiftKey && Math.abs(steps[event.key]) === 1 ? 60 : 1));
        }
      };
      track.onblur = () => {
        if (!dragging) hidePreview();
      };
      row.append(heading, track);
      getElement('compare-scales').append(row);
      rows.push({
        zone,
        current,
        cursor,
        track
      });
    }
    updateMoment();
  }
  function updateMoment() {
    if (!rows.length) return;
    const minute = previewMinute ?? currentMinute,
      epoch = start + minute * 60000;
    getElement('compare-moment').textContent = 'Source: ' + base.replaceAll('_', ' ') + ' · ' + clockInZone(epoch, base) + ' · ' + dateInZone(epoch, base);
    for (const {
      zone,
      current,
      cursor,
      track
    } of rows) {
      const text = `${clockInZone(epoch, zone)} · ${dateInZone(epoch, zone)} · ${formatAt(epoch, zone, 'offset')}`;
      current.textContent = text;
      cursor.style.left = `${minute / 1440 * 100}%`;
      track.setAttribute('aria-valuenow', String(minute));
      track.setAttribute('aria-valuetext', text);
    }
  }
  picker.onchange = refreshOptions;
  getElement('add-compare-zone').onclick = () => {
    const zone = picker.value;
    if (!zone || zone === base || comparisons.includes(zone) || comparisons.length >= 5) return;
    comparisons.push(zone);
    picker.value = '';
    updateSelection();
  };
  getElement('compare-map').onclick = () => {
    document.querySelector('.map-wrap').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
    toast('Select an area on the map to set your base timezone.');
  };
  window.addEventListener('zonesync-selection', event => {
    base = event.detail.timezone;
    comparisons = comparisons.filter(zone => zone !== base);
    getElement('compare-date').value = ZoneSyncTime.wallTime(Date.now(), base).slice(0, 10);
    updateSelection();
  });
  getElement('compare-date').onchange = drawScales;
  getElement('compare-now').onclick = () => {
    getElement('compare-date').value = ZoneSyncTime.wallTime(Date.now(), base).slice(0, 10);
    currentMinute = 0;
    drawScales();
  };
  window.addEventListener('zonesync-tab', event => {
    if (event.detail.index !== 2) {
      hidePreview();
    } else if (comparisons.length >= 1) drawScales();
  });
  for (const id of ['h12', 'h24']) getElement(id).addEventListener('click', updateMoment);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hidePreview();
    }
  });
  document.querySelector('.scales-scroll').addEventListener('scroll', () => {
    if (!dragging) hidePreview();
  }, {
    passive: true
  });
  window.addEventListener('scroll', () => {
    if (!popup.hidden) hidePreview();
  }, {
    passive: true
  });
  window.addEventListener('resize', hidePreview);
  updateSelection();
})();
