/**
 * Timezone calculator controls, conversion output, and date picker.
 */

const fromZone = getElement('from-zone'),
  toZone = getElement('to-zone');
const zones = [...new Set(['UTC', ...Intl.supportedValuesOf('timeZone'), selected.tz, Intl.DateTimeFormat().resolvedOptions().timeZone])].sort();
for (const zone of zones) {
  for (const select of [fromZone, toZone]) {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone.replaceAll('_', ' ');
    select.append(option);
  }
}
fromZone.value = selected.tz;
toZone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (toZone.value === fromZone.value) toZone.value = 'Asia/Tokyo';
function setSourceTime(epoch) {
  const [date, time] = ZoneSyncTime.wallTime(epoch, fromZone.value).split('T');
  getElement('convert-date').value = date;
  getElement('convert-time').value = time;
}
function sourceValue() {
  return getElement('convert-date').value + 'T' + getElement('convert-time').value;
}
function gmtAt(epoch, zone) {
  return new Intl.DateTimeFormat('en', {
    timeZone: zone,
    timeZoneName: 'longOffset'
  }).formatToParts(new Date(epoch)).find(p => p.type === 'timeZoneName').value;
}
setSourceTime(Date.now());
function convert() {
  getElement('destination-zone-heading').textContent = toZone.selectedOptions[0]?.textContent || toZone.value.replaceAll('_', ' ');
  const result = getElement('conversion-result');
  try {
    const value = sourceValue();
    getElement('source-datetime-summary').textContent = value.replace('T', ' · ');
    const {
      epoch,
      ambiguous
    } = ZoneSyncTime.convertWallTime(value, fromZone.value);
    getElement('source-offset').textContent = gmtAt(epoch, fromZone.value);
    getElement('destination-offset').textContent = gmtAt(epoch, toZone.value);
    getElement('destination-time').textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: toZone.value,
      hour: '2-digit',
      minute: '2-digit',
      hour12
    }).format(new Date(epoch));
    getElement('destination-date').textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: toZone.value,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(epoch));
    const targetDate = ZoneSyncTime.wallTime(epoch, toZone.value).slice(0, 10);
    const dayDelta = Math.round((Date.parse(targetDate + 'T00:00Z') - Date.parse(value.slice(0, 10) + 'T00:00Z')) / 86400000);
    getElement('day-shift').textContent = dayDelta === 0 ? 'Same calendar day' : `${dayDelta > 0 ? '+' : ''}${dayDelta} day${Math.abs(dayDelta) === 1 ? '' : 's'} from source`;
    result.classList.remove('error');
    result.textContent = ambiguous ? 'This source time occurs twice when clocks go back. Showing the earlier occurrence.' : `${value.replace('T', ' at ')} in ${fromZone.value.replaceAll('_', ' ')} → ${toZone.value.replaceAll('_', ' ')}. Both represent the same moment.`;
  } catch (e) {
    result.classList.add('error');
    result.textContent = e.message;
    getElement('destination-time').textContent = '—';
    getElement('destination-date').textContent = 'Choose a valid source date and time';
    getElement('day-shift').textContent = 'Awaiting valid time';
    getElement('source-offset').textContent = '—';
    getElement('destination-offset').textContent = '—';
  }
}
getElement('convert-button').onclick = convert;
for (const el of [fromZone, toZone, getElement('convert-date'), getElement('convert-time')]) el.onchange = convert;
for (const id of ['h12', 'h24']) getElement(id).addEventListener('click', convert);
getElement('swap-zones').onclick = () => {
  let epoch;
  try {
    epoch = ZoneSyncTime.convertWallTime(sourceValue(), fromZone.value).epoch;
  } catch {}
  const before = fromZone.value;
  fromZone.value = toZone.value;
  toZone.value = before;
  if (epoch !== undefined) setSourceTime(epoch);
  convert();
};
getElement('use-selected').onclick = () => {
  fromZone.value = selected.tz;
  convert();
};
const calendarToggle = getElement('calendar-toggle'),
  dateTimePicker = getElement('source-datetime-picker');
let calendarAnimation;
function setCalendar(open, restoreFocus = false) {
  const wasHidden = dateTimePicker.hidden;
  const currentHeight = wasHidden ? 0 : dateTimePicker.getBoundingClientRect().height;
  calendarAnimation?.cancel();
  calendarToggle.setAttribute('aria-expanded', String(open));
  if (restoreFocus) calendarToggle.focus();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !dateTimePicker.animate) {
    dateTimePicker.hidden = !open;
    if (open) getElement('convert-date').focus();
    return;
  }
  dateTimePicker.hidden = false;
  const fullHeight = dateTimePicker.scrollHeight + 2;
  const animation = dateTimePicker.animate([{
    height: currentHeight + 'px',
    opacity: wasHidden ? 0 : 1,
    transform: wasHidden ? 'translateY(-8px)' : 'translateY(0)'
  }, {
    height: (open ? fullHeight : 0) + 'px',
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(-8px)'
  }], {
    duration: open ? 300 : 200,
    easing: 'cubic-bezier(.22,1,.36,1)',
    fill: 'both'
  });
  calendarAnimation = animation;
  if (open) getElement('convert-date').focus();
  animation.finished.then(() => {
    if (calendarAnimation !== animation) return;
    dateTimePicker.hidden = !open;
    animation.cancel();
    calendarAnimation = null;
  }).catch(() => {});
}
function closeCalendar(restoreFocus = false) {
  setCalendar(false, restoreFocus);
}
calendarToggle.onclick = () => setCalendar(calendarToggle.getAttribute('aria-expanded') !== 'true');
dateTimePicker.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeCalendar(true);
  }
});
document.addEventListener('click', e => {
  if (calendarToggle.getAttribute('aria-expanded') === 'true' && !dateTimePicker.contains(e.target) && !calendarToggle.contains(e.target)) closeCalendar();
});
