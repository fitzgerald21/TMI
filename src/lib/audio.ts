// Synthesized singing-bowl bells and soft chimes via Web Audio (no audio files needed).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.7;

export function setVolume(v: number) {
  volume = v;
  if (master) master.gain.value = v;
}

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      // gentle reverb-ish tail via a feedback delay
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.19;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      const wet = ctx.createGain();
      wet.gain.value = 0.25;
      master.connect(ctx.destination);
      master.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    /* audio unsupported */
  }
}

function partial(freq: number, gain: number, decay: number, when: number, detune = 0) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  o.detune.value = detune;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  o.connect(g);
  g.connect(master);
  o.start(when);
  o.stop(when + decay + 0.05);
}

/** A singing-bowl strike. */
export function bell(opts: { pitch?: number; strength?: number; delay?: number } = {}) {
  unlockAudio();
  if (!ctx) return;
  const f = opts.pitch ?? 196; // G3
  const s = opts.strength ?? 1;
  const t = ctx.currentTime + (opts.delay ?? 0);
  // Inharmonic bowl partials with slow beating pairs.
  const ratios: [number, number, number][] = [
    [1, 0.34, 9],
    [2.71, 0.22, 7],
    [5.15, 0.11, 5],
    [8.42, 0.05, 3.2],
    [12.3, 0.025, 2],
  ];
  for (const [r, g, d] of ratios) {
    partial(f * r, g * s, d, t, -3);
    partial(f * r, g * s * 0.7, d * 0.95, t, 4);
  }
}

export function bells(n: number, gap = 2.8) {
  for (let i = 0; i < n; i++) bell({ delay: i * gap, strength: i === n - 1 ? 1 : 0.85 });
}

/** A small, high, very soft chime used for check-ins and transitions. */
export function chime(strength = 0.5) {
  unlockAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  partial(880, 0.12 * strength, 2.4, t, 0);
  partial(880 * 2.76, 0.05 * strength, 1.6, t, 3);
  partial(1318.5, 0.06 * strength, 2.0, t + 0.12, 0);
}

/** A tiny tick for taps (counting etc.). */
export function tick(strength = 0.3) {
  unlockAudio();
  if (!ctx) return;
  partial(1560, 0.05 * strength, 0.35, ctx.currentTime);
}
