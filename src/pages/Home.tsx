import { STAGES, MILESTONES, stageByN } from '../content/stages';
import { QUOTES_OWN } from '../content/concepts';
import { useStore, streak, dayKey } from '../lib/store';
import { SceneCanvas } from '../visual/SceneCanvas';
import { useStart } from '../App';
import { buildGuided } from '../session/script';
import { go } from '../lib/router';

export function Home() {
  const stage = useStore((s) => s.stage);
  const sessions = useStore((s) => s.sessions);
  const minutes = useStore((s) => s.settings.defaultMinutes);
  const start = useStart();
  const st = stageByN(stage);
  const str = streak(sessions);
  const today = dayKey(new Date());
  const satToday = sessions.some((s) => dayKey(new Date(s.date)) === today);
  const weekMin = Math.round(
    sessions.filter((s) => Date.now() - new Date(s.date).getTime() < 7 * 864e5).reduce((a, s) => a + s.minutes, 0)
  );
  const quote = QUOTES_OWN[Math.floor(Date.now() / 864e5) % QUOTES_OWN.length];
  const hour = new Date().getHours();
  const greet = hour < 5 ? 'Still night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page home">
      <section className="today">
        <div className="today-scene">
          <SceneCanvas className="fill" input={{ mode: st.heroVisual, progress: 0.3, preview: true }} />
          <div className="today-overlay">
            <div className="eyebrow">{greet} · your stage</div>
            <h1 className="display xl">
              <span className="stage-num">{st.n}</span>
              {st.short}
            </h1>
            <p className="lede">{st.essence}</p>
            <div className="row">
              <button className="btn primary big" onClick={() => start(buildGuided(stage, minutes))}>
                Begin a {minutes}-minute sit
              </button>
              <a className="btn ghost" href={`#stage-${stage}`}>Study stage {stage}</a>
            </div>
          </div>
        </div>
        <div className="today-stats">
          <div className="stat">
            <span className="stat-n tabnum">{str}</span>
            <span className="stat-l">day streak{satToday ? ' · sat today' : ''}</span>
          </div>
          <div className="stat">
            <span className="stat-n tabnum">{weekMin}</span>
            <span className="stat-l">minutes this week</span>
          </div>
          <div className="stat quote">
            <span className="q">{quote}</span>
          </div>
        </div>
      </section>

      <section className="path-sec">
        <div className="sec-head">
          <h2 className="display">The path</h2>
          <a className="link" href="#finder">Not sure where you are? Find your stage →</a>
        </div>
        <PathMap current={stage} />
      </section>
    </div>
  );
}

type Row = { kind: 'stage'; n: number } | { kind: 'milestone'; n: number };

export function PathMap({ current }: { current: number }) {
  const rows: Row[] = [];
  for (const s of STAGES) {
    rows.push({ kind: 'stage', n: s.n });
    const m = MILESTONES.find((m) => m.after === s.n);
    if (m) rows.push({ kind: 'milestone', n: m.n });
  }
  const RH = 92;
  const H = rows.length * RH;
  const xs = rows.map((_, i) => 40 + Math.sin(i * 0.9) * 18);
  const ys = rows.map((_, i) => i * RH + RH / 2);
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < rows.length; i++) {
    const my = (ys[i - 1] + ys[i]) / 2;
    d += ` C ${xs[i - 1]} ${my}, ${xs[i]} ${my}, ${xs[i]} ${ys[i]}`;
  }
  const curRow = rows.findIndex((r) => r.kind === 'stage' && r.n === current);
  let dDone = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i <= curRow; i++) {
    const my = (ys[i - 1] + ys[i]) / 2;
    dDone += ` C ${xs[i - 1]} ${my}, ${xs[i]} ${my}, ${xs[i]} ${ys[i]}`;
  }
  let phase = '';
  return (
    <div className="pathmap" style={{ height: H }}>
      <svg className="pathmap-line" viewBox={`0 0 80 ${H}`} width="80" height={H} aria-hidden="true">
        <path d={d} className="path-all" />
        <path d={dDone} className="path-done" />
        {rows.map((r, i) =>
          r.kind === 'stage' ? (
            <g key={i} className={`node ${r.n < current ? 'done' : r.n === current ? 'cur' : ''}`}>
              {r.n === current && <circle cx={xs[i]} cy={ys[i]} r="22" className="node-halo" />}
              <circle cx={xs[i]} cy={ys[i]} r="15" className="node-c" />
              <text x={xs[i]} y={ys[i] + 5} textAnchor="middle" className="node-t">{r.n}</text>
            </g>
          ) : (
            <g key={i} className={`mnode ${MILESTONES[r.n - 1].after < current ? 'done' : ''}`}>
              <rect x={xs[i] - 8} y={ys[i] - 8} width="16" height="16" transform={`rotate(45 ${xs[i]} ${ys[i]})`} />
            </g>
          )
        )}
      </svg>
      <ol className="pathmap-rows">
        {rows.map((r, i) => {
          if (r.kind === 'milestone') {
            const m = MILESTONES[r.n - 1];
            return (
              <li key={i} className="prow milestone" style={{ height: RH }}>
                <div>
                  <div className="eyebrow">Milestone {m.n}</div>
                  <div className="prow-title">{m.title}</div>
                </div>
              </li>
            );
          }
          const s = STAGES[r.n - 1];
          const showPhase = s.phase !== phase;
          phase = s.phase;
          return (
            <li key={i} className={`prow ${s.n === current ? 'cur' : ''}`} style={{ height: RH }}>
              <button onClick={() => go(`stage-${s.n}`)}>
                <div className="eyebrow">
                  Stage {s.n}
                  {showPhase && <span className="phase-tag">{s.phase === 'Transition' ? 'Transition' : `${s.phase} meditator`}</span>}
                  {s.n === current && <span className="you">you are here</span>}
                </div>
                <div className="prow-title">{s.short}</div>
                <div className="prow-sub">{s.goal}</div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
