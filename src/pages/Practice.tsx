import { useMemo, useState } from 'react';
import { STAGES } from '../content/stages';
import { updateSettings, useStore, type GuidanceLevel } from '../lib/store';
import { buildDrill, buildGuided, buildMetta, buildTimer, buildWalking, DRILLS } from '../session/script';
import { stillFrame } from '../visual/scene';
import { useStart } from '../App';

const DURS = [5, 10, 15, 20, 30, 45, 60];
const GUIDE: { v: GuidanceLevel; l: string; d: string }[] = [
  { v: 'full', l: 'Full guidance', d: 'Spoken instructions and reminders' },
  { v: 'light', l: 'Light', d: 'Short cues and chimes only' },
  { v: 'bells', l: 'Bells only', d: 'Silence, with chimes at each step' },
];

export function Practice() {
  const stage = useStore((s) => s.stage);
  const settings = useStore((s) => s.settings);
  const start = useStart();
  const [st, setSt] = useState(stage);
  const [mins, setMins] = useState(settings.defaultMinutes);
  const [walkMin, setWalkMin] = useState(10);
  const [mettaMin, setMettaMin] = useState(12);
  const [timerMin, setTimerMin] = useState(20);
  const [interval, setIntervalMin] = useState(5);

  const plan = useMemo(() => buildGuided(st, mins), [st, mins]);
  const total = plan.segments.reduce((a, s) => a + s.dur, 0);
  const s = STAGES[st - 1];

  return (
    <div className="page practice">
      <h1 className="display xl">Practice</h1>

      <section className="sit-builder">
        <div className="sb-controls">
          <div className="field">
            <span className="k">Stage</span>
            <div className="stage-pills" role="radiogroup" aria-label="Stage">
              {STAGES.map((x) => (
                <button key={x.n} role="radio" aria-checked={st === x.n} className={st === x.n ? 'on' : ''} onClick={() => setSt(x.n)} title={x.short}>
                  {x.n}
                </button>
              ))}
            </div>
            <p className="muted small">{s.short}: {s.goal}</p>
          </div>
          <div className="field">
            <span className="k">Length</span>
            <div className="chips">
              {DURS.map((d) => (
                <button key={d} className={`chip ${mins === d ? 'on' : ''}`} onClick={() => { setMins(d); updateSettings({ defaultMinutes: d }); }}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="k">Guidance</span>
            <div className="seg-choice">
              {GUIDE.map((g) => (
                <button key={g.v} className={settings.guidance === g.v ? 'on' : ''} onClick={() => updateSettings({ guidance: g.v })}>
                  <b>{g.l}</b>
                  <span>{g.d}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="toggle">
            <input id="prep-toggle" type="checkbox" checked={settings.prep} onChange={(e) => updateSettings({ prep: e.target.checked })} />
            <span>Start with the six preparation steps</span>
          </label>
          <button className="btn primary big" onClick={() => start(buildGuided(st, mins))}>
            Begin {mins}-minute stage {st} sit
          </button>
        </div>

        <div className="sb-plan">
          <span className="k">The sit, step by step</span>
          <div className="timeline" aria-hidden="true">
            {plan.segments.map((g) => (
              <span key={g.id} className={`tl tl-${g.phase.toLowerCase()}`} style={{ flexGrow: g.dur }} />
            ))}
          </div>
          <ol className="seglist">
            {plan.segments.map((g) => (
              <li key={g.id}>
                <span className={`dot tl-${g.phase.toLowerCase()}`} />
                <span className="seg-name">
                  {g.title}
                  <small>{g.phase}</small>
                </span>
                <span className="muted tabnum">{Math.round(g.dur / 60) || '<1'} min</span>
              </li>
            ))}
          </ol>
          <p className="muted small">{Math.round(total / 60)} minutes total</p>
        </div>
      </section>

      <section>
        <div className="sec-head">
          <h2 className="display">Technique drills</h2>
          <p className="muted">Short sits that isolate one skill.</p>
        </div>
        <div className="drills">
          {DRILLS.map((d) => (
            <button className="drill" key={d.id} onClick={() => start(buildDrill(d.id))}>
              <img src={stillFrame(d.visual, 360, 200)} alt="" />
              <span className="drill-meta">
                <span className="eyebrow">Stage {d.stage} · {d.minutes} min</span>
                <b>{d.name}</b>
                <span className="muted small">{d.blurb}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display">Other practices</h2>
        <div className="others">
          <div className="other">
            <img src={stillFrame('walk', 360, 200, { walk: 3 })} alt="" />
            <div className="other-body">
              <h3>Walking meditation</h3>
              <p className="muted small">Lift, move, place. A moving practice to balance sitting, and a good remedy for dullness.</p>
              <MinChips id="walk" value={walkMin} set={setWalkMin} opts={[5, 10, 15, 20]} />
              <button className="btn small" onClick={() => start(buildWalking(walkMin))}>Begin walking</button>
            </div>
          </div>
          <div className="other">
            <img src={stillFrame('metta', 360, 200, { metta: 3 })} alt="" />
            <div className="other-body">
              <h3>Loving-kindness</h3>
              <p className="muted small">Warm wishes for yourself and others, circle by circle. A remedy for aversion and self-judgment.</p>
              <MinChips id="metta" value={mettaMin} set={setMettaMin} opts={[6, 12, 18, 24]} />
              <button className="btn small" onClick={() => start(buildMetta(mettaMin))}>Begin loving-kindness</button>
            </div>
          </div>
          <div className="other">
            <img src={stillFrame('still', 360, 200)} alt="" />
            <div className="other-body">
              <h3>Silent timer</h3>
              <p className="muted small">No guidance. A bell to start and end, with optional interval chimes.</p>
              <MinChips id="timer" value={timerMin} set={setTimerMin} opts={[10, 20, 30, 45, 60]} />
              <div className="row small-gap">
                <span className="muted small">Chime every</span>
                <MinChips id="int" value={interval} set={setIntervalMin} opts={[0, 5, 10, 15]} fmt={(v) => (v ? `${v} min` : 'never')} />
              </div>
              <button className="btn small" onClick={() => start(buildTimer(timerMin, interval))}>Begin silent sit</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MinChips({ value, set, opts, fmt }: { id: string; value: number; set: (n: number) => void; opts: number[]; fmt?: (n: number) => string }) {
  return (
    <div className="chips tight">
      {opts.map((o) => (
        <button key={o} className={`chip ${value === o ? 'on' : ''}`} onClick={() => set(o)}>
          {fmt ? fmt(o) : `${o} min`}
        </button>
      ))}
    </div>
  );
}
