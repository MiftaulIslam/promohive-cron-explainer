function Dial({ time, handTurn, place }: { time: string; handTurn: number; place: string }) {
  return (
    <figure className="dial">
      <svg viewBox="0 0 200 200" role="img" aria-label={`Clock showing ${time}`}>
        <circle cx="100" cy="100" r="97" className="dial__face" />
        <circle cx="100" cy="100" r="86" className="dial__min" pathLength={60} strokeDasharray=".14 .86" strokeDashoffset=".07" />
        <circle cx="100" cy="100" r="82" className="dial__hr" pathLength={12} strokeDasharray=".1 .9" strokeDashoffset=".05" />
        <rect x="95" y="52" width="10" height="56" rx="1" className="dial__hand" transform={`rotate(${handTurn} 100 100)`} />
        <rect x="96.5" y="26" width="7" height="82" rx="1" className="dial__hand" />
        <circle cx="100" cy="100" r="7" className="dial__hand" />
      </svg>
      <figcaption><span className="dial__t">{time}</span><span>{place}</span></figcaption>
    </figure>
  );
}

export function Poster() {
  return (
    <section className="poster below" aria-labelledby="poster-h">
      <div className="wrap poster__in">
        <h2 id="poster-h" data-in=""><code>0 2 * * *</code> on a UTC server fires at 8 in the morning in Dhaka</h2>

        <div className="poster__pair" data-in="" style={{ '--i': 1 }}>
          <Dial time="02:00" handTurn={60} place="UTC, on the server" />
          <p className="poster__same" aria-hidden="true"><span>Same instant</span></p>
          <Dial time="08:00" handTurn={240} place="Dhaka, in the middle of the working day" />
        </div>

        <div className="poster__copy" data-in="" style={{ '--i': 2 }}>
          <p>A backup job is set to <code>0 2 * * *</code> on a server that runs on UTC, so it fires at 8 in the morning in Dhaka, in the middle of the working day.</p>
          <p>Cron lines are short and easy to misread, and the mistake usually shows up as a slow site or a missed report. Seeing the schedule in words and in local time catches it before it runs.</p>
        </div>
      </div>
    </section>
  );
}

export function Reference() {
  return (
    <section className="ref wrap below" aria-labelledby="ref-h">
      <h2 id="ref-h" data-in="">What the fields accept</h2>

      <div className="ref__sheet" data-in="" style={{ '--i': 1 }}>
        <table>
          <caption className="sr-only">Values a cron field accepts, with an example of how each one reads back</caption>
          <thead>
            <tr><th scope="col">Write</th><th scope="col">It is</th><th scope="col">Example</th><th scope="col">Reads back as</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row"><code>*</code></th><td>Every value in the field</td><td><code>*</code> in Minute</td><td>every minute</td></tr>
            <tr><th scope="row"><code>1-5</code></th><td>A range</td><td><code>1-5</code> in Day of week</td><td>Monday through Friday</td></tr>
            <tr><th scope="row"><code>*/15</code></th><td>A step</td><td><code>*/15</code> in Minute</td><td>every 15 minutes</td></tr>
            <tr><th scope="row"><code>1,15</code></th><td>A list</td><td><code>1,15</code> in Day of month</td><td>1st and 15th</td></tr>
            <tr><th scope="row"><code>MON</code> to <code>SUN</code></th><td>Day names</td><td><code>SAT,SUN</code> in Day of week</td><td>Sunday and Saturday</td></tr>
            <tr><th scope="row"><code>JAN</code> to <code>DEC</code></th><td>Month names</td><td><code>JAN-MAR</code> in Month</td><td>January through March</td></tr>
            <tr><th scope="row"><code>@daily</code></th><td>A shortcut for the whole line. <code>@hourly</code>, <code>@weekly</code>, <code>@monthly</code> and <code>@yearly</code> work too</td><td><code>@daily</code> on its own</td><td>At 00:00, every day</td></tr>
          </tbody>
        </table>

        <ol className="ref__notes">
          <li><span className="ref__mark" aria-hidden="true">a</span>Standard five-field cron. When both day of month and day of week are restricted, a run happens when either one matches.</li>
          <li><span className="ref__mark" aria-hidden="true">b</span>Values out of range, the wrong number of fields and unknown names are flagged with the field they are in.</li>
          <li><span className="ref__mark" aria-hidden="true">c</span>Runs in your browser. Nothing is saved or sent anywhere.</li>
        </ol>
      </div>
    </section>
  );
}

export function Who() {
  return (
    <section className="who below" aria-labelledby="who-h">
      <div className="wrap who__in">
        <h2 id="who-h" data-in="">Who it is for</h2>
        <div className="who__a" data-in="" style={{ '--i': 1 }}>
          <h3>Developers and DevOps engineers</h3>
          <p>Check a schedule before it goes into a crontab, a CI job or a Kubernetes CronJob.</p>
        </div>
        <div className="who__b" data-in="" style={{ '--i': 2 }}>
          <h3>Teams running automations</h3>
          <p>Confirm when reports, syncs and backups really run in local time.</p>
        </div>
      </div>
    </section>
  );
}
