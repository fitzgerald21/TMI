import { useSyncExternalStore } from 'react';

export type GuidanceLevel = 'full' | 'light' | 'bells';

export interface SessionRecord {
  id: string;
  date: string; // ISO
  kind: 'guided' | 'drill' | 'timer' | 'walking' | 'metta';
  title: string;
  stage: number;
  minutes: number;
  completed: boolean;
  aha: number;
  labels: Record<string, number>;
  dullness: number;
  stability?: number; // 1-5
  clarity?: number; // 1-5
  notes?: string;
  goal?: string;
  motivation?: string;
  breath?: { inAvg: number; outAvg: number; count: number };
}

export interface Settings {
  voice: boolean;
  voiceName: string;
  voiceRate: number;
  bells: boolean;
  bellVolume: number;
  guidance: GuidanceLevel;
  prep: boolean;
  dim: boolean;
  haptics: boolean;
  defaultMinutes: number;
}

export interface State {
  stage: number;
  sessions: SessionRecord[];
  settings: Settings;
  onboarded: boolean;
}

const KEY = 'lantern.v1';

const DEFAULT: State = {
  stage: 1,
  sessions: [],
  onboarded: false,
  settings: {
    voice: true,
    voiceName: '',
    voiceRate: 0.88,
    bells: true,
    bellVolume: 0.7,
    guidance: 'full',
    prep: true,
    dim: true,
    haptics: true,
    defaultMinutes: 20,
  },
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...(parsed.settings || {}) } };
  } catch {
    return DEFAULT;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: keep in memory */
  }
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  listeners.forEach((l) => l());
}

export function updateSettings(p: Partial<Settings>) {
  setState((s) => ({ settings: { ...s.settings, ...p } }));
}

export function addSession(r: SessionRecord) {
  setState((s) => ({ sessions: [r, ...s.sessions] }));
}

export function updateSession(id: string, p: Partial<SessionRecord>) {
  setState((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
}

export function deleteSession(id: string) {
  setState((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) }));
}

export function getState() {
  return state;
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sel(state),
    () => sel(state)
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ---- derived stats ----
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function streak(sessions: SessionRecord[]): number {
  const days = new Set(sessions.filter((s) => s.minutes >= 1).map((s) => dayKey(new Date(s.date))));
  let n = 0;
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); // today not done yet: streak continues from yesterday
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function minutesByDay(sessions: SessionRecord[]) {
  const m = new Map<string, number>();
  for (const s of sessions) {
    const k = dayKey(new Date(s.date));
    m.set(k, (m.get(k) || 0) + s.minutes);
  }
  return m;
}
