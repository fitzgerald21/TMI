import { useState } from 'react';
import { updateSession, type SessionRecord } from '../lib/store';
import { SCMap } from '../components/SCMap';

const STAB = ['Mostly lost in thought', 'Wandered often', 'Some wandering', 'Mostly on the breath', 'Unbroken'];
const CLAR = ['Sleepy, foggy', 'Dim', 'Okay', 'Clear', 'Vivid, bright'];

const PROMPTS = [
  'How was the mind at the start compared with the end?',
  'What pulled attention away most often?',
  'When did you notice dullness or distraction, and what did you do?',
  'What will you try next time?',
];

export function Review({ record, onDone }: { record: SessionRecord; onDone: () => void }) {
  const [stability, setStability] = useState<number | undefined>(record.stability);
  const [clarity, setClarity] = useState<number | undefined>(record.clarity);
  const [notes, setNotes] = useState(record.notes || '');
  const labelEntries = Object.entries(record.labels).sort((a, b) => b[1] - a[1]);
  const maxLabel = Math.max(1, ...labelEntries.map((e) => e[1]));

  const save = () => {
    updateSession(record.id, { stability, clarity, notes: notes.trim() || undefined });
    onDone();
  };

  return (
    <div className="review">
      <div className="review-inner">
        <div className="eyebrow">{record.completed ? 'Sit complete' : 'Sit ended early'} · mindful review</div>
        <h1 className="display xl">{record.completed ? 'Well sat.' : 'You showed up.'}</h1>
        <p className="muted">
          {record.minutes} minutes · {record.title}
          {record.goal ? <> · goal: <em>{record.goal}</em></> : null}
        </p>

        <div className="review-stats">
          <div className="stat">
            <span className="stat-n tabnum">{record.aha}</span>
            <span className="stat-l">"aha!" moments</span>
          </div>
          {record.breath && (
            <div className="stat">
              <span className="stat-n tabnum">
                {record.breath.inAvg}
                <small>s</small> / {record.breath.outAvg || '–'}
                <small>s</small>
              </span>
              <span className="stat-l">average in / out over {record.breath.count} breaths</span>
            </div>
          )}
          {record.dullness > 0 && (
            <div className="stat">
              <span className="stat-n tabnum">{record.dullness}</span>
              <span className="stat-l">times you caught dullness</span>
            </div>
          )}
        </div>
        {record.aha > 0 && (
          <p className="review-note">
            Each "aha!" was a moment of introspective awareness waking up on its own. Those moments are how the mind learns to notice sooner.
          </p>
        )}

        {labelEntries.length > 0 && (
          <section className="review-sec">
            <h3>What pulled at attention</h3>
            <div className="bars">
              {labelEntries.map(([k, v]) => (
                <div className="bar-row" key={k}>
                  <span>{k}</span>
                  <span className="bar"><i style={{ width: `${(v / maxLabel) * 100}%` }} /></span>
                  <span className="tabnum muted">{v}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="review-sec">
          <h3>How stable was attention?</h3>
          <Scale id="rv-stab" value={stability} onChange={setStability} labels={STAB} />
          <h3>How clear and vivid?</h3>
          <Scale id="rv-clar" value={clarity} onChange={setClarity} labels={CLAR} />
          {stability && clarity && (
            <div className="review-map">
              <SCMap points={[{ s: stability, c: clarity, hi: true }]} />
              <p className="muted small">
                {stability >= 4 && clarity >= 4
                  ? 'Stable and vivid: the direction the whole path heads.'
                  : stability >= 4
                    ? 'Stable but dim. Watch for dullness creeping in, and brighten your interest.'
                    : clarity >= 4
                      ? 'Bright but scattered. Check in more often to catch distractions early.'
                      : 'A hard sit. Every one of these still builds the habit. Appreciate that you sat.'}
              </p>
            </div>
          )}
        </section>

        <section className="review-sec">
          <h3>Reflect</h3>
          <ul className="prompts">{PROMPTS.map((p) => <li key={p}>{p}</li>)}</ul>
          <label className="sr" htmlFor="rv-notes">Notes</label>
          <textarea id="rv-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="A few words for your journal…" />
        </section>

        <div className="row">
          <button className="btn primary big" onClick={save}>Save to journal</button>
          <button className="btn ghost" onClick={onDone}>Skip</button>
        </div>
      </div>
    </div>
  );
}

function Scale({ id, value, onChange, labels }: { id: string; value?: number; onChange: (n: number) => void; labels: string[] }) {
  return (
    <div className="scale" role="radiogroup" id={id}>
      {labels.map((l, i) => (
        <button key={l} role="radio" aria-checked={value === i + 1} className={value === i + 1 ? 'on' : ''} onClick={() => onChange(i + 1)}>
          <b>{i + 1}</b>
          <span>{l}</span>
        </button>
      ))}
    </div>
  );
}
