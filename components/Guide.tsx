import type { Faq } from './Shell';
import { company, links, service } from '@/lib/site';

/** Shown on the page and in the FAQPage structured data, so the two always match. Behaviour follows lib/logic.ts. */
export const FAQ: readonly Faq[] = [
  {
    q: 'What does the cron expression 0 2 * * * mean?',
    a: 'It means 02:00 every day: minute 0, hour 2, and every day of the month, month and day of the week. On a server that keeps UTC, as most cloud servers do, that is 08:00 in Dhaka, because Bangladesh is six hours ahead of UTC and has no daylight saving time. The explainer lists the next five runs in both times.',
  },
  {
    q: 'What are the five fields in a cron line?',
    a: 'In order: minute (0 to 59), hour (0 to 23), day of month (1 to 31), month (1 to 12, or JAN to DEC) and day of week (0 to 7, or SUN to SAT, where 0 and 7 both mean Sunday). Each field takes one value, a range such as 1-5, a list such as 1,15, a step such as */15, or * for every value.',
  },
  {
    q: 'Does the explainer support seconds, Quartz syntax or @ shortcuts?',
    a: 'It reads standard five-field cron, as used by crontab, most CI schedulers and Kubernetes CronJobs. A line with six or seven fields, which adds seconds or a year, is flagged instead of guessed at, and so are Quartz extras such as L, W and ?. The shortcuts @hourly, @daily, @midnight, @weekly, @monthly, @yearly and @annually are expanded to five fields.',
  },
  {
    q: 'What happens when both day of month and day of week are set?',
    a: 'Standard cron runs the job on any day that matches either field, not only on days that match both. So 0 9 1 * 1 runs at 09:00 on the 1st of every month and also every Monday. When either day field starts with *, such as */2, the two are combined with AND instead. The plain-English reading says which rule applies.',
  },
  {
    q: 'Why does my cron job run at the wrong time?',
    a: 'Usually because the server clock is on UTC while the schedule was written in local time. A job set to 0 9 * * * on a UTC server runs at 15:00 in Dhaka, in the middle of the afternoon. Switch the job between server time and Dhaka time, and check the next five runs in both zones before you put the line into a crontab.',
  },
  {
    q: 'Is the Cron Schedule Explainer free, and is my cron line sent anywhere?',
    a: `It is free and needs no account or sign-up. The cron line is parsed and the run times are worked out in your browser, so nothing you type is sent to a server or saved. If a schedule can never run, such as one set for 30 February, it says so rather than showing an empty board. It is published by ${company.name}.`,
  },
];

export function Guide() {
  return (
    <section className="ph-guide below" aria-labelledby="guide-h">
      <div className="wrap ph-guide__grid">
        <div>
          <h2 id="guide-h">How to read a cron line</h2>
          <ol className="ph-steps">
            <li><p>Type or paste a cron line into the field, or start from a preset such as <strong>Weekdays at 09:30</strong>.</p></li>
            <li><p>Read the schedule in plain English, with each of the five fields explained under the line.</p></li>
            <li><p>Choose whether the job runs on server time (UTC) or on Dhaka time.</p></li>
            <li><p>Check the next five runs, listed in UTC and in Dhaka time, then copy the line into your crontab or scheduler.</p></li>
          </ol>
        </div>

        <div>
          <h2 id="faq-h">Cron questions</h2>
          <div className="ph-faq">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="ph-guide__more">
          This explainer is published by <a href={links.home}>{company.name}</a>, which also runs <a href={service('cloud-devops')}>cloud infrastructure and DevOps</a>, builds <a href={service('api-backend')}>APIs and backend services</a> with their scheduled jobs, and sets up <a href={service('ai-automation')}>AI and workflow automation</a>.
        </p>
      </div>
    </section>
  );
}
