import { useEffect, useRef, useState } from 'react';
import { PREP_STEPS } from '../content/concepts';
import { SceneCanvas } from '../visual/SceneCanvas';

const GOALS: Record<number, string[]> = {
  0: ['Sit for the full time', 'Return gently every time'],
  1: ['Sit for the full time, whatever happens', 'Come back every time I notice I\'ve drifted'],
  2: ['Enjoy every "aha!" moment', 'Get to ten without losing count', 'Return gently, without scolding'],
  3: ['Check in before forgetting happens', 'Notice the pauses between breaths', 'Catch sleepiness early'],
  4: ['Keep the breath in the foreground', 'Correct dullness the moment I notice it', 'Let memories pass without following them'],
  5: ['Keep the breath as vivid at the end as at the start', 'Scan slowly and thoroughly'],
  6: ['Give subtle distractions no attention', 'Stay with whole-body breathing'],
  7: ['Experiment with letting go of effort', 'Investigate the finest details'],
  8: ['Sit without effort', 'Let everything come and go'],
  9: ['Let joy settle by itself', 'Sit without effort'],
  10: ['Simply rest'],
};

export interface PrepResult {
  motivation: string;
  goal: string;
}

export function Prep({ stage, onDone, onCancel }: { stage: number; onDone: (r: PrepResult) => void; onCancel: () => void }) {
  const [i, setI] = useState(0);
  const [motivation, setMotivation] = useState('');
  const [goal, setGoal] = useState('');
  const [released, setReleased] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [distractions, setDistractions] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [posture, setPosture] = useState<Set<number>>(new Set());
  const step = PREP_STEPS[i];
  const last = i === PREP_STEPS.length - 1;

  const ready = [!!motivation, !!goal, released, committed, true, true][i];
  const next = () => (last ? onDone({ motivation, goal }) : setI(i + 1));

  return (
    <div className="prep">
      <SceneCanvas className="prep-bg" input={{ mode: 'arrive', progress: 0, preview: true }} />
      <div className="prep-inner">
        <div className="prep-top">
          <button className="ghost small" onClick={onCancel}>Cancel</button>
          <div className="prep-dots" aria-label={`Step ${i + 1} of 6`}>
            {PREP_STEPS.map((s, k) => (
              <button key={s.key} className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => k <= i && setI(k)} aria-label={s.title} />
            ))}
          </div>
          <button className="ghost small" onClick={() => onDone({ motivation, goal })}>Skip</button>
        </div>

        <div className="prep-card" key={step.key}>
          <div className="eyebrow">Preparation · {i + 1} of 6 · {step.title}</div>
          <h2 className="display">{step.prompt}</h2>
          <p className="muted">{step.hint}</p>

          {step.key === 'motivation' && (
            <ChoiceInput id="prep-motivation" options={step.options} value={motivation} onChange={setMotivation} placeholder="In my own words…" />
          )}
          {step.key === 'goal' && (
            <ChoiceInput id="prep-goal" options={GOALS[stage] || GOALS[0]} value={goal} onChange={setGoal} placeholder="My goal for this sit…" />
          )}
          {step.key === 'expectations' && <ReleaseButton released={released} onRelease={() => setReleased(true)} />}
          {step.key === 'diligence' && (
            <button className={`commit ${committed ? 'on' : ''}`} onClick={() => setCommitted(!committed)} aria-pressed={committed}>
              <span className="commit-mark">{committed ? '✓' : ''}</span>
              I'll sit until the closing bell, however it goes.
            </button>
          )}
          {step.key === 'distractions' && (
            <div className="setaside">
              <form
                className="row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) setDistractions([...distractions, draft.trim()]);
                  setDraft('');
                }}
              >
                <input id="prep-distraction" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. tomorrow's meeting" />
                <button className="btn" type="submit">Set aside</button>
              </form>
              <div className="aside-box">
                {distractions.length === 0 ? (
                  <span className="muted small">Nothing set aside yet. That's fine too.</span>
                ) : (
                  distractions.map((d, k) => (
                    <span key={k} className="aside-item">{d}</span>
                  ))
                )}
              </div>
              {distractions.length > 0 && <p className="muted small">These will wait for you. You can pick them up after the bell.</p>}
            </div>
          )}
          {step.key === 'posture' && (
            <div className="checklist">
              {step.options.map((o, k) => (
                <button
                  key={o}
                  className={posture.has(k) ? 'on' : ''}
                  aria-pressed={posture.has(k)}
                  onClick={() => {
                    const n = new Set(posture);
                    n.has(k) ? n.delete(k) : n.add(k);
                    setPosture(n);
                  }}
                >
                  <span className="tick">{posture.has(k) ? '✓' : ''}</span>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="prep-actions">
          {i > 0 && <button className="btn ghost" onClick={() => setI(i - 1)}>Back</button>}
          <button className={`btn primary ${last ? 'big' : ''}`} onClick={next} disabled={!ready && i < 4}>
            {last ? 'Begin the sit' : ready || i >= 4 ? 'Continue' : ['Choose one to continue', 'Choose a goal to continue', 'Hold the circle to continue', 'Commit to continue'][i]}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChoiceInput({ id, options, value, onChange, placeholder }: { id: string; options: string[]; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="choices">
      <div className="chips">
        {options.map((o) => (
          <button key={o} className={`chip ${value === o ? 'on' : ''}`} onClick={() => onChange(o)} aria-pressed={value === o}>
            {o}
          </button>
        ))}
      </div>
      <input id={id} value={options.includes(value) ? '' : value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ReleaseButton({ released, onRelease }: { released: boolean; onRelease: () => void }) {
  const [p, setP] = useState(0);
  const holding = useRef(false);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const start = () => {
    if (released) return;
    holding.current = true;
    const t0 = performance.now() - p * 2400;
    const loop = () => {
      if (!holding.current) return;
      const v = Math.min(1, (performance.now() - t0) / 2400);
      setP(v);
      if (v < 1) raf.current = requestAnimationFrame(loop);
      else {
        holding.current = false;
        onRelease();
      }
    };
    raf.current = requestAnimationFrame(loop);
  };
  const stop = () => {
    holding.current = false;
    if (!released) setP(0);
  };
  const C = 2 * Math.PI * 52;
  return (
    <div className="release">
      <button
        className={`release-btn ${released ? 'done' : ''}`}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !e.repeat && start()}
        onKeyUp={stop}
        aria-label="Hold to let go of expectations"
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" className="track" />
          <circle cx="60" cy="60" r="52" className="ring-fill" strokeDasharray={C} strokeDashoffset={C * (1 - (released ? 1 : p))} />
        </svg>
        <span>{released ? 'Let go' : p > 0 ? 'Keep holding…' : 'Hold'}</span>
      </button>
      <p className="muted small">{released ? 'Whatever happens in this sit is fine.' : '"It should be calm." "I should be better at this by now." Hold, then let them go.'}</p>
    </div>
  );
}
