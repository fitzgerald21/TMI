import { useState } from 'react';
import { go } from '../lib/router';

// The two families of obstacle (distraction and dullness) on one map, with the
// path the stages trace across it.

const STATES = [
  { id: 'forget', s: 1.2, c: 2.6, name: 'Forgetting & mind-wandering', stage: 2, text: 'A distraction pushes the breath out entirely, and attention goes off after thoughts. Overcome at stages 2–3 by appreciating the "aha!" and checking in.' },
  { id: 'strong', s: 2.2, c: 1.25, name: 'Strong dullness', stage: 4, text: 'The breath fades, blurs or distorts, dreamlike images drift in, and sleep is close. Antidotes: deeper breaths, posture, open the eyes a little. Overcome at stage 4.' },
  { id: 'gross', s: 2.4, c: 3.7, name: 'Gross distraction', stage: 4, text: 'The breath stays present but something else (pain, a plan, a memory) takes the foreground. Caught early with continuous introspective awareness at stage 4.' },
  { id: 'subtle-dull', s: 4.1, c: 2.2, name: 'Subtle dullness', stage: 5, text: 'Stable, pleasant, a little hazy. The breath is there but less vivid than it could be. Easy to mistake for good meditation. Overcome at stage 5 with body scanning.' },
  { id: 'subtle-dis', s: 3.8, c: 4.2, name: 'Subtle distraction', stage: 6, text: 'The breath is in the foreground, but attention keeps flicking to faint background objects. Subdued at stage 6 by giving them no attention at all.' },
  { id: 'exclusive', s: 4.85, c: 4.85, name: 'Exclusive attention, vivid mindfulness', stage: 7, text: 'Attention rests on the breath alone, bright and stable. From stage 7 on, it becomes effortless.' },
];
const PATH = [[1.3, 2.2], [1.9, 2.5], [2.7, 2.7], [3.5, 3.0], [4.2, 3.6], [4.6, 4.3], [4.9, 4.9]];

export function ObstacleMap() {
  const [sel, setSel] = useState('forget');
  const W = 360, H = 300, L = 40, R = 14, T = 14, B = 44;
  const x = (s: number) => L + ((s - 1) / 4) * (W - L - R);
  const y = (c: number) => T + (1 - (c - 1) / 4) * (H - T - B);
  const cur = STATES.find((s) => s.id === sel)!;
  const d = PATH.map((p, i) => `${i ? 'L' : 'M'} ${x(p[0])} ${y(p[1])}`).join(' ');
  return (
    <div className="explainer">
      <div className="map-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="obsmap" role="img" aria-label="Map of distraction and dullness">
          <defs>
            <linearGradient id="om-g" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="var(--aware)" stopOpacity="0.04" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="url(#om-g)" stroke="var(--line)" />
          <path d={d} className="om-path" />
          {PATH.slice(1).map((p, i) => (
            <text key={i} x={x(p[0])} y={y(p[1]) - 8} className="om-stage" textAnchor="middle">{i + 2}</text>
          ))}
          {STATES.map((s) => (
            <g key={s.id} className={`om-pt ${sel === s.id ? 'on' : ''}`} onClick={() => setSel(s.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSel(s.id)} aria-label={s.name}>
              <circle cx={x(s.s)} cy={y(s.c)} r="16" className="om-hit" />
              <circle cx={x(s.s)} cy={y(s.c)} r={sel === s.id ? 9 : 6.5} className="om-dot" />
            </g>
          ))}
          <text x={(L + W - R) / 2} y={H - 10} textAnchor="middle" className="scmap-axis">Stability: less distraction →</text>
          <text x={14} y={(T + H - B) / 2} textAnchor="middle" className="scmap-axis" transform={`rotate(-90 14 ${(T + H - B) / 2})`}>Clarity: less dullness →</text>
        </svg>
        <div className="om-card" aria-live="polite">
          <div className="eyebrow">Tap a point on the map</div>
          <h3 className="display">{cur.name}</h3>
          <p>{cur.text}</p>
          <button className="btn small ghost" onClick={() => go(`stage-${cur.stage}`)}>Stage {cur.stage} →</button>
        </div>
      </div>
      <div className="prose">
        <p>
          Every problem in the first seven stages is a form of either <b>distraction</b> (a lack of stability) or <b>dullness</b> (a lack of clarity). They tend to trade off against each other. Push hard for stability and the mind can go dull. Push hard for vividness and it gets restless.
        </p>
        <p>
          The dashed line is the general direction of the path. The numbers mark roughly where each stage's work happens. Your journal plots each sit you rate on this same map, so you can watch your own trajectory.
        </p>
      </div>
    </div>
  );
}
