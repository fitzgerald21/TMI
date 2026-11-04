import { setState } from '../lib/store';
import { SceneCanvas } from '../visual/SceneCanvas';
import { go } from '../lib/router';
import { STAGES } from '../content/stages';

export function Welcome() {
  const begin = (stage: number) => {
    setState({ onboarded: true, stage });
    go('home');
  };
  return (
    <div className="page welcome">
      <section className="welcome-hero">
        <SceneCanvas className="fill" input={{ mode: 'nose', progress: 0.3, preview: true }} />
        <div className="welcome-text">
          <div className="eyebrow">A companion for The Mind Illuminated</div>
          <h1 className="display xxl">Attention is the spotlight. Awareness is the lantern.</h1>
          <p className="lede">
            Ten stages, from your first sit to an effortlessly stable mind. Lantern walks you through each one with guided sits that show you what to do, moment by moment.
          </p>
        </div>
      </section>

      <section className="welcome-how">
        <div className="how">
          <span className="how-k">See it</span>
          <p>Every technique has a live visual: counting beads, a breath trace you draw by holding the screen, pulses that prompt you to check in, a light that scans the body.</p>
        </div>
        <div className="how">
          <span className="how-k">Hear it</span>
          <p>Gentle spoken guidance and singing-bowl bells. Eyes closed works fine, and the screen dims itself.</p>
        </div>
        <div className="how">
          <span className="how-k">Notice it</span>
          <p>Tap "Aha!" when you notice you wandered. Rewarding that moment is the heart of the early stages.</p>
        </div>
      </section>

      <section className="welcome-start">
        <h2 className="display">Where would you like to begin?</h2>
        <div className="start-opts">
          <button className="start-opt" onClick={() => begin(1)}>
            <b>I'm new to meditation</b>
            <span>Start at stage 1: building a daily practice.</span>
          </button>
          <button className="start-opt" onClick={() => { setState({ onboarded: true }); go('finder'); }}>
            <b>I've meditated before</b>
            <span>Answer a few questions to find your stage.</span>
          </button>
        </div>
        <details className="pick">
          <summary>I already know my stage</summary>
          <div className="chips">
            {STAGES.map((s) => (
              <button key={s.n} className="chip" onClick={() => begin(s.n)}>
                {s.n} · {s.short}
              </button>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}
