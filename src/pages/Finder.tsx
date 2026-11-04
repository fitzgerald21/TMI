import { useState } from 'react';
import { STAGES } from '../content/stages';
import { setState } from '../lib/store';
import { go } from '../lib/router';

// Each question is one stage's mastery criterion in plain words.
// Your stage is the first one you haven't mastered yet.
const QS = [
  { stage: 1, q: 'Do you meditate every day, without skipping?', yes: 'Every day', some: 'Most days', no: 'Not yet' },
  { stage: 2, q: 'Can you stay with the breath for minutes at a time, with most bouts of mind-wandering lasting only a few seconds?', yes: 'Yes, usually', some: 'Sometimes', no: 'Rarely' },
  { stage: 3, q: 'Do you almost never completely forget the breath, or nod off, during a sit?', yes: 'Almost never', some: 'It still happens', no: 'Often' },
  { stage: 4, q: 'Does the breath stay in the foreground, even when pain or a strong thought appears, and stay clear without fading or blurring?', yes: 'Reliably', some: 'Sometimes', no: 'Not yet' },
  { stage: 5, q: 'Does the breath stay just as vivid at the end of a sit as at the start, with no pleasant, hazy drift?', yes: 'Reliably', some: 'Sometimes', no: 'Not yet' },
  { stage: 6, q: 'Is attention exclusively on the breath, with faint background thoughts and sensations gone?', yes: 'Reliably', some: 'Sometimes', no: 'Not yet' },
  { stage: 7, q: 'Can you let go of all effort at the start of a sit and remain stable and clear?', yes: 'Reliably', some: 'Sometimes', no: 'Not yet' },
  { stage: 8, q: 'Do the physical senses go quiet, with meditative joy arising?', yes: 'Reliably', some: 'Sometimes', no: 'Not yet' },
  { stage: 9, q: 'Has the intensity of joy calmed into deep tranquility and equanimity?', yes: 'Reliably', some: 'Sometimes', no: 'Not yet' },
];

export function Finder() {
  const [i, setI] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const answer = (mastered: boolean) => {
    if (!mastered) return setResult(QS[i].stage);
    if (i + 1 >= QS.length) return setResult(10);
    setI(i + 1);
  };

  if (result) {
    const s = STAGES[result - 1];
    return (
      <div className="page finder">
        <div className="finder-card">
          <div className="eyebrow">Your working stage</div>
          <h1 className="display xxl"><span className="stage-num">{s.n}</span>{s.short}</h1>
          <p className="lede">{s.essence}</p>
          <p className="muted">
            Stages aren't strict levels. On a good day you may touch the next stage; on a hard day you may slip back a few. Practice at the stage that matches most of your sits, and review earlier skills whenever you need to.
          </p>
          <div className="row">
            <button className="btn primary big" onClick={() => { setState({ stage: s.n, onboarded: true }); go(`stage-${s.n}`); }}>
              Make stage {s.n} my stage
            </button>
            <button className="btn ghost" onClick={() => { setResult(null); setI(0); }}>Start over</button>
          </div>
        </div>
      </div>
    );
  }

  const q = QS[i];
  return (
    <div className="page finder">
      <div className="finder-card">
        <div className="finder-progress" aria-hidden="true">
          {QS.map((_, k) => <span key={k} className={k < i ? 'done' : k === i ? 'on' : ''} />)}
        </div>
        <div className="eyebrow">Find your stage · question {i + 1}</div>
        <h1 className="display xl">{q.q}</h1>
        <p className="muted">Think about your typical sit over the past couple of weeks, not your best one.</p>
        <div className="answers">
          <button className="answer" onClick={() => answer(true)}>{q.yes}</button>
          <button className="answer" onClick={() => answer(false)}>{q.some}</button>
          <button className="answer" onClick={() => answer(false)}>{q.no}</button>
        </div>
        {i > 0 && <button className="btn ghost small" onClick={() => setI(i - 1)}>← Back</button>}
      </div>
    </div>
  );
}
