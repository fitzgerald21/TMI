// Spoken guidance. Prefers clips recorded with a neural voice (public/voice/<voice>/<key>.mp3,
// made by scripts/voice/generate.py), played through Web Audio so they sound in iOS silent mode
// like the bells. Falls back to the device's speech engine for any line without a clip.
import clipIndex from '../content/voiceClips.json';
import { audioContext } from './audio';
import { lineKey } from './voiceKey';

export const RECORDED_VOICES: { id: string; label: string }[] = [
  { id: 'heart', label: 'Heart · warm, American' },
  { id: 'emma', label: 'Emma · soft, British' },
  { id: 'michael', label: 'Michael · calm, American' },
].filter((v) => clipIndex.voices.includes(v.id));
const CLIPS = clipIndex.clips as Record<string, number>;
const RECORDED_PREFIX = 'lantern:';
const GAP_MS = 450; // pause between queued lines

let recorded: string | null = RECORDED_VOICES[0]?.id ?? null; // null = use device voice
let deviceVoice: SpeechSynthesisVoice | null = null;
let rate = 0.88;
let enabled = true;

// ---------- device speech (fallback) ----------
const PREFERRED = [
  'Samantha', 'Serena', 'Karen', 'Moira', 'Tessa', 'Daniel',
  'Google UK English Female', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Sonia',
];

export function voiceSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!voiceSupported()) return [];
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

/** True when the chosen voice is one of Lantern's recorded voices. */
export function isRecordedVoice(name: string) {
  return !name || name.startsWith(RECORDED_PREFIX);
}
export const recordedVoiceName = (id: string) => RECORDED_PREFIX + id;

/** name: '' (default recorded voice), 'lantern:<id>', or a device voice name. */
export function configureVoice(opts: { name?: string; rate?: number; enabled?: boolean }) {
  if (opts.rate) rate = opts.rate;
  if (opts.enabled !== undefined) enabled = opts.enabled;
  if (opts.name !== undefined) {
    if (isRecordedVoice(opts.name)) {
      const id = opts.name.slice(RECORDED_PREFIX.length);
      recorded = RECORDED_VOICES.find((v) => v.id === id)?.id ?? RECORDED_VOICES[0]?.id ?? null;
    } else recorded = null;
  }
  const voices = listVoices();
  deviceVoice = (opts.name && voices.find((v) => v.name === opts.name)) || null;
  if (!deviceVoice) {
    for (const p of PREFERRED) {
      const v = voices.find((x) => x.name.includes(p));
      if (v) { deviceVoice = v; break; }
    }
  }
  if (!deviceVoice) deviceVoice = voices.find((v) => v.localService) || voices[0] || null;
}

if (voiceSupported()) {
  speechSynthesis.onvoiceschanged = () => configureVoice({});
}

function speakDevice(text: string, onDone?: () => void) {
  if (onDone) {
    // iOS sometimes never fires onend; don't let that stall the queue.
    const orig = onDone;
    let called = false;
    const t = window.setTimeout(() => once(), (text.length * 90) / rate + 4000);
    const once = () => { if (!called) { called = true; window.clearTimeout(t); orig(); } };
    onDone = once;
  }
  if (!voiceSupported()) return onDone?.();
  try {
    // Split on sentence boundaries so pauses fall naturally and long text doesn't get cut off.
    const parts = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      if (deviceVoice) u.voice = deviceVoice;
      u.rate = rate;
      u.pitch = 0.96;
      u.volume = 0.95;
      if (i === parts.length - 1 && onDone) { u.onend = () => onDone(); u.onerror = () => onDone(); }
      speechSynthesis.speak(u);
    });
  } catch {
    onDone?.();
  }
}

// ---------- recorded clips ----------
const raw = new Map<string, Promise<ArrayBuffer>>();
const decoded = new Map<string, Promise<AudioBuffer>>();
const clipUrl = (voice: string, text: string) => `voice/${voice}/${lineKey(text)}.mp3`;
const hasClip = (text: string) => lineKey(text) in CLIPS;

function fetchClip(url: string) {
  let p = raw.get(url);
  if (!p) {
    p = fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))));
    p.catch(() => raw.delete(url));
    raw.set(url, p);
  }
  return p;
}

function decodeClip(ctx: AudioContext, url: string) {
  let p = decoded.get(url);
  if (!p) {
    // Callback form: older Safari doesn't return a promise from decodeAudioData.
    p = fetchClip(url).then((ab) => new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(ab.slice(0), res, rej)));
    p.catch(() => decoded.delete(url));
    decoded.set(url, p);
  }
  return p;
}

/** Download the clips a sit will use, so they play instantly (and offline). */
export function preloadLines(lines: string[]) {
  if (!recorded || !enabled) return;
  const voice = recorded;
  lines.filter(hasClip).forEach((t) => fetchClip(clipUrl(voice, t)).catch(() => {}));
}

// ---------- queue ----------
let queue: string[] = [];
let playing = false;
let current: AudioBufferSourceNode | null = null;
let generation = 0; // bumped by hush/interrupt so stale loads don't play
let gapTimer = 0;
let voiceGain: GainNode | null = null;

function next() {
  if (playing) return;
  const text = queue.shift();
  if (text === undefined) return;
  playing = true;
  const gen = generation;
  const done = () => {
    if (gen !== generation) return;
    current = null;
    gapTimer = window.setTimeout(() => {
      if (gen !== generation) return;
      playing = false;
      next();
    }, GAP_MS);
  };
  const ctx = audioContext();
  if (recorded && ctx && hasClip(text)) {
    decodeClip(ctx, clipUrl(recorded, text))
      .then((buf) => {
        if (gen !== generation) return;
        if (ctx.state !== 'running') ctx.resume().catch(() => {});
        if (!voiceGain || voiceGain.context !== ctx) {
          voiceGain = ctx.createGain();
          voiceGain.gain.value = 1;
          voiceGain.connect(ctx.destination);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(voiceGain);
        src.onended = done;
        current = src;
        src.start();
      })
      .catch(() => gen === generation && speakDevice(text, done));
  } else {
    speakDevice(text, done);
  }
}

export function speak(text: string, opts: { interrupt?: boolean } = {}) {
  if (!enabled || !text) return;
  if (opts.interrupt) hush();
  queue.push(text);
  next();
}

export function hush() {
  generation++;
  queue = [];
  playing = false;
  window.clearTimeout(gapTimer);
  try { current?.stop(); } catch { /* already stopped */ }
  current = null;
  if (voiceSupported()) speechSynthesis.cancel();
}

/** iOS needs a speak() call inside a user gesture before later device-speech calls are allowed. */
export function primeVoice() {
  if (!voiceSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
