import { useEffect, useRef, useState } from 'react';

// The moments-of-consciousness model: experience as a rapid string of discrete mind-moments.

type Kind = 'breath' | 'other' | 'aware' | 'mind' | 'empty';
const COLORS: Record<Kind, string> = {
  breath: '#f2c46d',
  other: '#f09696',
  aware: '#8fa3e6',
  mind: '#78d6c8',
  empty: '#3a3f5c',
};
const NAMES: Record<Kind, string> = {
  breath: 'Attention on the breath',
  other: 'Attention elsewhere',
  aware: 'Peripheral awareness (senses)',
  mind: 'Awareness of the mind',
  empty: 'Non-perceiving (dullness)',
};

const PRESETS = {
  'Drowsy': { dull: 0.65, distract: 0.4, intro: 0.05 },
  'Mind-wandering': { dull: 0.2, distract: 0.85, intro: 0.03 },
  'Stage 4': { dull: 0.2, distract: 0.25, intro: 0.2 },
  'Stage 7': { dull: 0.02, distract: 0.02, intro: 0.4 },
};

export function Moments() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [dull, setDull] = useState(0.3);
  const [distract, setDistract] = useState(0.4);
  const [intro, setIntro] = useState(0.1);
  const [counts, setCounts] = useState<Record<Kind, number>>({ breath: 0, other: 0, aware: 0, mind: 0, empty: 0 });
  const p = useRef({ dull, distract, intro });
  p.current = { dull, distract, intro };

  useEffect(() => {
    const cv = ref.current!;
    const c = cv.getContext('2d')!;
    let raf = 0, last = 0, acc = 0;
    const beads: { k: Kind; x: number }[] = [];
    const recent: Kind[] = [];
    let frame = 0;
    const pick = (): Kind => {
      const { dull, distract, intro } = p.current;
      if (Math.random() < dull) return 'empty';
      const r = Math.random();
      // of perceiving moments: roughly half attention, half awareness
      if (r < 0.5) return Math.random() < distract ? 'other' : 'breath';
      return Math.random() < intro ? 'mind' : 'aware';
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const gap = 18;
      const speed = 70;
      acc += dt * speed;
      while (acc >= gap) {
        acc -= gap;
        const k = pick();
        beads.push({ k, x: w + gap });
        recent.push(k);
        if (recent.length > 100) recent.shift();
      }
      for (const b of beads) b.x -= dt * speed;
      while (beads.length && beads[0].x < -20) beads.shift();
      c.fillStyle = '#0c0e1b';
      c.fillRect(0, 0, w, h);
      const y = h / 2;
      c.strokeStyle = 'rgba(143,163,230,0.15)';
      c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      for (const b of beads) {
        const col = COLORS[b.k];
        const big = b.k === 'breath' || b.k === 'other';
        const r = big ? 6.5 : 4.5;
        const by = big ? y : y + (b.k === 'empty' ? 0 : 0);
        if (b.k === 'empty') {
          c.strokeStyle = col; c.lineWidth = 1.2;
          c.beginPath(); c.arc(b.x, by, r, 0, 7); c.stroke();
        } else {
          if (big) {
            const g = c.createRadialGradient(b.x, by, 0, b.x, by, r * 3);
            g.addColorStop(0, col + '88'); g.addColorStop(1, col + '00');
            c.fillStyle = g; c.beginPath(); c.arc(b.x, by, r * 3, 0, 7); c.fill();
          }
          c.fillStyle = col; c.beginPath(); c.arc(b.x, by, r, 0, 7); c.fill();
        }
      }
      // "now" marker
      c.fillStyle = 'rgba(200,204,230,0.5)';
      c.font = '500 11px Figtree, system-ui, sans-serif';
      c.textAlign = 'right';
      c.fillText('now →', w - 8, 16);
      c.textAlign = 'left';
      c.fillText('← past', 8, 16);
      if (++frame % 15 === 0) {
        const n: Record<Kind, number> = { breath: 0, other: 0, aware: 0, mind: 0, empty: 0 };
        recent.forEach((k) => n[k]++);
        setCounts(n);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const perceiving = Math.round(((total - counts.empty) / total) * 100);
  const onBreath = Math.round((counts.breath / total) * 100);

  return (
    <div className="explainer">
      <div className="sim">
        <canvas ref={ref} className="sim-canvas short" aria-label="A stream of moments of consciousness" />
        <div className="legend">
          {(Object.keys(COLORS) as Kind[]).map((k) => (
            <span key={k}><i style={{ background: k === 'empty' ? 'transparent' : COLORS[k], borderColor: COLORS[k] }} />{NAMES[k]}</span>
          ))}
        </div>
      </div>
      <div className="meters">
        <div className="meter">
          <span className="k">Mindfulness power</span>
          <span className="meter-n tabnum">{perceiving}%</span>
          <span className="meter-bar"><i style={{ width: `${perceiving}%` }} /></span>
          <span className="muted small">of the last 100 moments perceived anything at all</span>
        </div>
        <div className="meter">
          <span className="k">Stability on the breath</span>
          <span className="meter-n tabnum">{onBreath}%</span>
          <span className="meter-bar gold"><i style={{ width: `${onBreath * 2}%` }} /></span>
          <span className="muted small">of moments were attention on the breath</span>
        </div>
      </div>
      <div className="sim-controls">
        <label className="slider" htmlFor="mo-dull">
          <span>Dullness <em>{Math.round(dull * 100)}%</em></span>
          <input id="mo-dull" type="range" min={0} max={0.8} step={0.01} value={dull} onChange={(e) => setDull(+e.target.value)} />
        </label>
        <label className="slider" htmlFor="mo-dis">
          <span>Distraction <em>{Math.round(distract * 100)}%</em></span>
          <input id="mo-dis" type="range" min={0} max={1} step={0.01} value={distract} onChange={(e) => setDistract(+e.target.value)} />
        </label>
        <label className="slider" htmlFor="mo-intro">
          <span>Introspective awareness <em>{Math.round(intro * 100)}%</em></span>
          <input id="mo-intro" type="range" min={0} max={0.6} step={0.01} value={intro} onChange={(e) => setIntro(+e.target.value)} />
        </label>
        <div className="chips">
          {Object.entries(PRESETS).map(([k, v]) => (
            <button key={k} className="chip" onClick={() => { setDull(v.dull); setDistract(v.distract); setIntro(v.intro); }}>{k}</button>
          ))}
        </div>
      </div>
      <div className="prose">
        <p>
          One useful model treats conscious experience as a rapid sequence of discrete moments. Each one is a moment of seeing, hearing, touching, tasting, smelling, or knowing something mental. Each is either an <b className="gold">attention</b> moment, focused and analytical, or an <b className="aware">awareness</b> moment, broad and holistic.
        </p>
        <p>
          Some moments perceive nothing at all. When there are many of these <b>non-perceiving moments</b>, experience gets dim and patchy: that is <b>dullness</b>. Distraction is attention moments going to other objects. Mind-wandering is when most of them do.
        </p>
        <p>
          Seen this way, training does two things. It moves more attention moments onto the chosen object, which is <b>stability</b>. And it replaces non-perceiving moments with perceiving ones, which is <b>more mindfulness</b>. Try the presets to see the difference between a drowsy sit and a stage 7 sit.
        </p>
      </div>
    </div>
  );
}
