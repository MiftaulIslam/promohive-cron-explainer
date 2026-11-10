import { CronEngine } from '@/components/CronEngine';
import { BOARD_DATE_CELLS, BOARD_TIME_CELLS, CRON_FIX, CRON_LABELS, lenBucket, parseCron, readHeads, zoneWords } from '@/lib/logic';

const SAMPLE = '30 9 * * 1-5';

const PRESETS = [
  { name: 'Every 15 minutes', cron: '*/15 * * * *' },
  { name: 'Every hour', cron: '0 * * * *' },
  { name: 'Daily at 02:00', cron: '0 2 * * *' },
  { name: 'Weekdays at 09:30', cron: SAMPLE },
  { name: 'Sundays at 03:00', cron: '0 3 * * 0' },
  { name: 'First of the month', cron: '0 6 1 * *' },
];

// 200 cells that React never updates, so they go in as one string instead of hundreds of elements to hydrate.
// The space in each cell is the text node the board writes its character into.
const cell = (kind: 'd' | 't') => `<span class="c c--${kind}"> <span class="f"></span></span>`;
const clock = `<span class="sr-only"></span><span class="flaps" aria-hidden="true"><span class="flaps__date">${cell('d').repeat(BOARD_DATE_CELLS)}</span><span class="flaps__time">${cell('t').repeat(BOARD_TIME_CELLS)}</span></span>`;
const BLANK_BOARD = `<tr><td class="is-utc">${clock}</td><td class="is-dhaka">${clock}</td></tr>`.repeat(5);

function sampleSummary() {
  const result = parseCron(SAMPLE);
  return result.ok ? result.summary : '';
}

export function CronStand() {
  const summary = sampleSummary();
  const zone = zoneWords('utc');
  const { heads } = readHeads(parseCron(SAMPLE));

  return (
    // method="dialog" makes Enter in the field a no-op even before the page's JavaScript has loaded.
    <form className="wrap stand" id="c-form" method="dialog" noValidate autoComplete="off">
      <div className="stand__head">
        <h1 className="line__name">Cron Schedule Explainer</h1>
        <p className="stand__intro">A free cron expression explainer for developers and anyone scheduling jobs or backups. It reads a cron line back in plain English and lists the next runs in UTC and Dhaka time. No sign-up, and it runs in your browser.</p>
      </div>

      <div className="line">
        <div className="line__top">
          <div className="line__label">
            <label htmlFor="c-expr">Cron line</label>
            <p id="c-expr-hint">Five fields: minute, hour, day of month, month, day of week. Shortcuts such as @daily work too.</p>
          </div>
          <button type="button" className="ph-btn copy" data-cron-copy=""><span id="c-copy-label">Copy cron line</span></button>
        </div>
        <input id="c-expr" name="expr" className="line__input" type="text" defaultValue={SAMPLE} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} inputMode="text" aria-describedby="c-expr-hint c-expr-msg" aria-invalid={false} />
      </div>

      <div className="heads-wrap">
        <dl className="heads" id="c-fields">
          {heads.map((head, i) => (
            <div className="head" key={CRON_LABELS[i]}>
              <dt>{CRON_LABELS[i]}</dt>
              <dd><code>{head.code}</code><span className="head__words">{head.words}</span><span className="head__err" /></dd>
            </div>
          ))}
        </dl>
        <p className="heads__msg" id="c-expr-msg" role="status" />
      </div>

      <div className="stage">
        <div className="read">
          <p className="read__say" id="c-say" data-len={lenBucket(`${summary}, ${zone}`.length)} aria-live="polite" aria-atomic="true">{summary}, <span className="read__zone">{zone}</span></p>
        </div>

        <fieldset className="routes">
          <legend>Start from a preset</legend>
          <ul>
            {PRESETS.map((p) => (
              <li key={p.cron}><button type="button" className="route" data-cron={p.cron} aria-pressed={p.cron === SAMPLE}><span>{p.name}</span><code>{p.cron}</code></button></li>
            ))}
          </ul>
        </fieldset>

        <div className="depart">
          <fieldset className="clock">
            <legend>The job runs on</legend>
            <div className="clock__track" id="c-zone" data-sel="utc">
              <button type="button" data-zone="utc" aria-pressed>Server time (UTC)</button>
              <button type="button" data-zone="dhaka" aria-pressed={false}>Dhaka time (UTC+6)</button>
            </div>
          </fieldset>

          <div className="board" id="c-board" data-zone="utc">
            <table>
              <caption>Next five runs</caption>
              <thead><tr><th scope="col" data-col="utc">UTC</th><th scope="col" data-col="dhaka">Dhaka (UTC+6)</th></tr></thead>
              <tbody id="c-runs" aria-live="polite" dangerouslySetInnerHTML={{ __html: BLANK_BOARD }} />
            </table>
            <p className="board__note" id="c-idle" hidden>{CRON_FIX}</p>
            <p className="board__note" id="c-error" role="status" hidden />
          </div>
        </div>
      </div>

      <CronEngine />
    </form>
  );
}
