import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SceneCanvas } from '../visual/SceneCanvas';
import { newControl, breathsFromLog } from '../visual/scene';
import { SCAN_REGIONS, type Script } from './script';
import { bell, bells, chime, tick, unlockAudio, setVolume } from '../lib/audio';
import { speak, hush, configureVoice, primeVoice } from '../lib/voice';
import { addSession, uid, useStore, updateSettings, type SessionRecord } from '../lib/store';
import { Prep, type PrepResult } from './Prep';
import { Review } from './Review';

const LABELS = ['Thinking', 'Planning', 'Remembering', 'Hearing', 'Body', 'Feeling', 'Imagining'];
const DULL_REMEDIES = [
  'Take three slightly deeper breaths, then let the breath be natural.',
  'Straighten the spine and lift the crown of the head.',
  'Briefly tense the whole body, then relax.',
  'If needed, open the eyes a little.',
];

const fmt = (s: number) => {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function Session({ script, onExit }: { script: Script; onExit: () => void }) {
  const settings = useStore((s) => s.settings);
  const wantsPrep = settings.prep && script.kind === 'guided';
  const [stage, setStage] = useState<'prep' | 'ready' | 'run' | 'review'>(wantsPrep ? 'prep' : 'ready');
  const [prep, setPrep] = useState<PrepResult>({ motivation: '', goal: '' });
  const [record, setRecord] = useState<SessionRecord | null>(null);

  useEffect(() => {
    configureVoice({ name: settings.voiceName, rate: settings.voiceRate, enabled: settings.voice && settings.guidance !== 'bells' });
    setVolume(settings.bellVolume);
  }, [settings.voiceName, settings.voiceRate, settings.voice, settings.guidance, settings.bellVolume]);

  useEffect(() => {
    document.body.classList.add('in-session');
    return () => {
      document.body.classList.remove('in-session');
      hush();
    };
  }, []);

  if (stage === 'prep')
    return (
      <Prep
        stage={script.stage}
        onCancel={onExit}
        onDone={(r) => {
          setPrep(r);
          unlockAudio();
          primeVoice();
          setStage('run');
        }}
      />
    );
  if (stage === 'ready') return <Ready script={script} onCancel={onExit} onBegin={() => { unlockAudio(); primeVoice(); setStage('run'); }} />;
  if (stage === 'review' && record) return <Review record={record} onDone={onExit} />;
  return (
    <Runner
      script={script}
      prep={prep}
      onFinish={(r) => {
        addSession(r);
        setRecord(r);
        setStage('review');
      }}
      onAbandon={onExit}
    />
  );
}

function Ready({ script, onBegin, onCancel }: { script: Script; onBegin: () => void; onCancel: () => void }) {
  const total = script.segments.reduce((a, s) => a + s.dur, 0);
  const first = script.segments.find((s) => s.phase === 'Practice') || script.segments[0];
  return (
    <div className="prep">
      <SceneCanvas className="prep-bg" input={{ mode: first.visual, progress: 0.2, preview: true, walk: first.walk, metta: 2 }} />
      <div className="prep-inner ready">
        <div className="prep-top">
          <button className="ghost small" onClick={onCancel}>Cancel</button>
          <span />
          <span />
        </div>
        <div className="prep-card">
          <div className="eyebrow">{Math.round(total / 60)} minutes</div>
          <h2 className="display">{script.title}</h2>
          <ol className="seglist">
            {script.segments.map((s) => (
              <li key={s.id}>
                <span>{s.title}</span>
                <span className="muted tabnum">{fmt(s.dur)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="prep-actions">
          <button className="btn primary big" onClick={onBegin}>Begin</button>
        </div>
      </div>
    </div>
  );
}

function Runner({ script, prep, onFinish, onAbandon }: { script: Script; prep: PrepResult; onFinish: (r: SessionRecord) => void; onAbandon: () => void }) {
  const settings = useStore((s) => s.settings);
  const segs = script.segments;
  const total = useMemo(() => segs.reduce((a, s) => a + s.dur, 0), [segs]);
  const starts = useMemo(() => {
    let acc = 0;
    return segs.map((s) => ((acc += s.dur), acc - s.dur));
  }, [segs]);

  const ctl = useRef(newControl()).current;
  const t0 = useRef(performance.now());
  const pausedAt = useRef<number | null>(null);
  const pausedTotal = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [aha, setAha] = useState(0);
  const [labels, setLabels] = useState<Record<string, number>>({});
  const [dull, setDull] = useState(0);
  const [showDull, setShowDull] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [idle, setIdle] = useState(false);
  const [held, setHeld] = useState(false);
  const [ahaFlash, setAhaFlash] = useState(0);
  const idleTimer = useRef<number>(0);
  const lastSeg = useRef(-1);
  const fired = useRef(new Set<string>());
  const lastRegion = useRef(-1);
  const finished = useRef(false);
  const wake = useRef<any>(null);

  const guidance = settings.guidance;
  const voiceOn = settings.voice && guidance !== 'bells';

  const now = () => (pausedAt.current ?? performance.now()) - t0.current - pausedTotal.current;

  let segIdx = starts.findIndex((s, i) => elapsed >= s && elapsed < s + segs[i].dur);
  if (segIdx < 0) segIdx = segs.length - 1;
  const seg = segs[segIdx];
  const segT = elapsed - starts[segIdx];
  const segP = Math.min(1, segT / seg.dur);

  // scan position
  let scanY: number | undefined;
  let regionIdx = -1;
  if (seg.scan) {
    const n = SCAN_REGIONS.length;
    const pos = Math.min(n - 1, segP * (n - 0.15) * 1.0);
    regionIdx = Math.min(n - 1, Math.floor(pos));
    const f = pos - regionIdx;
    const ease = f < 0.7 ? 0 : (f - 0.7) / 0.3; // dwell on a region, then glide
    const a = SCAN_REGIONS[regionIdx].y;
    const b = SCAN_REGIONS[Math.min(n - 1, regionIdx + 1)].y;
    scanY = a + (b - a) * ease * ease * (3 - 2 * ease);
  }

  const finish = useCallback(
    (completed: boolean) => {
      if (finished.current) return;
      finished.current = true;
      const br = breathsFromLog(ctl.breathLog);
      const withOut = br.filter((b) => b.outDur > 0);
      onFinish({
        id: uid(),
        date: new Date().toISOString(),
        kind: script.kind,
        title: script.title,
        stage: script.stage,
        minutes: Math.round((Math.min(total, now() / 1000) / 60) * 10) / 10,
        completed,
        aha,
        labels,
        dullness: dull,
        goal: prep.goal || undefined,
        motivation: prep.motivation || undefined,
        breath: br.length >= 3 ? { count: br.length, inAvg: avg(br.map((b) => b.inDur)), outAvg: withOut.length ? avg(withOut.map((b) => b.outDur)) : 0 } : undefined,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aha, labels, dull, prep, total]
  );

  // clock
  useEffect(() => {
    const id = window.setInterval(() => setElapsed(now() / 1000), 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the screen awake
  useEffect(() => {
    const req = async () => {
      try {
        wake.current = await (navigator as any).wakeLock?.request('screen');
      } catch { /* not available */ }
    };
    req();
    const onVis = () => document.visibilityState === 'visible' && req();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      try { wake.current?.release(); } catch { /* ignore */ }
    };
  }, []);

  // segment changes, cues, scan regions, end
  useEffect(() => {
    if (paused || finished.current) return;
    if (elapsed >= total) {
      if (settings.bells) bells(3);
      finish(true);
      return;
    }
    if (segIdx !== lastSeg.current) {
      const first = lastSeg.current === -1;
      lastSeg.current = segIdx;
      if (settings.bells) first ? bell() : chime(0.8);
      const delay = first ? 2600 : 900;
      const text = guidance === 'full' ? seg.say : guidance === 'light' ? seg.short || seg.title : '';
      if (voiceOn && text) window.setTimeout(() => !finished.current && speak(text), delay);
      if (seg.phase === 'Closing' && seg.visual !== 'metta') ctl.count = 0;
    }
    seg.cues?.forEach((cue, ci) => {
      if (segT < cue.first) return;
      if (cue.untilFrac && segP > cue.untilFrac) return;
      const k = Math.floor((segT - cue.first) / cue.every);
      if (seg.dur - segT < 12) return; // don't cue right before a transition
      const key = `${segIdx}-${ci}-${k}`;
      if (fired.current.has(key)) return;
      fired.current.add(key);
      if (cue.pulse) ctl.pulses.push(performance.now() / 1000);
      if (cue.chime && settings.bells) chime(0.45);
      if (cue.texts.length) {
        if (voiceOn && guidance === 'full') speak(cue.texts[k % cue.texts.length]);
        else if (!cue.chime && !cue.pulse && settings.bells && guidance !== 'full') chime(0.3);
      }
    });
    if (seg.scan && regionIdx !== lastRegion.current) {
      lastRegion.current = regionIdx;
      if (voiceOn && segT > 8) speak(`Now, ${SCAN_REGIONS[regionIdx].name}.`);
    }
  }, [elapsed, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-dim the controls
  const poke = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    if (settings.dim) idleTimer.current = window.setTimeout(() => setIdle(true), 12000);
  }, [settings.dim]);
  useEffect(() => {
    poke();
    return () => window.clearTimeout(idleTimer.current);
  }, [poke]);

  const vibrate = (ms: number) => settings.haptics && navigator.vibrate?.(ms);
  const nowS = () => performance.now() / 1000;

  const doAha = () => {
    ctl.aha.push(nowS());
    setAha((n) => n + 1);
    setAhaFlash((n) => n + 1);
    if (settings.bells) chime(0.35);
    vibrate(12);
    poke();
  };
  const doCount = () => {
    ctl.count = (ctl.count % 10) + 1;
    ctl.countAt = nowS();
    if (settings.bells) tick(0.6);
    vibrate(6);
  };
  const lostCount = () => {
    ctl.count = 0;
    ctl.countAt = nowS();
    doAha();
  };
  const doLabel = (l: string) => {
    ctl.labels.push({ text: l.toLowerCase(), t: nowS(), seed: Math.random() });
    setLabels((m) => ({ ...m, [l]: (m[l] || 0) + 1 }));
    vibrate(6);
    poke();
  };
  const doDull = () => {
    ctl.dullAt = nowS();
    setDull((n) => n + 1);
    setShowDull(true);
    if (voiceOn) speak('Brighten up. Take a few deeper breaths, and sit a little taller.', { interrupt: true });
    window.setTimeout(() => setShowDull(false), 9000);
    poke();
  };
  const breath = (down: boolean) => {
    if (ctl.held === down) return;
    ctl.held = down;
    setHeld(down);
    ctl.breathLog.push({ t: nowS(), down });
    if (ctl.breathLog.length > 400) ctl.breathLog.splice(0, 100);
    poke();
  };
  const togglePause = () => {
    if (paused) {
      pausedTotal.current += performance.now() - (pausedAt.current || performance.now());
      pausedAt.current = null;
      setPaused(false);
    } else {
      pausedAt.current = performance.now();
      setPaused(true);
      hush();
    }
    poke();
  };

  // keyboard: space = aha, p = pause, c = count
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); seg.controls.includes('count') ? doCount() : doAha(); }
      if (e.key === 'a') doAha();
      if (e.key === 'p') togglePause();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const phaseSegs = segs.filter((s) => s.phase === seg.phase);
  const phaseIdx = phaseSegs.indexOf(seg);
  const tips = seg.tips || [];
  const tip = tips.length ? tips[Math.floor(segT / 22) % tips.length] : '';
  const hasCount = seg.controls.includes('count');

  return (
    <div className={`runner ${idle ? 'idle' : ''} ${paused ? 'paused' : ''}`} onPointerDown={poke}>
      <div
        className="runner-stage"
        onClick={() => hasCount && !paused && doCount()}
      >
        <SceneCanvas
          className="runner-canvas"
          control={ctl}
          input={{ mode: seg.visual, progress: segP, scanY, metta: seg.metta, walk: seg.walk, paused }}
        />
      </div>

      <header className="runner-top">
        <div className="runner-progress" aria-hidden="true">
          {segs.map((s, i) => (
            <span key={s.id} style={{ flexGrow: s.dur }} className={`p-${s.phase.toLowerCase()}`}>
              <i style={{ width: `${i < segIdx ? 100 : i === segIdx ? segP * 100 : 0}%` }} />
            </span>
          ))}
        </div>
        <div className="runner-head">
          <div>
            <div className="eyebrow">
              {seg.phase}
              {seg.phase === 'Transition' && phaseSegs.length > 1 ? ` · step ${phaseIdx + 1} of ${phaseSegs.length}` : ''}
              {seg.scan && regionIdx >= 0 ? ` · ${SCAN_REGIONS[regionIdx].name}` : ''}
            </div>
            <h1 className="runner-title">{seg.title}</h1>
          </div>
          <div className="runner-time tabnum" aria-live="off">
            {fmt(total - elapsed)}
          </div>
        </div>
      </header>

      <div className="runner-bottom">
        {seg.text && <p className="runner-text">{seg.text}</p>}
        {tip && <p className="runner-tip" key={tip}>{tip}</p>}

        {showDull && (
          <div className="remedy" role="status">
            <strong>Brighten up</strong>
            <ul>{DULL_REMEDIES.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}

        {seg.controls.includes('labels') && (
          <div className="label-chips" role="group" aria-label="Label a distraction">
            {LABELS.map((l) => (
              <button key={l} className="chip" onClick={(e) => { e.stopPropagation(); doLabel(l); }}>
                {l}
                {labels[l] ? <span className="n">{labels[l]}</span> : null}
              </button>
            ))}
          </div>
        )}

        {seg.controls.includes('breath') && (
          <button
            className={`breath-pad ${held ? 'held' : ''}`}
            onPointerDown={(e) => { e.stopPropagation(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); breath(true); }}
            onPointerUp={() => breath(false)}
            onPointerCancel={() => breath(false)}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === 'b') && !e.repeat) breath(true); }}
            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === 'b') breath(false); }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="pad-fill" />
            <span className="pad-text">{held ? 'breathing in…' : 'Hold while breathing in · release to breathe out'}</span>
          </button>
        )}

        <div className="runner-controls">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); togglePause(); }} aria-label={paused ? 'Resume' : 'Pause'}>
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>

          {seg.controls.includes('dull') && (
            <button className="side-btn" onClick={(e) => { e.stopPropagation(); doDull(); }}>
              Dull?
            </button>
          )}

          {hasCount ? (
            <button className="aha-btn small-aha" onClick={(e) => { e.stopPropagation(); lostCount(); }}>
              Lost count
            </button>
          ) : (
            <button className="aha-btn" onClick={(e) => { e.stopPropagation(); doAha(); }} aria-label="Aha: I noticed I wandered">
              <span key={ahaFlash} className={ahaFlash ? 'aha-pop' : ''}>Aha!</span>
              {aha > 0 && <span className="aha-n tabnum">{aha}</span>}
            </button>
          )}

          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              updateSettings({ voice: !settings.voice });
              if (settings.voice) hush();
            }}
            aria-label={settings.voice ? 'Mute voice' : 'Unmute voice'}
          >
            {settings.voice ? <VoiceIcon /> : <MuteIcon />}
          </button>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setConfirmEnd(true); }} aria-label="End session">
            <CloseIcon />
          </button>
        </div>
        {hasCount && <p className="muted small center">Tap anywhere at the end of each out-breath to count</p>}
      </div>

      {paused && !confirmEnd && (
        <div className="overlay" onClick={togglePause}>
          <div className="overlay-card">
            <h2 className="display">Paused</h2>
            <p className="muted">Tap to resume.</p>
          </div>
        </div>
      )}
      {confirmEnd && (
        <div className="overlay">
          <div className="overlay-card">
            <h2 className="display">End the sit now?</h2>
            <p className="muted">You committed to {Math.round(total / 60)} minutes. Staying through restlessness is part of the practice, but sometimes stopping is the right call.</p>
            <div className="row center">
              <button className="btn primary" onClick={() => setConfirmEnd(false)}>Keep sitting</button>
              <button className="btn ghost" onClick={() => (elapsed < 30 ? onAbandon() : finish(false))}>
                {elapsed < 30 ? 'Leave' : 'End & review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const avg = (a: number[]) => Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10;

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="3.5" height="14" rx="1" /><rect x="14" y="5" width="3.5" height="14" rx="1" /></svg>
);
const PlayIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>;
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
);
const VoiceIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
);
const MuteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);
