import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boardChars, formatRun, lenBucket, nextRuns, parseCron, readHeads, ZONE_OFFSET } from './logic.ts';

const cron = (line: string) => {
  const r = parseCron(line);
  if (!r.ok) throw new Error(r.message);
  return r;
};
const say = (line: string) => cron(line).summary;
const runDays = (line: string) => nextRuns(cron(line).fields, 0, Date.UTC(2026, 0, 1), 12).map((t) => new Date(t).getUTCDay());
const runDates = (line: string) => nextRuns(cron(line).fields, 0, Date.UTC(2026, 0, 1), 12).map((t) => new Date(t).getUTCDate());
const parseError = (line: string) => {
  const r = parseCron(line);
  assert.equal(r.ok, false, `${line} should not parse`);
  return r.ok ? '' : r.message;
};

/* ---------- cron: existing behavior */

test('cron presets read as before', () => {
  assert.equal(say('*/15 * * * *'), 'Every 15 minutes, every day');
  assert.equal(say('0 * * * *'), 'At the start of every hour, every day');
  assert.equal(say('30 9 * * 1-5'), 'At 09:30, Monday through Friday');
  assert.equal(say('0 3 * * 0'), 'At 03:00, on Sunday');
  assert.equal(say('0 6 1 * *'), 'At 06:00, on the 1st of the month');
  assert.equal(say('@daily'), 'At 00:00, every day');
});

test('cron keeps the OR rule when both day fields are set', () => {
  assert.equal(say('0 9 1 * 1'), 'At 09:00, on the 1st of the month, or on Monday');
  // January 2026: Thursday the 1st, then Mondays 5, 12, ...
  assert.deepEqual(runDates('0 9 1 * 1').slice(0, 3), [1, 5, 12]);
});

test('cron 1-7 covers the whole week', () => {
  assert.deepEqual(cron('0 0 * * 1-7').fields[4].values, [0, 1, 2, 3, 4, 5, 6]);
});

/* ---------- cron: day field that starts with * but has a step */

test('cron */2 in day of week names the days it runs on', () => {
  assert.deepEqual([...new Set(runDays('0 0 * * */2'))].sort(), [0, 2, 4, 6]);
  assert.equal(say('0 0 * * */2'), 'At 00:00, on Sunday, Tuesday, Thursday and Saturday');
});

test('cron */2 day of month with weekdays says both, joined with and', () => {
  // AND rule: only odd dates that are also weekdays.
  for (const t of nextRuns(cron('0 9 */2 * 1-5').fields, 0, Date.UTC(2026, 0, 1), 12)) {
    const d = new Date(t);
    assert.equal(d.getUTCDate() % 2, 1);
    assert.ok(d.getUTCDay() >= 1 && d.getUTCDay() <= 5);
  }
  const s = say('0 9 */2 * 1-5');
  assert.match(s, /^At 09:00, on the 1st, 3rd, .* and 31st of the month, and on Monday through Friday$/);
});

test('cron */2 in both day fields says both, joined with and', () => {
  assert.match(say('0 9 */2 * */2'), /of the month, and on Sunday, Tuesday, Thursday and Saturday$/);
});

/* ---------- cron: steps that do not divide the range */

test('cron */45 lists the minutes instead of "every 45 minutes"', () => {
  const r = cron('*/45 * * * *');
  assert.deepEqual(r.fields[0].values, [0, 45]);
  assert.doesNotMatch(r.summary, /Every 45 minutes/);
  assert.equal(r.words[0], '0 and 45');
});

test('cron */5 hours lists the hours, */6 still says every 6 hours', () => {
  assert.doesNotMatch(say('0 */5 * * *'), /every 5 hours/);
  assert.equal(say('0 */6 * * *'), 'At the start of the hour, every 6 hours, every day');
});

/* ---------- cron: ranges */

test('cron rejects a range with two dashes', () => {
  assert.equal(parseError('0 0 1-5-9 * *'), 'Day of month: “1-5-9” has more than one -.');
});

test('cron MON-SUN works like 1-7', () => {
  assert.deepEqual(cron('0 0 * * MON-SUN').fields[4].values, [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(parseError('0 0 * * 5-1'), 'Day of week: the range 5-1 runs backwards.');
});

/* ---------- next runs */

test('a date that never happens has no runs', () => {
  assert.deepEqual(nextRuns(cron('0 0 30 2 *').fields, 0, Date.UTC(2026, 0, 1)), []);
});

test('runs in Dhaka time fire six hours earlier in UTC', () => {
  const [run] = nextRuns(cron('0 8 * * *').fields, ZONE_OFFSET.dhaka, Date.UTC(2026, 0, 1));
  assert.equal(formatRun(run, 0), 'Thu 1 Jan 2026, 02:00');
  assert.equal(formatRun(run, ZONE_OFFSET.dhaka), 'Thu 1 Jan 2026, 08:00');
});

/* ---------- what the page shows */

test('the sample line reads back as the prerender shows it', () => {
  const { heads, line } = readHeads(parseCron('30 9 * * 1-5'));
  assert.equal(line, false);
  assert.deepEqual(heads.map((h) => h.words), ['at minute 30', 'at hour 9', 'every day', 'every month', 'Monday through Friday']);
  assert.ok(heads.every((h) => h.error === undefined));
});

test('every wrong field is flagged and good fields keep their words', () => {
  const { heads, line } = readHeads(parseCron('99 9 * 13 1-5'));
  assert.equal(line, false);
  assert.equal(heads[0].error, 'Minute: 99 is outside 0 to 59.');
  assert.equal(heads[3].error, 'Month: 13 is outside 1 to 12.');
  assert.equal(heads[1].words, 'at hour 9');
  assert.equal(heads[4].words, 'Monday through Friday');
});

test('a line-level error has no field errors and no words', () => {
  for (const text of ['', '1 2 3', '@nope']) {
    const { heads, line } = readHeads(parseCron(text));
    assert.equal(line, true, text);
    assert.ok(heads.every((h) => h.error === undefined && h.words === ' '), text);
  }
});

test('board text is always twenty cells with the day right-aligned', () => {
  assert.equal(boardChars('Mon 9 Nov 2026, 09:30'), 'Mon  9 Nov 202609:30');
  assert.equal(boardChars('Tue 10 Nov 2026, 23:59'), 'Tue 10 Nov 202623:59');
  assert.equal(boardChars(), ' '.repeat(20));
});

test('headline size follows the sentence length', () => {
  assert.deepEqual([40, 41, 64, 65, 110, 111].map(lenBucket), ['s', 'm', 'm', 'l', 'l', 'xl']);
});
