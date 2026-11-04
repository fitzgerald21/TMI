import { createContext, useContext, useEffect, useState } from 'react';
import { useRoute, go } from './lib/router';
import type { Script } from './session/script';
import { Session } from './session/Session';
import { Home } from './pages/Home';
import { StagePage } from './pages/StagePage';
import { Practice } from './pages/Practice';
import { Learn } from './pages/Learn';
import { Journal } from './pages/Journal';
import { Finder } from './pages/Finder';
import { Prefs } from './pages/Prefs';
import { Welcome } from './pages/Welcome';
import { useStore } from './lib/store';

const StartCtx = createContext<(s: Script) => void>(() => {});
export const useStart = () => useContext(StartCtx);

const TABS = [
  { route: 'home', label: 'Path', icon: PathIcon },
  { route: 'practice', label: 'Practice', icon: SitIcon },
  { route: 'learn', label: 'Learn', icon: BookIcon },
  { route: 'journal', label: 'Journal', icon: JournalIcon },
];

export function App() {
  const route = useRoute();
  const [script, setScript] = useState<Script | null>(null);
  const onboarded = useStore((s) => s.onboarded);

  useEffect(() => {
    document.title = script ? `${script.title} · Lantern` : 'Lantern';
  }, [script]);

  if (script) return <Session script={script} onExit={() => setScript(null)} />;

  const [base, arg] = splitRoute(route);
  let page;
  switch (base) {
    case 'stage': page = <StagePage n={Number(arg) || 1} />; break;
    case 'practice': page = <Practice />; break;
    case 'learn': page = <Learn topic={arg} />; break;
    case 'journal': page = <Journal />; break;
    case 'finder': page = <Finder />; break;
    case 'prefs': page = <Prefs />; break;
    default: page = onboarded ? <Home /> : <Welcome />;
  }
  const active = base === 'stage' || base === 'finder' ? 'home' : base;

  return (
    <StartCtx.Provider value={setScript}>
      <div className="shell">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="Lantern home">
            <LanternMark />
            <span>Lantern</span>
          </a>
          <nav className="topnav" aria-label="Main">
            {TABS.map((t) => (
              <a key={t.route} href={`#${t.route}`} className={active === t.route ? 'on' : ''}>
                {t.label}
              </a>
            ))}
          </nav>
          <a className={`prefs-link ${base === 'prefs' ? 'on' : ''}`} href="#prefs" aria-label="Preferences">
            <GearIcon />
          </a>
        </header>
        <main className="main" key={route}>{page}</main>
        <footer className="foot">
          <p>
            Lantern is an unofficial study companion to <em>The Mind Illuminated</em> by Culadasa (John Yates, PhD), Matthew Immergut and Jeremy Graves.
            Summaries here are paraphrased. Read the book for the full teaching.
          </p>
        </footer>
        <nav className="tabbar" aria-label="Main">
          {TABS.map((t) => (
            <button key={t.route} className={active === t.route ? 'on' : ''} onClick={() => go(t.route)}>
              <t.icon />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </StartCtx.Provider>
  );
}

function splitRoute(r: string): [string, string] {
  if (r.startsWith('stage-')) return ['stage', r.slice(6)];
  if (r.startsWith('learn-')) return ['learn', r.slice(6)];
  return [r, ''];
}

export function LanternMark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--aware)" strokeOpacity=".55" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="8" fill="var(--accent)" fillOpacity=".22" />
      <circle cx="16" cy="16" r="3.4" fill="var(--accent)" />
    </svg>
  );
}

function PathIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21c0-4 10-4 10-8s-10-4-10-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="7" cy="5" r="2" /><circle cx="17" cy="13" r="2" /><circle cx="7" cy="21" r="1.4" /></svg>;
}
function SitIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="2.6" /><path d="M12 9c-3 0-4.5 2-4.8 5.5L5 17.5c-.6.9 0 2 1 2h12c1 0 1.6-1.1 1-2l-2.2-3C16.5 11 15 9 12 9z" /></svg>;
}
function BookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 6v13.5" stroke="currentColor" strokeWidth="1.7" /></svg>;
}
function JournalIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="8.5" cy="9" r="1.3" /><circle cx="12" cy="9" r="1.3" /><circle cx="15.5" cy="9" r="1.3" /><circle cx="8.5" cy="13" r="1.3" /><circle cx="12" cy="13" r="1.3" opacity=".4" /><circle cx="15.5" cy="13" r="1.3" opacity=".4" /></svg>;
}
function GearIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="16" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><circle cx="8" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /></svg>;
}
