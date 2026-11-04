import { useEffect, useRef, useState } from 'react';

// The mind system: many sub-minds, one shared space of consciousness.
// As intention unifies them, their contributions converge on the breath.

const SUBS = ['Seeing', 'Hearing', 'Body', 'Planning', 'Remembering', 'Emotion', 'Narrating', 'Breath'];

export function MindSystem() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [u, setU] = useState(0.2);
  const [shown, setShown] = useState('…');
  const uRef = useRef(u);
  uRef.current = u;

  useEffect(() => {
    const cv = ref.current!;
    const c = cv.getContext('2d')!;
    let raf = 0, last = 0, t = 0, shownT = 0;
    const bids: { from: number; p: number; aligned: boolean }[] = [];
    let content = 7;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now; t += dt;
      const U = uRef.current;
      const cx = w / 2, cy = h / 2, M = Math.min(w, h);
      const R = M * 0.38, rC = M * 0.13;
      // number of sub-minds sharing the intention to attend to the breath
      const aligned = Math.round(U * 7);
      const isAligned = (i: number) => i === 7 || i < aligned;
      if (Math.random() < dt * 6) {
        const from = (Math.random() * 8) | 0;
        bids.push({ from, p: 0, aligned: isAligned(from) });
      }
      for (const b of bids) b.p += dt * 0.7;
      for (let i = bids.length - 1; i >= 0; i--) {
        if (bids[i].p >= 1) {
          // a bid reaches consciousness: unaligned ones may take over the content
          const b = bids[i];
          if (!b.aligned && Math.random() < 0.6) content = b.from;
          else if (b.aligned) content = 7;
          bids.splice(i, 1);
        }
      }
      shownT += dt;
      if (shownT > 0.25) { shownT = 0; setShown(SUBS[content]); }

      c.fillStyle = '#0c0e1b';
      c.fillRect(0, 0, w, h);
      // consciousness
      const steady = content === 7;
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, rC * 1.8);
      g.addColorStop(0, steady ? 'rgba(242,196,109,0.6)' : 'rgba(240,150,150,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rC * 1.8, 0, 7); c.fill();
      c.strokeStyle = 'rgba(200,204,230,0.35)';
      c.beginPath(); c.arc(cx, cy, rC, 0, 7); c.stroke();
      c.fillStyle = '#e9e4d8';
      c.textAlign = 'center';
      c.font = 'italic 500 18px "Cormorant Garamond", Georgia, serif';
      c.fillText(SUBS[content].toLowerCase(), cx, cy + 6);
      // sub-minds
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const al = isAligned(i);
        c.fillStyle = al ? 'rgba(242,196,109,0.9)' : 'rgba(143,163,230,0.8)';
        c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill();
        c.fillStyle = 'rgba(220,224,245,0.85)';
        c.font = '500 11px Figtree, system-ui, sans-serif';
        c.fillText(SUBS[i], x, y + (Math.sin(a) > 0.2 ? 22 : -13));
      }
      for (const b of bids) {
        const a = -Math.PI / 2 + (b.from / 8) * Math.PI * 2;
        const sx = cx + Math.cos(a) * R, sy = cy + Math.sin(a) * R;
        const ex = cx + Math.cos(a) * rC, ey = cy + Math.sin(a) * rC;
        const x = sx + (ex - sx) * b.p, y = sy + (ey - sy) * b.p;
        c.fillStyle = b.aligned ? 'rgba(255,238,200,0.9)' : 'rgba(170,185,240,0.85)';
        c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="explainer">
      <div className="sim">
        <canvas ref={ref} className="sim-canvas" aria-label="The mind system: sub-minds sending content to consciousness" />
        <div className="sim-stats"><span>In consciousness right now: <b>{shown}</b></span></div>
      </div>
      <div className="sim-controls">
        <label className="slider" htmlFor="ms-u">
          <span>Unification <em>{Math.round(u * 7)} of 7 sub-minds share the intention</em></span>
          <input id="ms-u" type="range" min={0} max={1} step={0.01} value={u} onChange={(e) => setU(+e.target.value)} />
        </label>
      </div>
      <div className="prose">
        <p>
          The mind isn't one thing. It is a community of <b>sub-minds</b>, each processing its own kind of information: sights, sounds, body sensations, plans, memories, emotions, the inner narrator. They work mostly unconsciously, in parallel.
        </p>
        <p>
          Consciousness works like a shared stage. Whatever a sub-mind puts there is broadcast to all the others. When you intend to watch the breath, only some sub-minds go along with it. The rest keep projecting their own content onto the stage. That shows up as distraction.
        </p>
        <p>
          Each time you set a clear intention and return to the breath, more sub-minds learn to share the goal. Slide unification up and watch the stage settle. That is why <b>intention, not effort</b> drives progress, and why practice moves toward effortlessness: eventually there is nothing left to fight.
        </p>
      </div>
    </div>
  );
}
