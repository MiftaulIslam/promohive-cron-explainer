/* Pure logic for the Cron Schedule Explainer: no React, no DOM, so it runs in Node for checks too. */

export const ZONE_OFFSET = { utc: 0, dhaka: 6 } as const; // Dhaka has no daylight saving time, so a fixed offset is exact
export type Zone = keyof typeof ZONE_OFFSET;

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAME = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MACROS: Record<string, string | undefined> = { '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *' };

interface FieldSpec { label: string; min: number; max: number; unit: string; units: string; names?: string[]; base?: number; top?: number }

const CRON_SPEC: readonly FieldSpec[] = [
  { label: 'Minute', min: 0, max: 59, unit: 'minute', units: 'minutes' },
  { label: 'Hour', min: 0, max: 23, unit: 'hour', units: 'hours' },
  { label: 'Day of month', min: 1, max: 31, unit: 'day', units: 'days' },
  { label: 'Month', min: 1, max: 12, unit: 'month', units: 'months', names: MON, base: 1 },
  { label: 'Day of week', min: 0, max: 7, unit: 'day of the week', units: 'days of the week', names: DOW, base: 0, top: 6 },
];

export const CRON_LABELS = CRON_SPEC.map((s) => s.label);

export interface CronField { values: number[]; all: boolean; star: boolean; every: number }

const pad = (n: number) => String(n).padStart(2, '0');
const join = (a: string[]) => (a.length < 3 ? a.join(' and ') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const ord = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;

// One field to a sorted list of values. Throws a message naming the field when the text is wrong.
function parseField(text: string, s: FieldSpec): CronField {
  const val = (t: string) => {
    if (s.names && s.names.includes(t.toUpperCase())) return s.names.indexOf(t.toUpperCase()) + (s.base ?? 0);
    if (!/^\d+$/.test(t)) throw new Error(`${s.label}: “${t}” is not a number${s.names ? ' or a short name' : ''}.`);
    const n = Number(t);
    if (n < s.min || n > s.max) throw new Error(`${s.label}: ${n} is outside ${s.min} to ${s.max}.`);
    return n;
  };
  const top = s.top ?? s.max;
  const out = new Set<number>();
  for (const part of text.split(',')) {
    if (!part) throw new Error(`${s.label}: there is an empty item in the list.`);
    const [range, stepText, extra] = part.split('/');
    if (extra !== undefined) throw new Error(`${s.label}: “${part}” has more than one /.`);
    let step = 1;
    if (stepText !== undefined) {
      if (!/^\d+$/.test(stepText) || Number(stepText) === 0) throw new Error(`${s.label}: the step after / must be a whole number above 0.`);
      step = Number(stepText);
    }
    let lo: number, hi: number;
    if (range === '*') { lo = s.min; hi = top; }
    else if (range.includes('-')) {
      const [a, b, more] = range.split('-');
      if (more !== undefined) throw new Error(`${s.label}: “${range}” has more than one -.`);
      lo = val(a); hi = val(b);
      if (s.names === DOW && hi === 0 && lo > 0) hi = 7; // MON-SUN reads like 1-7
      if (lo > hi) throw new Error(`${s.label}: the range ${range} runs backwards.`);
    }
    else { lo = val(range); hi = stepText !== undefined ? top : lo; }
    for (let v = lo; v <= hi; v += step) out.add(s.names === DOW && v === 7 ? 0 : v); // 7 is Sunday too
  }
  // Only a step that divides the range repeats evenly: */45 runs at :00 and :45, so its minutes get listed.
  const every = /^\*\/\d+$/.test(text) ? Number(text.split('/')[1]) : 0;
  return { values: [...out].sort((a, b) => a - b), all: text === '*', star: text.startsWith('*'), every: every && (top - s.min + 1) % every === 0 ? every : 0 };
}

const name = (s: FieldSpec, v: number) => (s.names === MON ? MONTH_NAME[v - 1] : s.names === DOW ? DAY_NAME[v] : s.label === 'Day of month' ? ord(v) : String(v));
const isRun = (vals: number[]) => vals.length > 2 && vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);

function cronWords(f: CronField, s: FieldSpec): string {
  if (f.all) return `every ${s.unit}`;
  if (f.every) return `every ${f.every} ${s.units}`;
  if (isRun(f.values)) return `${name(s, f.values[0])} through ${name(s, f.values[f.values.length - 1])}`;
  return join(f.values.map((v) => name(s, v)));
}

function describeCron([mi, h, dom, mo, dw]: readonly CronField[]): string {
  let time: string;
  if (mi.all && h.all) time = 'Every minute';
  else if (mi.every && h.all) time = `Every ${mi.every} minutes`;
  else if (mi.values.length === 1 && h.all) time = mi.values[0] === 0 ? 'At the start of every hour' : `At ${mi.values[0]} minutes past every hour`;
  else if (mi.values.length === 1 && h.every) time = `At ${mi.values[0] === 0 ? 'the start of the hour' : `${mi.values[0]} minutes past the hour`}, every ${h.every} hours`;
  else if (!mi.star && !h.star && mi.values.length * h.values.length <= 6) time = `At ${join(h.values.flatMap((hv) => mi.values.map((mv) => `${pad(hv)}:${pad(mv)}`)))}`;
  else {
    const minutes = mi.all ? 'Every minute' : mi.every ? `Every ${mi.every} minutes` : `At minute ${join(mi.values.map(String))}`;
    const hours = h.all ? 'of every hour' : h.every ? `every ${h.every} hours` : isRun(h.values) ? `from ${pad(h.values[0])}:00 through ${pad(h.values[h.values.length - 1])}:59` : `in hours ${join(h.values.map(pad))}`;
    time = `${minutes}, ${hours}`;
  }
  // Any day field but * narrows the days. As in nextRuns, they join with OR only when neither starts with *.
  const domSet = !dom.all, dowSet = !dw.all, either = !dom.star && !dw.star;
  const domText = dom.every ? `every ${dom.every} days` : `on the ${cronWords(dom, CRON_SPEC[2])} of the month`;
  let days: string;
  if (domSet && dowSet) days = `${domText}, ${either ? 'or' : 'and'} on ${cronWords(dw, CRON_SPEC[4])}`;
  else if (domSet) days = domText;
  else if (dowSet) days = isRun(dw.values) ? cronWords(dw, CRON_SPEC[4]) : `on ${cronWords(dw, CRON_SPEC[4])}`;
  else days = 'every day';
  const months = mo.all ? '' : `, in ${cronWords(mo, CRON_SPEC[3])}`;
  return `${time}, ${days}${months}`;
}

export type CronResult =
  | { ok: true; typed: string; parts: string[]; fields: CronField[]; summary: string; words: string[] }
  | { ok: false; typed: string; message: string };

/** Reads a cron line as typed. `typed` is the line with spaces collapsed, which is what presets match and copy uses. */
export function parseCron(input: string): CronResult {
  const typed = input.trim().replace(/\s+/g, ' ');
  try {
    if (!typed) throw new Error('Type a cron line, or pick a preset.');
    let text = typed;
    if (text.startsWith('@')) {
      const macro = MACROS[text.toLowerCase()];
      if (!macro) throw new Error(`Unknown shortcut ${typed}. Try @hourly, @daily, @weekly, @monthly or @yearly.`);
      text = macro;
    }
    const parts = text.split(' ');
    if (parts.length !== 5) {
      throw new Error(parts.length === 6 || parts.length === 7
        ? `This line has ${parts.length} fields. Some schedulers add seconds or a year; this tool reads the standard five fields.`
        : `A cron line needs five fields: minute, hour, day of month, month and day of week. This one has ${parts.length}.`);
    }
    const fields = parts.map((p, i) => parseField(p, CRON_SPEC[i]));
    return { ok: true, typed, parts, fields, summary: describeCron(fields), words: fields.map((f, i) => cronWords(f, CRON_SPEC[i])) };
  } catch (e) {
    return { ok: false, typed, message: e instanceof Error ? e.message : String(e) };
  }
}

export const CRON_NEVER = 'This schedule has no run in the next five years. Check the day and month: 30 February, for example, never happens.';
export const CRON_FIX = 'Fix the cron line to read it back';

// Walk the job's own clock (UTC shifted by the zone offset) one day at a time, so rare dates are found quickly.
export function nextRuns([mi, h, dom, mo, dw]: readonly CronField[], off: number, now: number, count = 5): number[] {
  const domR = !dom.star, dowR = !dw.star;
  const out: number[] = [];
  const start = new Date(now + off * 36e5);
  const day0 = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  for (let d = 0; d < 366 * 5 && out.length < count; d++) {
    const day = new Date(day0 + d * 864e5);
    if (!mo.values.includes(day.getUTCMonth() + 1)) continue;
    const domOk = dom.values.includes(day.getUTCDate()), dowOk = dw.values.includes(day.getUTCDay());
    if (!(domR && dowR ? domOk || dowOk : domOk && dowOk)) continue; // standard cron: either day field when both are set
    for (const hv of h.values) for (const mv of mi.values) {
      const instant = day.getTime() + hv * 36e5 + mv * 6e4 - off * 36e5;
      if (instant > now && out.length < count) out.push(instant);
    }
  }
  return out;
}

const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatRun(ms: number, off: number): string {
  const t = new Date(ms + off * 36e5);
  return `${SHORT_DAY[t.getUTCDay()]} ${t.getUTCDate()} ${SHORT_MON[t.getUTCMonth()]} ${t.getUTCFullYear()}, ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;
}

/* ---------- What the page shows, shared by the prerender and the browser */

export const zoneWords = (zone: Zone) => (zone === 'dhaka' ? 'Dhaka time' : 'server time (UTC)');

/** Picks the headline size for a sentence of n characters. */
export const lenBucket = (n: number) => (n <= 40 ? 's' : n <= 64 ? 'm' : n <= 110 ? 'l' : 'xl');

export const BOARD_DATE_CELLS = 15;
export const BOARD_TIME_CELLS = 5;

/** "Mon 9 Nov 2026, 09:30" as fixed-width board text, day right-aligned so columns line up. No run is a blank row. */
export function boardChars(run?: string): string {
  if (!run) return ' '.repeat(BOARD_DATE_CELLS + BOARD_TIME_CELLS);
  const [date, time] = run.split(', ');
  const [dow, day, mon, yr] = date.split(' ');
  return `${dow} ${day.padStart(2, ' ')} ${mon} ${yr}`.padEnd(BOARD_DATE_CELLS, ' ') + time.padEnd(BOARD_TIME_CELLS, ' ');
}

export interface HeadView { code: string; words: string; error?: string }
export interface HeadsView { heads: HeadView[]; line: boolean }

const fieldIndex = (message: string) => CRON_SPEC.findIndex((s) => message.startsWith(`${s.label}:`));

/** The five timetable columns. `line` means the error is about the whole line rather than one field. */
export function readHeads(result: CronResult): HeadsView {
  const parts = result.ok ? result.parts : result.typed ? result.typed.split(' ') : [];
  const errors: Record<number, string> = {};
  let words = result.ok ? result.words : [];
  const line = !result.ok && fieldIndex(result.message) < 0;
  if (!result.ok && !line) {
    // parseCron stops at the first wrong field. Asking again with that field set to * finds the next
    // wrong field and gives the real words for the good ones.
    const probe = parts.slice();
    let q: CronResult = result;
    for (let n = 0; n < 5 && !q.ok; n++) {
      const at = fieldIndex(q.message);
      if (at < 0) break;
      errors[at] = q.message;
      probe[at] = '*';
      q = parseCron(probe.join(' '));
    }
    if (q.ok) words = q.words;
  }
  return {
    line,
    heads: CRON_SPEC.map((_, i) => {
      const part = parts[i] ?? '';
      const word = words[i] ?? ' ';
      // A single minute or hour reads the same as its digits, so name the unit instead of repeating it.
      return { code: part || ' ', words: i < 2 && word === part ? (i ? 'at hour ' : 'at minute ') + part : word, error: errors[i] };
    }),
  };
}
