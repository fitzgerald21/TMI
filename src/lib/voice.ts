// Gentle spoken guidance via the Web Speech API.
let chosen: SpeechSynthesisVoice | null = null;
let rate = 0.88;
let enabled = true;

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

export function configureVoice(opts: { name?: string; rate?: number; enabled?: boolean }) {
  if (opts.rate) rate = opts.rate;
  if (opts.enabled !== undefined) enabled = opts.enabled;
  const voices = listVoices();
  if (opts.name) chosen = voices.find((v) => v.name === opts.name) || null;
  if (!chosen) {
    for (const p of PREFERRED) {
      const v = voices.find((x) => x.name.includes(p));
      if (v) { chosen = v; break; }
    }
  }
  if (!chosen) chosen = voices.find((v) => v.localService) || voices[0] || null;
}

if (voiceSupported()) {
  speechSynthesis.onvoiceschanged = () => configureVoice({});
}

export function speak(text: string, opts: { interrupt?: boolean } = {}) {
  if (!enabled || !voiceSupported() || !text) return;
  try {
    if (opts.interrupt) speechSynthesis.cancel();
    // Split on sentence boundaries so pauses fall naturally and long text doesn't get cut off.
    const parts = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
    for (const p of parts) {
      const u = new SpeechSynthesisUtterance(p);
      if (chosen) u.voice = chosen;
      u.rate = rate;
      u.pitch = 0.96;
      u.volume = 0.95;
      speechSynthesis.speak(u);
    }
  } catch {
    /* ignore */
  }
}

export function hush() {
  if (voiceSupported()) speechSynthesis.cancel();
}

/** iOS needs a speak() call inside a user gesture before later calls are allowed. */
export function primeVoice() {
  if (!voiceSupported()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
