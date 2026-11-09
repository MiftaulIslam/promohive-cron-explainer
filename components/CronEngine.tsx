'use client';

import { useEffect } from 'react';
import { calm, copyText } from '@/components/client';
import { boardChars, CRON_FIX, CRON_NEVER, formatRun, lenBucket, nextRuns, parseCron, readHeads, ZONE_OFFSET, zoneWords, type CronResult, type Zone } from '@/lib/logic';

const COPY_IDLE = 'Copy cron line', COPY_DONE = 'Copied', COPY_FAILED = 'Copy failed, select the text instead';

interface Cell { el: HTMLElement; text: Text; flap: HTMLElement; ch: string }

const setText = (el: Element, text: string) => { if (el.textContent !== text) el.textContent = text; };

function wire() {
  const by = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const form = by('c-form'), input = by<HTMLInputElement>('c-expr'), msg = by('c-expr-msg'), say = by('c-say'), runsEl = by('c-runs'), board = by('c-board');
  const idle = by('c-idle'), err = by('c-error'), track = by('c-zone'), dl = by('c-fields'), copyLabel = by('c-copy-label');
  const copyBtn = form.querySelector<HTMLButtonElement>('[data-cron-copy]')!;
  const heads = [...dl.querySelectorAll('.head')].map((el) => ({ el, code: el.querySelector('code')!, words: el.querySelector('.head__words')!, err: el.querySelector('.head__err')! }));
  const routes = [...form.querySelectorAll<HTMLElement>('.route')];
  const zones = [...form.querySelectorAll<HTMLElement>('button[data-zone]')];

  const rows = [...runsEl.children].map((tr) => [...tr.children].map((td) => ({
    sr: td.firstElementChild!,
    cells: [...td.querySelectorAll<HTMLElement>('.c')].map((el): Cell => {
      const text = el.firstChild as Text;
      return { el, text, flap: el.lastElementChild as HTMLElement, ch: text.data.trim() };
    }),
  })));

  let zone: Zone = 'utc';
  let result: CronResult = parseCron(input.value);
  let shownSay = say.textContent ?? '';
  let painted = false;

  /* ---------- Board */
  const setCell = (c: Cell, ch: string, delay: number, flap: boolean) => {
    if (c.ch === ch) return;
    const old = c.ch;
    c.ch = ch;
    c.text.data = ch;
    if (!flap) { c.el.classList.remove('f1', 'f2'); return; }
    c.el.dataset.o = c.flap.dataset.o = old;
    c.flap.dataset.n = ch;
    c.flap.style.setProperty('--d', `${delay}ms`);
    // Swapping between two identical keyframes restarts a running flap without forcing a reflow.
    const restart = c.el.classList.contains('f1');
    c.el.classList.toggle('f1', !restart);
    c.el.classList.toggle('f2', restart);
  };

  const paintRuns = () => {
    const runs = result.ok ? nextRuns(result.fields, ZONE_OFFSET[zone], Date.now()) : [];
    const flap = painted && !calm() && !document.hidden;
    rows.forEach((clocks, y) => {
      const t = runs[y];
      clocks.forEach((clock, side) => {
        const text = t === undefined ? '' : formatRun(t, side === 0 ? 0 : ZONE_OFFSET.dhaka);
        setText(clock.sr, text);
        const chars = boardChars(text);
        clock.cells.forEach((c, i) => setCell(c, chars[i] === ' ' ? '' : chars[i], (side * 20 + i) * 5 + y * 6, flap));
      });
    });
    const never = result.ok && runs.length === 0;
    idle.hidden = result.ok;
    err.hidden = !never;
    setText(err, never ? CRON_NEVER : '');
    painted = true;
  };

  /* ---------- Reading the line */
  const paintHeads = () => {
    const view = readHeads(result);
    heads.forEach((h, i) => {
      const head = view.heads[i];
      setText(h.code, head.code);
      setText(h.words, head.words);
      setText(h.err, head.error ?? '');
      h.el.classList.toggle('is-bad', head.error !== undefined);
    });
    dl.classList.toggle('is-line', view.line);
    msg.classList.toggle('is-field', !result.ok && !view.line);
  };

  const paintSay = () => {
    if (!result.ok) {
      setText(say, CRON_FIX);
      say.classList.add('is-bad');
      say.dataset.len = 's';
      shownSay = '';
      return;
    }
    const words = zoneWords(zone);
    const full = `${result.summary}, ${words}`;
    if (shownSay !== full) {
      say.textContent = `${result.summary}, `;
      const z = document.createElement('span');
      z.className = 'read__zone';
      z.textContent = words;
      say.append(z);
      shownSay = full;
    }
    say.classList.remove('is-bad');
    say.dataset.len = lenBucket(full.length);
  };

  /* ---------- Fit the line to the width */
  // Width and limits only change on resize, so a keystroke computes from these and never reads layout.
  const lineBox = input.parentElement!;
  const ctx = document.createElement('canvas').getContext('2d');
  let ratio = 0.56, width = 0, min = 0, max = 0, fs = '';
  if (ctx) {
    ctx.font = `100px ${getComputedStyle(input).fontFamily}`;
    ratio = ctx.measureText('0').width / 100 || ratio;
  }
  const fit = () => {
    if (!width) return;
    const chars = Math.max(input.value.length, 12) + 0.6;
    const next = `${Math.max(min, Math.min(max, width / (chars * ratio))).toFixed(2)}px`;
    if (next !== fs) input.style.setProperty('--fs', fs = next);
  };
  const resize = new ResizeObserver(([entry]) => {
    const cs = getComputedStyle(lineBox);
    width = entry.contentRect.width;
    max = parseFloat(cs.getPropertyValue('--fs-max'));
    min = parseFloat(cs.getPropertyValue('--fs-min'));
    fit();
  });
  resize.observe(input);

  /* ---------- Render */
  const render = () => {
    result = parseCron(input.value);
    fit();
    input.setAttribute('aria-invalid', String(!result.ok));
    setText(msg, result.ok ? '' : result.message);
    paintHeads();
    paintSay();
    paintRuns();
    copyBtn.disabled = !result.ok;
    routes.forEach((r) => r.setAttribute('aria-pressed', String(r.dataset.cron === result.typed)));
  };

  /* ---------- Events */
  const stop = new AbortController();
  const { signal } = stop;
  let copyTimer = 0;

  const copy = async () => {
    if (!result.ok) return;
    const ok = await copyText(result.typed);
    if (signal.aborted) return;
    copyLabel.textContent = ok ? COPY_DONE : COPY_FAILED;
    clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => { copyLabel.textContent = COPY_IDLE; }, 1800);
  };

  input.addEventListener('input', render, { signal });
  runsEl.addEventListener('animationend', (e) => (e.target as Element).parentElement!.classList.remove('f1', 'f2'), { signal });

  form.addEventListener('click', (e) => {
    const target = e.target as Element;
    const route = target.closest<HTMLElement>('.route');
    if (route) {
      input.value = route.dataset.cron!;
      render();
      // Keep the keyboard closed on touch screens, where this focus would jump the page.
      if (matchMedia('(pointer: fine)').matches) input.focus({ preventScroll: true });
      return;
    }
    const zoneBtn = target.closest<HTMLElement>('button[data-zone]');
    if (zoneBtn) {
      zone = zoneBtn.dataset.zone as Zone;
      zones.forEach((o) => o.setAttribute('aria-pressed', String(o === zoneBtn)));
      track.dataset.sel = zone;
      board.dataset.zone = zone;
      render();
      return;
    }
    if (target.closest('[data-cron-copy]')) void copy();
  }, { signal });

  // A run in the past is no longer a next run, so the board is re-read on each new minute while anyone can see it.
  let tick = 0;
  const schedule = () => {
    tick = window.setTimeout(() => { paintRuns(); schedule(); }, 60000 - (Date.now() % 60000) + 50);
  };
  document.addEventListener('visibilitychange', () => {
    clearTimeout(tick);
    if (document.hidden) return;
    paintRuns();
    schedule();
  }, { signal });
  if (!document.hidden) schedule();

  render();

  return () => {
    stop.abort();
    resize.disconnect();
    clearTimeout(tick);
    clearTimeout(copyTimer);
  };
}

/** Everything on the stand is prerendered; this attaches behaviour to that markup and renders nothing itself. */
export function CronEngine() {
  useEffect(wire, []);
  return null;
}
