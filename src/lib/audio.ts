// Synthesized singing-bowl bells and soft chimes via Web Audio (no audio files needed).
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.7;

export function setVolume(v: number) {
  volume = v;
  if (master) master.gain.value = v;
}

// iOS Safari plays Web Audio on the "ambient" channel, which the ring/silent switch mutes, while
// still showing the tab as playing sound. Asking for the "playback" channel (like music and video)
// makes bells and voice audible in silent mode. Safari 16.4+ exposes navigator.audioSession; older
// versions switch channel when an <audio> element is playing, so we also loop a silent clip.
let keepAlive: HTMLAudioElement | null = null;

function silentWavUrl(): string {
  const rate = 8000, samples = rate / 2; // half a second of 8-bit silence
  const buf = new ArrayBuffer(44 + samples);
  const v = new DataView(buf);
  const str = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

function usePlaybackChannel() {
  try {
    const session = (navigator as any).audioSession;
    if (session && session.type !== 'playback') session.type = 'playback';
  } catch { /* not supported */ }
  try {
    if (!keepAlive) {
      keepAlive = new Audio(silentWavUrl());
      keepAlive.loop = true;
      keepAlive.setAttribute('playsinline', '');
      keepAlive.setAttribute('x-webkit-airplay', 'deny');
    }
    if (keepAlive.paused) keepAlive.play().catch(() => {});
  } catch { /* not supported */ }
}

/** Call from a tap/click. Creates or wakes the audio engine (iOS only allows this inside a gesture). */
export function unlockAudio() {
  usePlaybackChannel();
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
      // A one-sample silent buffer started inside the gesture fully unlocks older iOS.
      const b = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = b;
      src.connect(ctx.destination);
      src.start(0);
    }
    // iOS also uses a non-standard "interrupted" state (calls, Siri, screen lock).
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
  } catch {
    /* audio unsupported */
  }
}

/** Stop holding the media channel (so we don't keep the "now playing" state after a sit). */
export function releaseAudio() {
  try { keepAlive?.pause(); } catch { /* ignore */ }
}

// Any tap re-wakes audio that iOS suspended (e.g. after the screen locked or a call came in).
if (typeof window !== 'undefined') {
  const wake = () => { if (ctx && ctx.state !== 'running') unlockAudio(); };
  window.addEventListener('pointerdown', wake, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
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
