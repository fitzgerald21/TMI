import { useEffect, useRef, useState } from 'react';

// A live simulation: the spotlight of attention on the breath, the lantern of peripheral
// awareness around it, and distractions drifting in from the dark.

const WORDS = ['plans', 'an itch', 'a sound', 'a memory', 'hunger', 'a worry', 'a song', 'emails', 'a car', 'a twinge'];

interface P { x: number; y: number; vx: number; vy: number; word: string; state: 'drift' | 'seen' | 'captor' | 'gone'; t: number; seenA: number }

const PRESETS = [
  { name: 'Stage 2 mind', awareness: 0.15, focus: 0.75 },
  { name: 'Stage 4 mind', awareness: 0.55, focus: 0.55 },
  { name: 'Stage 6 mind', awareness: 0.9, focus: 0.4 },
];

export function AttentionAwareness() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [aw, setAw] = useState(0.2);
  const [focus, setFocus] = useState(0.7);
  const [stats, setStats] = useState({ captured: 0, released: 0 });
  const params = useRef({ aw, focus });
  params.current = { aw, focus };

  useEffect(() => {
    const cv = ref.current!;
    const c = cv.getContext('2d')!;
    let raf = 0, last = 0;
    const ps: P[] = [];
    const spot = { x: 0, y: 0, tx: 0, ty: 0 };
    let captor: P | null = null;
    let captureLeft = 0;
    let bloomAt = -9;
    let t = 0;
    let spawn = 0;
    let captured = 0, released = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;
      const { aw, focus } = params.current;
      const M = Math.min(w, h);
      const cx = w / 2, cy = h / 2;
      const Ra = M * (0.16 + 0.36 * aw); // awareness radius
      const Rs = M * (0.035 + 0.07 * (1 - focus)); // attention spotlight radius

      // spawn distractions at the edge
      spawn += dt;
      if (spawn > 0.9) {
        spawn = 0;
        const a = Math.random() * Math.PI * 2;
        const R = Math.hypot(w, h) * 0.55;
        ps.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, vx: 0, vy: 0, word: WORDS[(Math.random() * WORDS.length) | 0], state: 'drift', t: 0, seenA: 0 });
      }

      // spotlight follows the breath, or a captor
      if (captor) { spot.tx = captor.x; spot.ty = captor.y; } else { spot.tx = cx; spot.ty = cy; }
      spot.x += (spot.tx - spot.x) * Math.min(1, dt * 3);
      spot.y += (spot.ty - spot.y) * Math.min(1, dt * 3);
      if (!spot.x) { spot.x = cx; spot.y = cy; }

      for (const p of ps) {
        p.t += dt;
        const dx = cx - p.x, dy = cy - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (p.state === 'drift') {
          p.vx += (dx / d) * 14 * dt + (Math.random() - 0.5) * 30 * dt;
          p.vy += (dy / d) * 14 * dt + (Math.random() - 0.5) * 30 * dt;
          const sp = Math.hypot(p.vx, p.vy), max = 34;
          if (sp > max) { p.vx *= max / sp; p.vy *= max / sp; }
          if (d < Ra) {
            p.seenA = Math.min(1, p.seenA + dt * 2);
            // strong awareness recognizes it in the periphery; it is noticed and released
            if (Math.random() < aw * aw * dt * 2.2) { p.state = 'seen'; p.t = 0; released++; }
          }
          if (d < Rs + 14 && !captor) {
            p.state = 'captor'; p.t = 0; captor = p; captured++;
            captureLeft = 1.6 + (1 - aw) * 4.5;
          }
        } else if (p.state === 'seen') {
          p.vx += (-dx / d) * 30 * dt; p.vy += (-dy / d) * 30 * dt;
          if (p.t > 4) p.state = 'gone';
        } else if (p.state === 'captor') {
          // mind-wandering: attention travels off with the distraction
          p.vx = (-dx / d) * 22 + Math.sin(p.t * 2) * 10;
          p.vy = (-dy / d) * 22 + Math.cos(p.t * 2) * 10;
          captureLeft -= dt;
          if (captureLeft <= 0) { p.state = 'gone'; captor = null; bloomAt = t; }
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      for (let i = ps.length - 1; i >= 0; i--) if (ps[i].state === 'gone') ps.splice(i, 1);
      if (ps.length > 40) ps.splice(0, ps.length - 40);

      // ---- draw
      c.fillStyle = '#0c0e1b';
      c.fillRect(0, 0, w, h);
      // awareness lantern
      let g = c.createRadialGradient(cx, cy, 0, cx, cy, Ra);
      g.addColorStop(0, `rgba(143,163,230,${0.08 + 0.22 * aw})`);
      g.addColorStop(0.75, `rgba(143,163,230,${0.04 + 0.12 * aw})`);
      g.addColorStop(1, 'rgba(143,163,230,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, Ra, 0, 7); c.fill();
      c.strokeStyle = `rgba(143,163,230,${0.15 + 0.3 * aw})`;
      c.setLineDash([3, 7]);
      c.beginPath(); c.arc(cx, cy, Ra, 0, 7); c.stroke();
      c.setLineDash([]);
      // the breath
      g = c.createRadialGradient(cx, cy, 0, cx, cy, 22);
      g.addColorStop(0, 'rgba(255,238,200,1)'); g.addColorStop(1, 'rgba(242,196,109,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill();
      // spotlight
      g = c.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, Rs * 1.8);
      g.addColorStop(0, 'rgba(242,196,109,0.55)'); g.addColorStop(0.55, 'rgba(242,196,109,0.25)'); g.addColorStop(1, 'rgba(242,196,109,0)');
      c.fillStyle = g; c.beginPath(); c.arc(spot.x, spot.y, Rs * 1.8, 0, 7); c.fill();
      c.strokeStyle = 'rgba(242,196,109,0.7)';
      c.lineWidth = 1.2;
      c.beginPath(); c.arc(spot.x, spot.y, Rs, 0, 7); c.stroke();
      // distractions
      c.font = '500 12px Figtree, system-ui, sans-serif';
      c.textAlign = 'center';
      for (const p of ps) {
        const inAw = Math.hypot(cx - p.x, cy - p.y) < Ra;
        let a = p.state === 'captor' ? 1 : p.state === 'seen' ? Math.max(0, 0.9 - p.t / 4) : inAw ? 0.25 + 0.6 * aw : 0.08;
        a = Math.max(a, p.seenA * 0.2);
        c.fillStyle = p.state === 'captor' ? `rgba(255,238,200,${a})` : `rgba(200,208,245,${a})`;
        c.beginPath(); c.arc(p.x, p.y, p.state === 'captor' ? 5 : 3.2, 0, 7); c.fill();
        c.fillText(p.word, p.x, p.y - 9);
        if (p.state === 'seen') {
          c.strokeStyle = `rgba(143,163,230,${a})`;
          c.beginPath(); c.arc(p.x, p.y, 9 + p.t * 4, 0, 7); c.stroke();
        }
      }
      // aha bloom on returning
      const e = (t - bloomAt) / 1.8;
      if (e >= 0 && e < 1) {
        c.strokeStyle = `rgba(242,196,109,${1 - e})`;
        c.lineWidth = 2;
        c.beginPath(); c.arc(cx, cy, 20 + e * 70, 0, 7); c.stroke();
        c.fillStyle = `rgba(255,238,200,${1 - e})`;
        c.font = 'italic 500 20px "Cormorant Garamond", Georgia, serif';
        c.fillText('aha!', cx, cy - 34 - e * 16);
      }
      if (captor) {
        c.fillStyle = 'rgba(255,238,200,0.85)';
        c.font = '600 11px Figtree, system-ui, sans-serif';
        c.fillText('MIND-WANDERING', cx, h - 16);
      }
      if (Math.floor(t * 4) !== Math.floor((t - dt) * 4)) setStats({ captured, released });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="explainer">
      <div className="sim">
        <canvas ref={ref} className="sim-canvas" aria-label="Simulation of attention and peripheral awareness" />
        <div className="sim-stats">
          <span><b className="tabnum">{stats.released}</b> noticed in the periphery and let go</span>
          <span><b className="tabnum">{stats.captured}</b> hijacked attention</span>
        </div>
      </div>
      <div className="sim-controls">
        <label className="slider" htmlFor="aa-aw">
          <span>Peripheral awareness <em>{Math.round(aw * 100)}%</em></span>
          <input id="aa-aw" type="range" min={0} max={1} step={0.01} value={aw} onChange={(e) => setAw(+e.target.value)} />
        </label>
        <label className="slider" htmlFor="aa-focus">
          <span>Attention focus <em>{focus > 0.66 ? 'narrow' : focus > 0.33 ? 'medium' : 'broad'}</em></span>
          <input id="aa-focus" type="range" min={0} max={1} step={0.01} value={focus} onChange={(e) => setFocus(+e.target.value)} />
        </label>
        <div className="chips">
          {PRESETS.map((p) => (
            <button key={p.name} className="chip" onClick={() => { setAw(p.awareness); setFocus(p.focus); }}>{p.name}</button>
          ))}
        </div>
      </div>
      <div className="prose">
        <p>
          <b className="gold">Attention</b> is the spotlight. It singles out one thing, here the breath, and examines it. <b className="aware">Peripheral awareness</b> is the lantern. It holds the wider field: sounds, sensations, thoughts at the edges, and the state of the mind itself.
        </p>
        <p>
          Turn awareness down and watch: distractions slip in unseen until one reaches the spotlight and carries attention away. That is mind-wandering. Eventually you notice, and that is the "aha". Turn awareness up and the same distractions are seen in the periphery while they are still small, then let go before they can take over.
        </p>
        <p>
          The early stages are mostly about this one shift: keeping the spotlight on the breath while making the lantern brighter. Mindfulness is the two working together.
        </p>
      </div>
    </div>
  );
}
