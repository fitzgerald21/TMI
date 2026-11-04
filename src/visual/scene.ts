// Procedural canvas renderer for every meditation visual.
// One persistent seated figure + camera, with layers that fade in and out per mode.

import type { VisualMode } from '../content/stages';

export interface SceneControl {
  held: boolean; // breath pad held (user is breathing in)
  breathLog: { t: number; down: boolean }[];
  aha: number[];
  pulses: number[];
  labels: { text: string; t: number; seed: number }[];
  count: number;
  countAt: number;
  dullAt: number;
}

export function newControl(): SceneControl {
  return { held: false, breathLog: [], aha: [], pulses: [], labels: [], count: 0, countAt: -99, dullAt: -99 };
}

export interface SceneInput {
  mode: VisualMode;
  progress: number;
  scanY?: number;
  metta?: number;
  walk?: 3 | 6;
  paused?: boolean;
  /** Compact mode: preview cards, no trace/labels UI. */
  preview?: boolean;
}

const LAYERS = [
  'stars', 'arrive', 'present', 'figure', 'face', 'bodyGlow', 'breathBody', 'nose', 'halo', 'count', 'trace',
  'lookout', 'scan', 'whole', 'fine', 'effort', 'senses', 'joy', 'still', 'metta', 'walk', 'close',
] as const;
type Layer = (typeof LAYERS)[number];
type Targets = Partial<Record<Layer, number>> & { cam: [number, number, number] };

const FULL: [number, number, number] = [0, -0.07, 1];
const FACE: [number, number, number] = [0, -0.355, 2.7];

function targets(mode: VisualMode): Targets {
  switch (mode) {
    case 'arrive': return { stars: 1, arrive: 1, figure: 0.45, cam: FULL };
    case 'present': return { stars: 1, present: 1, figure: 0.5, cam: FULL };
    case 'body': return { stars: 0.6, figure: 1, bodyGlow: 1, cam: FULL };
    case 'breathBody': return { stars: 0.5, figure: 1, bodyGlow: 0.3, breathBody: 1, cam: FULL };
    case 'nose': return { stars: 0.5, figure: 1, face: 1, nose: 1, halo: 1, cam: FACE };
    case 'count': return { stars: 0.4, figure: 1, face: 1, nose: 1, halo: 0.8, count: 1, cam: FACE };
    case 'follow': return { stars: 0.4, figure: 1, face: 1, nose: 1, halo: 0.8, trace: 1, cam: FACE };
    case 'connect': return { stars: 0.4, figure: 1, face: 1, nose: 1, halo: 0.8, trace: 1, cam: FACE };
    case 'checkin': return { stars: 0.5, figure: 1, face: 1, nose: 1, halo: 1, lookout: 1, cam: FACE };
    case 'label': return { stars: 0.5, figure: 1, face: 1, nose: 1, halo: 1, cam: FACE };
    case 'scan': return { stars: 0.4, figure: 1, scan: 1, cam: FULL };
    case 'whole': return { stars: 0.4, figure: 1, bodyGlow: 0.25, whole: 1, cam: FULL };
    case 'fine': return { stars: 0.3, figure: 1, face: 1, nose: 0.5, fine: 1, halo: 0.5, cam: [0, -0.358, 3.6] };
    case 'effortless': return { stars: 0.4, figure: 0.8, face: 0.6, nose: 0.6, effort: 1, halo: 0.5, cam: [0, -0.28, 1.7] };
    case 'senses': return { stars: 0.5, figure: 0.6, senses: 1, cam: FULL };
    case 'joy': return { stars: 0.4, figure: 0.55, joy: 1, cam: FULL };
    case 'still': return { stars: 0.25, figure: 0.25, still: 1, cam: FULL };
    case 'metta': return { stars: 0.7, figure: 0.9, metta: 1, cam: [0, -0.1, 0.9] };
    case 'walk': return { stars: 0.3, walk: 1, cam: FULL };
    case 'close': return { stars: 1, figure: 0.6, close: 1, cam: FULL };
  }
}

// ---------- palette ----------
const GOLD = [242, 196, 109];
const GOLD_HI = [255, 238, 200];
const VIOLET = [143, 163, 230];
const TEAL = [120, 214, 200];
const ROSE = [240, 150, 150];
const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;

// ---------- figure geometry (unit space; head top ≈ -0.47, base ≈ 0.29) ----------
function buildFigure(): Path2D[] {
  const head = new Path2D();
  head.ellipse(0, -0.385, 0.075, 0.088, 0, 0, Math.PI * 2);
  const neck = new Path2D();
  neck.rect(-0.03, -0.315, 0.06, 0.05);
  const torso = new Path2D(
    'M -0.04 -0.29 C -0.10 -0.285 -0.165 -0.27 -0.18 -0.225 C -0.195 -0.15 -0.16 -0.05 -0.15 0.05 L -0.145 0.15 L 0.145 0.15 L 0.15 0.05 C 0.16 -0.05 0.195 -0.15 0.18 -0.225 C 0.165 -0.27 0.10 -0.285 0.04 -0.29 Z'
  );
  const armL = new Path2D(
    'M -0.175 -0.24 C -0.235 -0.17 -0.255 -0.06 -0.24 0.02 C -0.225 0.10 -0.15 0.165 -0.07 0.185 L -0.05 0.13 C -0.12 0.11 -0.175 0.06 -0.185 0.0 C -0.19 -0.06 -0.175 -0.12 -0.15 -0.17 Z'
  );
  const armR = new Path2D(
    'M 0.175 -0.24 C 0.235 -0.17 0.255 -0.06 0.24 0.02 C 0.225 0.10 0.15 0.165 0.07 0.185 L 0.05 0.13 C 0.12 0.11 0.175 0.06 0.185 0.0 C 0.19 -0.06 0.175 -0.12 0.15 -0.17 Z'
  );
  const legs = new Path2D();
  legs.ellipse(0, 0.2, 0.33, 0.085, 0, 0, Math.PI * 2);
  const hands = new Path2D();
  hands.ellipse(0, 0.165, 0.075, 0.03, 0, 0, Math.PI * 2);
  return [legs, torso, armL, armR, neck, head, hands];
}

const NOSE: [number, number] = [0, -0.357];
const HEART: [number, number] = [0, -0.16];
const BELLY: [number, number] = [0, -0.01];

// cheap smooth noise
const sn = (t: number, s = 0) => (Math.sin(t * 1.3 + s) + Math.sin(t * 0.71 + s * 2.1) * 0.6 + Math.sin(t * 2.37 + s * 0.7) * 0.3) / 1.9;

function rand(seed: number) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

interface Star { x: number; y: number; r: number; tw: number; ph: number }
interface Mote { x: number; y: number; v: number; ph: number }

export class Scene {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mask: HTMLCanvasElement;
  mctx: CanvasRenderingContext2D;
  fx: HTMLCanvasElement;
  fctx: CanvasRenderingContext2D;
  w = 0; h = 0; dpr = 1;
  alpha: Record<Layer, number>;
  cam: [number, number, number] = [...FULL];
  figure = buildFigure();
  stars: Star[] = [];
  motes: Mote[] = [];
  level = 0; // breath level 0..1
  prevLevel = 0;
  lastT = 0;
  time = 0;
  levelHist: { t: number; v: number }[] = [];
  ctl: SceneControl;
  reduced = false;
  sparks: { x: number; y: number; t: number; c: number[] }[] = [];

  constructor(canvas: HTMLCanvasElement, ctl: SceneControl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mask = document.createElement('canvas');
    this.mctx = this.mask.getContext('2d')!;
    this.fx = document.createElement('canvas');
    this.fctx = this.fx.getContext('2d')!;
    this.alpha = Object.fromEntries(LAYERS.map((l) => [l, 0])) as Record<Layer, number>;
    this.ctl = ctl;
    const r = rand(7);
    for (let i = 0; i < 160; i++) this.stars.push({ x: r(), y: r(), r: r() * 1.1 + 0.2, tw: 0.3 + r() * 1.4, ph: r() * 6.28 });
    for (let i = 0; i < 40; i++) this.motes.push({ x: r() * 2 - 1, y: r() * 2 - 1, v: 0.01 + r() * 0.03, ph: r() * 6.28 });
    try { this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* ignore */ }
  }

  /** Jump directly to a mode's resting state (no fade). */
  snap(mode: VisualMode) {
    const tg = targets(mode);
    for (const l of LAYERS) this.alpha[l] = tg[l] ?? 0;
    this.cam = [...tg.cam];
  }

  fixedSize: [number, number] | null = null;

  resize() {
    const dpr = this.fixedSize ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const [w, h] = this.fixedSize || [this.canvas.clientWidth, this.canvas.clientHeight];
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w; this.h = h; this.dpr = dpr;
    for (const c of [this.canvas, this.mask, this.fx]) {
      c.width = Math.max(1, Math.round(w * dpr));
      c.height = Math.max(1, Math.round(h * dpr));
    }
  }

  // unit → screen transform parameters
  get S() { return Math.min(this.w * 1.35, this.h * 0.95) * 0.82 * this.cam[2]; }
  get cx() { return this.w / 2 - this.cam[0] * this.S; }
  get cy() { return this.h * 0.44 - this.cam[1] * this.S; }
  toScreen(x: number, y: number): [number, number] { return [this.cx + x * this.S, this.cy + y * this.S]; }
  unitTf(c: CanvasRenderingContext2D) {
    const d = this.dpr, S = this.S;
    c.setTransform(d * S, 0, 0, d * S, d * this.cx, d * this.cy);
  }
  screenTf(c: CanvasRenderingContext2D) { c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); }

  frame(now: number, inp: SceneInput) {
    this.resize();
    const dtRaw = this.lastT ? Math.min(0.1, (now - this.lastT) / 1000) : 0.016;
    this.lastT = now;
    const speed = this.reduced ? 0.5 : 1;
    const dt = inp.paused ? 0 : dtRaw * speed;
    this.time += dt;
    const t = this.time;
    // Event timestamps come from performance.now(); thumbnails use their synthetic clock.
    const nowS = this.fixedSize ? now / 1000 : performance.now() / 1000;

    // ---- ease layers + camera
    const tg = targets(inp.mode);
    const k = 1 - Math.exp(-dtRaw * 1.1);
    for (const l of LAYERS) this.alpha[l] += ((tg[l] ?? 0) - this.alpha[l]) * k;
    const kc = 1 - Math.exp(-dtRaw * 0.9);
    for (let i = 0; i < 3; i++) this.cam[i] += (tg.cam[i] - this.cam[i]) * kc;

    // ---- breath level
    const userActive = this.ctl.breathLog.length > 0 && nowS - this.ctl.breathLog[this.ctl.breathLog.length - 1].t < 25;
    this.prevLevel = this.level;
    if (userActive) {
      const target = this.ctl.held ? 1 : 0;
      this.level += (target - this.level) * (1 - Math.exp(-dtRaw * (this.ctl.held ? 1.6 : 1.3)));
      this.levelHist.push({ t: nowS, v: this.level });
    } else {
      // Gentle, irregular ambient motion. Deliberately not a breathing pace.
      this.level = 0.5 + 0.22 * sn(t * 0.35, 3);
    }
    while (this.levelHist.length && nowS - this.levelHist[0].t > 32) this.levelHist.shift();
    const dir = this.level - this.prevLevel; // >0 inhaling
    const amp = userActive ? 1 : 0.45;

    const c = this.ctx;
    const { w, h } = this;
    this.screenTf(c);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    // night background
    const bg = c.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0b0d19');
    bg.addColorStop(0.6, '#0e1122');
    bg.addColorStop(1, '#0a0b15');
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    const A = this.alpha;
    if (A.stars > 0.01) this.drawStars(A.stars, t);
    if (A.arrive > 0.01) this.drawArrive(A.arrive, t);
    if (A.close > 0.01) this.drawClose(A.close, t, inp.progress);
    if (A.present > 0.01) this.drawPresent(A.present, t);
    if (A.halo > 0.01) this.drawHalo(A.halo * (inp.mode === 'fine' ? 0.6 : 1), nowS);
    if (A.metta > 0.01) this.drawMetta(A.metta, t, inp.metta ?? 0);
    if (A.figure > 0.01) this.drawFigure(A.figure);
    if (A.bodyGlow > 0.01) this.masked(A.bodyGlow, (f) => this.fxBodyGlow(f, t));
    if (A.breathBody > 0.01) this.masked(A.breathBody, (f) => this.fxBreathBody(f, amp));
    if (A.scan > 0.01) this.masked(A.scan, (f) => this.fxScan(f, inp.scanY ?? -0.45, t));
    if (A.whole > 0.01) this.masked(A.whole, (f) => this.fxWhole(f, t, dir, amp));
    if (A.joy > 0.01) this.drawJoy(A.joy, t, inp.progress);
    if (A.senses > 0.01) this.drawSenses(A.senses, t, inp.progress);
    if (A.face > 0.01) this.drawFace(A.face);
    if (A.nose > 0.01) this.drawNose(A.nose, t, dir, amp);
    if (A.fine > 0.01) this.drawFine(A.fine, t);
    if (A.effort > 0.01) this.drawEffort(A.effort, t, inp.progress);
    if (A.still > 0.01) this.drawStill(A.still, t);
    if (A.lookout > 0.01) this.drawLookout(A.lookout, t);
    if (A.walk > 0.01) this.drawWalk(A.walk, t, inp.walk ?? 3);
    if (!inp.preview) {
      if (A.count > 0.01) this.drawCount(A.count, nowS);
      if (A.trace > 0.01) this.drawTrace(A.trace, nowS, inp.mode === 'connect');
    }
    this.drawPulses(nowS);
    this.drawLabels(nowS);
    this.drawAha(nowS);
    this.drawDull(nowS);
  }

  // ---------------- helpers ----------------
  private glow(x: number, y: number, r: number, col: number[], a: number, c = this.ctx) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(col, a));
    g.addColorStop(0.35, rgba(col, a * 0.35));
    g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  private buildMask() {
    const m = this.mctx;
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.clearRect(0, 0, this.mask.width, this.mask.height);
    this.unitTf(m);
    m.fillStyle = '#fff';
    for (const p of this.figure) m.fill(p);
  }

  /** Draw an effect clipped to the figure silhouette. */
  private masked(a: number, draw: (f: CanvasRenderingContext2D) => void) {
    const f = this.fctx;
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = 'source-over';
    f.globalAlpha = 1;
    f.clearRect(0, 0, this.fx.width, this.fx.height);
    this.unitTf(f);
    draw(f);
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = 'destination-in';
    f.globalAlpha = 1;
    f.drawImage(this.mask, 0, 0);
    f.globalCompositeOperation = 'source-over';
    const c = this.ctx;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = a;
    c.globalCompositeOperation = 'lighter';
    c.drawImage(this.fx, 0, 0);
    c.restore();
  }

  // ---------------- layers ----------------
  private drawStars(a: number, t: number) {
    const c = this.ctx;
    for (const s of this.stars) {
      const tw = 0.5 + 0.5 * Math.sin(t * s.tw + s.ph);
      const x = ((s.x + t * 0.002 * s.r) % 1) * this.w;
      const y = s.y * this.h;
      c.fillStyle = rgba([210, 214, 240], a * (0.15 + 0.5 * tw) * s.r * 0.8);
      c.beginPath();
      c.arc(x, y, s.r, 0, Math.PI * 2);
      c.fill();
    }
  }

  private drawArrive(a: number, t: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    const R = Math.min(this.w, this.h) * (0.55 + 0.05 * Math.sin(t * 0.4));
    this.glow(x, y, R, GOLD, 0.22 * a);
    this.glow(x, y, R * 0.3, GOLD_HI, 0.18 * a);
    // rising motes
    for (const m of this.motes) {
      const yy = ((m.y + 1 - ((t * m.v) % 2) + 2) % 2) - 1;
      const xx = m.x + Math.sin(t * 0.3 + m.ph) * 0.05;
      const px = this.w / 2 + xx * this.w * 0.5;
      const py = this.h / 2 + yy * this.h * 0.5;
      c.fillStyle = rgba(GOLD_HI, a * 0.35 * (0.5 + 0.5 * Math.sin(t + m.ph)));
      c.beginPath();
      c.arc(px, py, 1.4, 0, Math.PI * 2);
      c.fill();
    }
  }

  private drawClose(a: number, t: number, p: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    const M = Math.max(this.w, this.h);
    this.glow(x, y, M * (0.3 + 0.5 * p), GOLD, 0.2 * a);
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ph = ((t * 0.06 + i / 4) % 1);
      c.strokeStyle = rgba(VIOLET, a * 0.3 * (1 - ph));
      c.beginPath();
      c.arc(x, y, ph * M * 0.8, 0, Math.PI * 2);
      c.stroke();
    }
  }

  private drawPresent(a: number, t: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    const M = Math.max(this.w, this.h);
    // slow, even, expanding rings: open awareness in every direction
    c.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      const ph = ((t * 0.05 + i / 6) % 1);
      c.strokeStyle = rgba(VIOLET, a * 0.35 * Math.sin(ph * Math.PI));
      c.beginPath();
      c.arc(x, y, 30 + ph * M * 0.75, 0, Math.PI * 2);
      c.stroke();
    }
    // sense sparks: sounds, light, touch arising anywhere, all with equal weight
    if (Math.random() < 0.06 * a) {
      const cols = [VIOLET, TEAL, GOLD, ROSE];
      this.sparks.push({ x: Math.random() * this.w, y: Math.random() * this.h, t, c: cols[(Math.random() * 4) | 0] });
    }
    this.sparks = this.sparks.filter((s) => t - s.t < 4);
    for (const s of this.sparks) {
      const e = (t - s.t) / 4;
      const al = Math.sin(e * Math.PI) * a;
      this.glow(s.x, s.y, 18, s.c, 0.5 * al);
      c.strokeStyle = rgba(s.c, 0.4 * al);
      c.beginPath();
      c.arc(s.x, s.y, 6 + e * 26, 0, Math.PI * 2);
      c.stroke();
    }
  }

  private drawHalo(a: number, nowS: number) {
    const [x, y] = this.toScreen(NOSE[0], NOSE[1]);
    const dullBoost = Math.max(0, 1 - (nowS - this.ctl.dullAt) / 4);
    const R = Math.min(this.w, this.h) * 0.62;
    this.glow(x, y, R, VIOLET, (0.13 + dullBoost * 0.15) * a);
  }

  private drawFigure(a: number) {
    this.buildMask();
    const c = this.ctx;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    // soft rim glow
    c.globalAlpha = a * 0.55;
    c.shadowColor = rgba(VIOLET, 0.55);
    c.shadowBlur = 28 * this.dpr;
    c.drawImage(this.mask, 0, 0);
    c.restore();
    // tinted body
    const f = this.fctx;
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalCompositeOperation = 'source-over';
    f.clearRect(0, 0, this.fx.width, this.fx.height);
    f.drawImage(this.mask, 0, 0);
    f.globalCompositeOperation = 'source-in';
    const grad = f.createLinearGradient(0, 0, 0, this.fx.height);
    grad.addColorStop(0, '#272c4c');
    grad.addColorStop(1, '#1a1d36');
    f.fillStyle = grad;
    f.fillRect(0, 0, this.fx.width, this.fx.height);
    f.globalCompositeOperation = 'source-over';
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = a;
    c.drawImage(this.fx, 0, 0);
    c.restore();
  }

  private drawFace(a: number) {
    const c = this.ctx;
    c.save();
    this.unitTf(c);
    c.lineCap = 'round';
    c.lineWidth = 0.0035;
    c.strokeStyle = rgba([150, 160, 215], 0.55 * a);
    // closed eyes
    for (const s of [-1, 1]) {
      c.beginPath();
      c.arc(s * 0.03, -0.398, 0.016, 0.2 * Math.PI, 0.8 * Math.PI);
      c.stroke();
    }
    // nose
    c.beginPath();
    c.moveTo(-0.002, -0.39);
    c.quadraticCurveTo(0.004, -0.37, 0, -0.362);
    c.stroke();
    c.beginPath();
    c.arc(-0.008, -0.359, 0.006, 0.9 * Math.PI, 1.9 * Math.PI, true);
    c.stroke();
    c.beginPath();
    c.arc(0.008, -0.359, 0.006, 1.1 * Math.PI, 0.1 * Math.PI);
    c.stroke();
    // soft mouth
    c.beginPath();
    c.arc(0, -0.355, 0.02, 0.38 * Math.PI, 0.62 * Math.PI);
    c.stroke();
    c.restore();
  }

  private fxBodyGlow(f: CanvasRenderingContext2D, t: number) {
    const g = f.createRadialGradient(0, -0.12, 0, 0, -0.08, 0.55);
    g.addColorStop(0, rgba(GOLD, 0.55));
    g.addColorStop(1, rgba(GOLD, 0.12));
    f.fillStyle = g;
    f.fillRect(-1, -1, 2, 2);
    // shimmer: sensations here and there
    for (let i = 0; i < 26; i++) {
      const x = sn(i * 3.1, i) * 0.28;
      const y = -0.42 + ((i * 0.137) % 0.68);
      const al = 0.5 + 0.5 * Math.sin(t * (0.6 + (i % 5) * 0.21) + i);
      this.glow(x, y, 0.05, GOLD_HI, 0.35 * al, f);
    }
  }

  private fxBreathBody(f: CanvasRenderingContext2D, amp: number) {
    const L = 0.5 + (this.level - 0.5) * amp;
    this.glow(BELLY[0], BELLY[1], 0.16 + 0.1 * L, GOLD, 0.45 + 0.4 * L, f);
    this.glow(HEART[0], HEART[1], 0.12 + 0.07 * L, GOLD, 0.25 + 0.35 * L, f);
    this.glow(0, -0.235, 0.15, GOLD_HI, 0.1 + 0.15 * L, f);
  }

  private fxScan(f: CanvasRenderingContext2D, y: number, t: number) {
    // already-scanned area stays faintly lit
    const g0 = f.createLinearGradient(0, -0.5, 0, y);
    g0.addColorStop(0, rgba(GOLD, 0.12));
    g0.addColorStop(1, rgba(GOLD, 0.22));
    f.fillStyle = g0;
    f.fillRect(-1, -0.5, 2, y + 0.5);
    const bh = 0.075;
    const g = f.createLinearGradient(0, y - bh, 0, y + bh);
    g.addColorStop(0, rgba(GOLD, 0));
    g.addColorStop(0.5, rgba(GOLD_HI, 0.95));
    g.addColorStop(1, rgba(GOLD, 0));
    f.fillStyle = g;
    f.fillRect(-1, y - bh, 2, bh * 2);
    for (let i = 0; i < 18; i++) {
      const x = -0.32 + (i / 17) * 0.64 + sn(t * 0.5, i) * 0.01;
      const yy = y + sn(t * 0.9, i * 2) * 0.03;
      this.glow(x, yy, 0.02, GOLD_HI, 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + i)), f);
    }
  }

  private fxWhole(f: CanvasRenderingContext2D, t: number, dir: number, amp: number) {
    const L = 0.5 + (this.level - 0.5) * amp;
    const g = f.createRadialGradient(0, -0.1, 0, 0, -0.1, 0.5);
    g.addColorStop(0, rgba(GOLD, 0.35 + 0.35 * L));
    g.addColorStop(1, rgba(TEAL, 0.15 + 0.25 * L));
    f.fillStyle = g;
    f.fillRect(-1, -1, 2, 2);
    // a wave of light moving up on the in-breath, down on the out-breath
    const waveY = 0.28 - L * 0.78;
    const wg = f.createLinearGradient(0, waveY - 0.12, 0, waveY + 0.12);
    wg.addColorStop(0, rgba(GOLD_HI, 0));
    wg.addColorStop(0.5, rgba(GOLD_HI, 0.35));
    wg.addColorStop(1, rgba(GOLD_HI, 0));
    f.fillStyle = wg;
    f.fillRect(-1, waveY - 0.12, 2, 0.24);
    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI * 2;
      const r = 0.05 + (((t * 0.04 * (dir >= 0 ? -1 : 1) + i * 0.071) % 0.4) + 0.4) % 0.4;
      const x = Math.cos(ang) * r * 0.9;
      const y = -0.08 + Math.sin(ang) * r;
      this.glow(x, y, 0.018, GOLD_HI, 0.5, f);
    }
  }

  private drawNose(a: number, t: number, dir: number, amp: number) {
    const [x, y] = this.toScreen(NOSE[0], NOSE[1] + 0.006);
    const S = this.S;
    const fl = 1 + 0.06 * Math.sin(t * 3.1) + 0.04 * sn(t * 2, 1);
    this.glow(x, y, S * 0.05 * fl * (1 + 0.15 * this.level * amp), GOLD, 0.65 * a);
    this.glow(x, y, S * 0.012 * fl, GOLD_HI, 0.95 * a);
    // air drifting in and out of the nostrils
    const c = this.ctx;
    const inward = dir > 0.0005 ? 1 : dir < -0.0005 ? -1 : 0;
    for (let i = 0; i < 14; i++) {
      const base = (t * 0.25 + i / 14) % 1;
      const p = inward >= 0 ? 1 - base : base;
      const side = i % 2 ? -1 : 1;
      const px = x + side * (S * 0.01 + p * S * 0.05) + sn(t + i, i) * S * 0.006;
      const py = y + p * S * 0.045;
      c.fillStyle = rgba(GOLD_HI, a * 0.35 * Math.sin(p * Math.PI) * (inward === 0 ? 0.5 : 1));
      c.beginPath();
      c.arc(px, py, Math.max(0.8, S * 0.0018), 0, Math.PI * 2);
      c.fill();
    }
  }

  private drawFine(a: number, t: number) {
    const [x, y] = this.toScreen(NOSE[0], NOSE[1] + 0.008);
    const S = this.S;
    const c = this.ctx;
    for (let i = 0; i < 70; i++) {
      const ang = i * 2.399;
      const r = Math.sqrt((i + 0.5) / 70) * S * 0.045;
      const life = (t * (0.5 + (i % 7) * 0.13) + i * 0.37) % 1;
      const al = Math.sin(life * Math.PI) ** 2;
      const px = x + Math.cos(ang) * r;
      const py = y + Math.sin(ang) * r * 0.7;
      c.fillStyle = rgba(i % 3 ? GOLD_HI : TEAL, a * 0.85 * al);
      c.beginPath();
      c.arc(px, py, Math.max(0.7, S * 0.0012 * (0.6 + al)), 0, Math.PI * 2);
      c.fill();
    }
  }

  private drawEffort(a: number, t: number, p: number) {
    const [x, y] = this.toScreen(NOSE[0], NOSE[1]);
    const c = this.ctx;
    const R = Math.min(this.w, this.h) * 0.24;
    const tension = Math.max(0, 1 - p * 1.25);
    c.lineWidth = 1.5;
    c.strokeStyle = rgba(VIOLET, a * (0.25 + 0.4 * tension));
    c.beginPath();
    for (let i = 0; i <= 240; i++) {
      const ang = (i / 240) * Math.PI * 2;
      const jit = tension * (Math.sin(ang * 31 + t * 6) * 0.025 + Math.sin(ang * 17 - t * 4.3) * 0.02) * R;
      const r = R + jit;
      const px = x + Math.cos(ang) * r, py = y + Math.sin(ang) * r;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
    c.stroke();
    // vigilance ticks that dissolve as effort is released
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2 + t * 0.15;
      c.strokeStyle = rgba(GOLD, a * tension * 0.6);
      c.beginPath();
      c.moveTo(x + Math.cos(ang) * (R + 6), y + Math.sin(ang) * (R + 6));
      c.lineTo(x + Math.cos(ang) * (R + 14), y + Math.sin(ang) * (R + 14));
      c.stroke();
    }
    // steady inner light grows as effort falls away
    this.glow(x, y, R * (0.6 + 0.6 * p), GOLD, a * (0.15 + 0.3 * p));
  }

  private drawStill(a: number, t: number) {
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    const M = Math.min(this.w, this.h);
    this.glow(x, y, M * 0.5, VIOLET, a * 0.1);
    this.glow(x, y, M * 0.08, GOLD, a * 0.35);
    this.glow(x, y, M * 0.012, GOLD_HI, a * 0.9);
    const c = this.ctx;
    c.lineWidth = 1;
    c.strokeStyle = rgba(VIOLET, a * 0.18);
    c.beginPath();
    c.arc(x, y, M * (0.3 + 0.015 * Math.sin(t * 0.1)), 0, Math.PI * 2);
    c.stroke();
  }

  private drawLookout(a: number, t: number) {
    // the inner lookout: a faint ring of awareness quietly circling the attention point
    const [x, y] = this.toScreen(NOSE[0], NOSE[1]);
    const c = this.ctx;
    const R = Math.min(this.w, this.h) * 0.3;
    c.lineWidth = 1;
    c.strokeStyle = rgba(VIOLET, a * 0.22);
    c.setLineDash([2, 10]);
    c.beginPath();
    c.arc(x, y, R, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    const ang = t * 0.35;
    this.glow(x + Math.cos(ang) * R, y + Math.sin(ang) * R, 14, VIOLET, a * 0.6);
  }

  private drawJoy(a: number, t: number, p: number) {
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    const c = this.ctx;
    const M = Math.max(this.w, this.h);
    const intensity = 1 - 0.8 * p; // joy calms as the segment progresses
    const sp = 0.08 + 0.12 * intensity;
    for (let i = 0; i < 7; i++) {
      const ph = (t * sp + i / 7) % 1;
      const wob = intensity * 10 * Math.sin(t * 2 + i);
      c.lineWidth = 1 + 2 * intensity;
      c.strokeStyle = rgba(i % 2 ? GOLD : ROSE, a * 0.35 * (1 - ph) * (0.4 + intensity * 0.6));
      c.beginPath();
      c.arc(x, y, 20 + ph * M * 0.6 + wob, 0, Math.PI * 2);
      c.stroke();
    }
    this.glow(x, y, M * (0.18 + 0.1 * p), GOLD, a * (0.3 + 0.2 * p));
  }

  private drawSenses(a: number, t: number, p: number) {
    const c = this.ctx;
    const calm = 1 - 0.85 * p; // senses pacify over time
    const cols = [TEAL, VIOLET, GOLD, ROSE];
    c.lineCap = 'round';
    for (let s = 0; s < 6; s++) {
      c.beginPath();
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const yy = -0.5 + u * 0.85;
        const xx = Math.sin(u * 6 + t * (0.6 + s * 0.1) + s) * (0.12 + 0.04 * s) * calm + (s - 2.5) * 0.04;
        const [px, py] = this.toScreen(xx, yy);
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.lineWidth = 2 + 4 * calm;
      c.strokeStyle = rgba(cols[s % 4], a * 0.16 * (0.3 + calm));
      c.stroke();
    }
    // inner lights: flashes that become rarer
    if (Math.random() < 0.05 * calm * a) {
      this.sparks.push({ x: this.w * (0.3 + Math.random() * 0.4), y: this.h * (0.2 + Math.random() * 0.4), t, c: cols[(Math.random() * 4) | 0] });
    }
    this.sparks = this.sparks.filter((s) => t - s.t < 3);
    for (const s of this.sparks) {
      const e = (t - s.t) / 3;
      this.glow(s.x, s.y, 50, s.c, 0.35 * Math.sin(e * Math.PI) * a);
    }
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    this.glow(x, y, Math.min(this.w, this.h) * 0.25, GOLD, a * 0.2 * (1 - calm * 0.5));
  }

  private drawMetta(a: number, t: number, circle: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(HEART[0], HEART[1]);
    const M = Math.max(this.w, this.h);
    const reach = [0.12, 0.22, 0.3, 0.4, 0.5, 1.1][Math.min(5, circle)];
    this.glow(x, y, M * reach * 0.9, ROSE, a * 0.18);
    this.glow(x, y, M * 0.06, GOLD_HI, a * 0.55);
    for (let i = 0; i < 5; i++) {
      const ph = (t * 0.07 + i / 5) % 1;
      c.lineWidth = 1.5;
      c.strokeStyle = rgba(ROSE, a * 0.4 * (1 - ph));
      c.beginPath();
      c.arc(x, y, ph * M * reach, 0, Math.PI * 2);
      c.stroke();
    }
    // beings: one orbit per circle of people, lit as the warmth reaches them
    const r = rand(11);
    const orbits = [0, 0.16, 0.24, 0.32, 0.42, 0.55];
    for (let o = 1; o < 6; o++) {
      const n = o === 5 ? 60 : 1 + o;
      for (let i = 0; i < n; i++) {
        const ang = r() * Math.PI * 2 + t * 0.01 * (o % 2 ? 1 : -1);
        const rr = orbits[o] * M * (o === 5 ? 0.6 + r() * 0.8 : 1);
        const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * 0.8;
        const lit = circle >= o ? 1 : 0.15;
        this.glow(px, py, o === 5 ? 8 : 16, lit > 0.5 ? GOLD_HI : VIOLET, a * 0.7 * lit);
      }
    }
  }

  private drawWalk(a: number, t: number, parts: 3 | 6) {
    const c = this.ctx;
    const { w, h } = this;
    const step = parts === 3 ? 4.8 : 8.4;
    const n = Math.floor(t / step);
    const f = (t % step) / step;
    const stride = Math.min(h * 0.16, 120);
    const footW = Math.min(w, h) * 0.07, footH = footW * 2.3;
    const gap = footW * 0.9;
    const baseY = h * 0.62;
    // path
    c.strokeStyle = rgba(VIOLET, a * 0.15);
    c.lineWidth = footW * 3.2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(w / 2, h * 0.05);
    c.lineTo(w / 2, h * 0.95);
    c.stroke();
    // phase name
    const names3 = ['lift', 'move', 'place'];
    const names6 = ['heel rising', 'lifting', 'moving', 'lowering', 'touching', 'pressing'];
    const names = parts === 3 ? names3 : names6;
    const pi = Math.min(names.length - 1, Math.floor(f * names.length));
    const moving = n % 2; // which foot steps
    // foot travel
    const ease = (u: number) => u * u * (3 - 2 * u);
    let travel = 0, lift = 0;
    if (parts === 3) {
      travel = ease(Math.min(1, Math.max(0, (f - 0.25) / 0.5)));
      lift = Math.sin(Math.min(1, f / 0.9) * Math.PI);
    } else {
      travel = ease(Math.min(1, Math.max(0, (f - 0.25) / 0.4)));
      lift = f < 0.17 ? f / 0.17 * 0.3 : f < 0.66 ? 0.3 + 0.7 * Math.sin(((f - 0.17) / 0.49) * Math.PI / 2 + 0) : Math.max(0, 1 - (f - 0.66) / 0.17);
    }
    for (const side of [0, 1]) {
      const isMoving = side === moving;
      const cx = w / 2 + (side ? gap : -gap);
      // Walker-centered view: the stepping foot travels forward while the standing
      // foot slides back beneath the body, so roles swap seamlessly each step.
      const y = baseY + (isMoving ? stride * (0.5 - travel) : stride * (-0.5 + travel));
      const s = 1 + (isMoving ? lift * 0.12 : 0);
      // shadow
      c.fillStyle = rgba([0, 0, 0], a * 0.35 * (isMoving ? lift : 0));
      c.beginPath();
      c.ellipse(cx + 6, y + 10, footW * 0.5, footH * 0.5, 0, 0, Math.PI * 2);
      c.fill();
      // foot glow: pressure shows where weight is
      const weight = isMoving ? 1 - lift : 1;
      this.glow(cx, y, footH * 0.9, GOLD, a * 0.25 * weight);
      c.fillStyle = rgba(isMoving ? GOLD_HI : [190, 196, 235], a * (isMoving ? 0.85 : 0.55));
      c.beginPath();
      c.ellipse(cx, y, footW * 0.5 * s, footH * 0.5 * s, 0, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 5; i++) {
        const tx = cx + (side ? -1 : 1) * (-footW * 0.36 + i * footW * 0.17);
        const ty = y - footH * 0.5 * s - footW * 0.18 + Math.abs(i - (side ? 3.5 : 0.5)) * footW * 0.03;
        c.beginPath();
        c.arc(tx, ty, footW * (i === (side ? 4 : 0) ? 0.14 : 0.09) * s, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.textAlign = 'center';
    c.fillStyle = rgba(GOLD_HI, a * 0.9);
    c.font = `italic 500 ${Math.round(Math.min(w, h) * 0.085)}px "Cormorant Garamond", Georgia, serif`;
    c.fillText(names[pi], w / 2, h * 0.24);
    c.font = `500 ${Math.round(Math.min(w, h) * 0.028)}px Figtree, system-ui, sans-serif`;
    c.fillStyle = rgba([200, 204, 230], a * 0.5);
    c.fillText(names.map((_, i) => (i === pi ? `●` : `·`)).join('  '), w / 2, h * 0.24 + Math.min(w, h) * 0.06);
  }

  // ---------------- interactive overlays ----------------
  private drawCount(a: number, nowS: number) {
    const c = this.ctx;
    const { w, h } = this;
    const n = this.ctl.count;
    const flash = Math.min(1, Math.max(0, 1 - (nowS - this.ctl.countAt) / 1.6));
    const size = Math.min(w, h) * 0.24;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `300 ${Math.round(size)}px "Cormorant Garamond", Georgia, serif`;
    c.fillStyle = rgba(GOLD_HI, a * (0.14 + 0.5 * flash));
    c.fillText(n ? String(n) : '·', w / 2, h * 0.17);
    // ten beads
    const r = Math.min(w, h) * 0.011;
    const span = r * 3.4;
    for (let i = 0; i < 10; i++) {
      const px = w / 2 + (i - 4.5) * span;
      const py = h * 0.17 + size * 0.48;
      c.fillStyle = i < n ? rgba(GOLD, a * 0.8) : rgba(VIOLET, a * 0.25);
      c.beginPath();
      c.arc(px, py, r * (i === n - 1 ? 1 + flash * 0.6 : 1), 0, Math.PI * 2);
      c.fill();
    }
    c.textBaseline = 'alphabetic';
  }

  private drawTrace(a: number, nowS: number, connect: boolean) {
    const c = this.ctx;
    const { w, h } = this;
    const log = this.ctl.breathLog;
    const x0 = Math.max(20, w * 0.08), x1 = w - x0;
    const top = h * 0.135, bot = h * 0.215;
    const win = 30;
    const tx = (tt: number) => x1 - ((nowS - tt) / win) * (x1 - x0);
    // baseline
    c.strokeStyle = rgba(VIOLET, a * 0.18);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x0, bot);
    c.lineTo(x1, bot);
    c.stroke();
    if (!this.levelHist.length) return;
    // area under the breath
    c.beginPath();
    c.moveTo(tx(this.levelHist[0].t), bot);
    for (const p of this.levelHist) c.lineTo(tx(p.t), bot - p.v * (bot - top));
    c.lineTo(tx(this.levelHist[this.levelHist.length - 1].t), bot);
    c.closePath();
    const g = c.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, rgba(GOLD, a * 0.35));
    g.addColorStop(1, rgba(GOLD, 0));
    c.fillStyle = g;
    c.fill();
    c.beginPath();
    this.levelHist.forEach((p, i) => (i ? c.lineTo(tx(p.t), bot - p.v * (bot - top)) : c.moveTo(tx(p.t), bot - p.v * (bot - top))));
    c.strokeStyle = rgba(GOLD_HI, a * 0.8);
    c.lineWidth = 1.5;
    c.stroke();
    // markers at each beginning and end
    c.font = `500 10px Figtree, system-ui, sans-serif`;
    c.textAlign = 'center';
    for (const e of log) {
      if (nowS - e.t > win) continue;
      const x = tx(e.t);
      c.fillStyle = rgba(e.down ? GOLD_HI : VIOLET, a * 0.9);
      c.beginPath();
      c.arc(x, e.down ? bot : top, 3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = rgba([200, 204, 230], a * 0.55);
      c.fillText(e.down ? 'in' : 'out', x, e.down ? bot + 14 : top - 8);
    }
    if (connect) {
      const br = breathsFromLog(log);
      const last = br.slice(-4);
      if (last.length) {
        const y = bot + 34;
        c.textAlign = 'center';
        c.font = `500 12px Figtree, system-ui, sans-serif`;
        const L = last[last.length - 1];
        const P = last.length > 1 ? last[last.length - 2] : null;
        let s = `in ${L.inDur.toFixed(1)}s`;
        if (L.outDur) s += `  ·  out ${L.outDur.toFixed(1)}s`;
        if (P) s += `   ${L.inDur > P.inDur + 0.25 ? 'longer ↑' : L.inDur < P.inDur - 0.25 ? 'shorter ↓' : 'about the same'}`;
        c.fillStyle = rgba(GOLD_HI, a * 0.85);
        c.fillText(s, w / 2, y);
      }
    }
  }

  private drawPulses(nowS: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(NOSE[0], NOSE[1]);
    const M = Math.max(this.w, this.h);
    for (const p of this.ctl.pulses) {
      const e = (nowS - p) / 5;
      if (e < 0 || e > 1) continue;
      c.lineWidth = 2 * (1 - e) + 0.5;
      c.strokeStyle = rgba(VIOLET, 0.7 * (1 - e));
      c.beginPath();
      c.arc(x, y, 12 + e * M * 0.55, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = rgba(GOLD, 0.35 * (1 - e));
      c.beginPath();
      c.arc(x, y, 6 + e * M * 0.35, 0, Math.PI * 2);
      c.stroke();
    }
  }

  private drawLabels(nowS: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(NOSE[0], NOSE[1]);
    const M = Math.min(this.w, this.h);
    c.textAlign = 'center';
    for (const l of this.ctl.labels) {
      const age = nowS - l.t;
      if (age > 16) continue;
      const e = Math.min(1, age / 5);
      const ease = 1 - (1 - e) ** 3;
      const ang = l.seed * Math.PI * 2;
      const r = M * (0.08 + 0.36 * ease);
      const px = x + Math.cos(ang) * r;
      const py = y + Math.sin(ang) * r * 0.8;
      const al = age < 5 ? 0.95 - 0.6 * ease : 0.35 * Math.max(0, 1 - (age - 5) / 11);
      c.font = `italic 500 ${Math.round(M * (0.065 - 0.025 * ease))}px "Cormorant Garamond", Georgia, serif`;
      c.fillStyle = rgba([210, 214, 245], al);
      c.fillText(l.text, px, py);
    }
  }

  private drawAha(nowS: number) {
    const c = this.ctx;
    const [x, y] = this.toScreen(NOSE[0], NOSE[1]);
    const M = Math.min(this.w, this.h);
    for (const t0 of this.ctl.aha) {
      const e = (nowS - t0) / 2.6;
      if (e < 0 || e > 1) continue;
      const ease = 1 - (1 - e) ** 3;
      this.glow(x, y, M * (0.1 + 0.5 * ease), GOLD, 0.35 * (1 - e));
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2 + t0;
        const r = M * (0.05 + 0.35 * ease);
        c.fillStyle = rgba(GOLD_HI, 0.9 * (1 - e));
        c.beginPath();
        c.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r, 2.2 * (1 - e) + 0.6, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  private drawDull(nowS: number) {
    const e = (nowS - this.ctl.dullAt) / 3;
    if (e < 0 || e > 1) return;
    const c = this.ctx;
    c.fillStyle = rgba([235, 240, 255], 0.12 * Math.sin(e * Math.PI));
    c.fillRect(0, 0, this.w, this.h);
  }
}

export interface BreathRec { inStart: number; inDur: number; outDur: number }

export function breathsFromLog(log: { t: number; down: boolean }[]): BreathRec[] {
  const out: BreathRec[] = [];
  for (let i = 0; i < log.length; i++) {
    if (!log[i].down) continue;
    const up = log[i + 1];
    if (!up || up.down) continue;
    const next = log[i + 2];
    const inDur = up.t - log[i].t;
    if (inDur < 0.3 || inDur > 20) continue;
    const outDur = next && next.down && next.t - up.t < 30 ? next.t - up.t : 0;
    out.push({ inStart: log[i].t, inDur, outDur });
  }
  return out;
}

// Still frames for thumbnails, rendered once and cached.
const stillCache = new Map<string, string>();
export function stillFrame(mode: VisualMode, w = 480, h = 300, extra: Partial<SceneInput> = {}): string {
  const key = `${mode}-${w}-${h}-${JSON.stringify(extra)}`;
  const hit = stillCache.get(key);
  if (hit) return hit;
  try {
    const cv = document.createElement('canvas');
    const ctl = newControl();
    const sc = new Scene(cv, ctl);
    sc.fixedSize = [w, h];
    sc.snap(mode);
    // Seed demo interaction so thumbnails show what each technique looks like in use.
    ctl.count = 4;
    ctl.countAt = 3.9;
    if (mode === 'label') ctl.labels.push({ text: 'planning', t: 0.5, seed: 0.12 }, { text: 'hearing', t: 2.2, seed: 0.62 });
    if (mode === 'checkin') ctl.pulses.push(2.6, 0.2);
    const traced = mode === 'follow' || mode === 'connect';
    let now = 0;
    for (let i = 0; i < 130; i++) {
      now += 33;
      if (traced) {
        const s = now / 1000;
        const down = s % 4.4 < 1.9;
        if (down !== ctl.held) { ctl.held = down; ctl.breathLog.push({ t: s, down }); }
      }
      sc.frame(now, { mode, progress: 0.3, preview: false, ...extra });
    }
    const url = cv.toDataURL('image/jpeg', 0.82);
    stillCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}
