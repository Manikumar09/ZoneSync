const { test } = require('node:test');
const assert = require('node:assert/strict');
const { wallTime, convertWallTime } = require('../src/scripts/time-conversion.js');

test('converts fractional offsets and crosses calendar dates', () => {
  const { epoch, ambiguous } = convertWallTime('2026-10-28T00:15', 'Asia/Kathmandu');
  assert.equal(new Date(epoch).toISOString(), '2026-10-27T18:30:00.000Z');
  assert.equal(wallTime(epoch, 'Asia/Kolkata'), '2026-10-28T00:00');
  assert.equal(ambiguous, false);
});

test('rejects the missing hour when daylight saving starts', () => {
  assert.throws(() => convertWallTime('2026-03-08T02:30', 'America/New_York'), /does not exist/);
});

test('selects the earlier occurrence when the clocks go back', () => {
  const { epoch, ambiguous } = convertWallTime('2026-11-01T01:30', 'America/New_York');
  assert.equal(ambiguous, true);
  assert.equal(new Date(epoch).toISOString(), '2026-11-01T05:30:00.000Z');
});

test('applies seasonal offsets in the southern hemisphere', () => {
  const winter = convertWallTime('2026-07-15T12:00', 'Australia/Sydney');
  const summer = convertWallTime('2026-01-15T12:00', 'Australia/Sydney');
  assert.equal(new Date(winter.epoch).getUTCHours(), 2);
  assert.equal(new Date(summer.epoch).getUTCHours(), 1);
});

test('rejects invalid calendar dates and malformed values', () => {
  for (const value of ['2026-02-30T12:00', 'invalid', '2026-10-28T25:00']) {
    assert.throws(() => convertWallTime(value, 'UTC'), /valid date and time/);
  }
});

test('represents midnight without rolling to the next day', () => {
  assert.equal(wallTime(Date.parse('2026-10-28T00:00:00Z'), 'UTC'), '2026-10-28T00:00');
});
