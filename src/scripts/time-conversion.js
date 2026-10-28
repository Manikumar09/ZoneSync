/**
 * Pure time conversion functions shared by the calculator, timeline, and Node tests.
 */

(function (root) {
  // Build a local date from named parts so locale ordering cannot change the result.
  function wallTime(epoch, zone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date(epoch));
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  }
  function convertWallTime(value, zone) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw Error('Enter a valid date and time.');
    const naive = Date.parse(value + 'Z');
    if (!Number.isFinite(naive) || wallTime(naive, 'UTC') !== value) throw Error('Enter a valid date and time.');
    // Sample nearby offsets, then verify each possible instant against the requested
    // wall time. Zero matches is a skipped time; two matches is a repeated time.
    const offsets = new Set();
    for (let h = -36; h <= 36; h += 6) {
      const instant = naive + h * 3600000;
      offsets.add(Date.parse(wallTime(instant, zone) + 'Z') - instant);
    }
    const matches = [...offsets].map(o => naive - o).filter(t => wallTime(t, zone) === value).sort((a, b) => a - b);
    if (!matches.length) throw Error('This local time does not exist because the clocks move forward. Choose another time.');
    return {
      epoch: matches[0],
      ambiguous: matches.length > 1
    };
  }
  root.ZoneSyncTime = {
    wallTime,
    convertWallTime
  };
  if (typeof module !== 'undefined') module.exports = root.ZoneSyncTime;
})(globalThis);
