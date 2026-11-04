import { MILESTONES, STAGES, stageByN } from '../content/stages';
import { setState, useStore } from '../lib/store';
import { SceneCanvas } from '../visual/SceneCanvas';
import { stillFrame } from '../visual/scene';
import { useStart } from '../App';
import { buildDrill, buildGuided, DRILLS } from '../session/script';

export function StagePage({ n }: { n: number }) {
  const s = stageByN(n);
  const current = useStore((st) => st.stage);
  const minutes = useStore((st) => st.settings.defaultMinutes);
  const start = useStart();
  const milestone = MILESTONES.find((m) => m.after === s.n);
  const prev = s.n > 1 ? STAGES[s.n - 2] : null;
  const next = s.n < 10 ? STAGES[s.n] : null;

  return (
    <div className="page stage">
      <section className="stage-hero">
        <div className="stage-hero-text">
          <div className="eyebrow">
            Stage {s.n} of 10 · {s.phase === 'Transition' ? 'Transition' : `${s.phase} meditator`}
          </div>
          <h1 className="display xl">{s.title}</h1>
          <p className="lede">{s.essence}</p>
          <div className="row">
            <button className="btn primary" onClick={() => start(buildGuided(s.n, minutes))}>
              Begin a stage {s.n} sit
            </button>
            {current !== s.n ? (
              <button className="btn ghost" onClick={() => setState({ stage: s.n })}>Make this my stage</button>
            ) : (
              <span className="pill">Your current stage</span>
            )}
          </div>
        </div>
        <div className="stage-hero-vis">
          <SceneCanvas className="fill" input={{ mode: s.heroVisual, progress: 0.35, preview: true }} />
        </div>
      </section>

      <section className="gosm">
        <div className="gosm-item goal">
          <span className="k">Goal</span>
          <p>{s.goal}</p>
        </div>
        <div className="gosm-item">
          <span className="k">Obstacles</span>
          <ul className="tags">{s.obstacles.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
        <div className="gosm-item">
          <span className="k">Skills</span>
          <ul className="plain">{s.skills.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
        <div className="gosm-item mastery">
          <span className="k">Mastery</span>
          <p>{s.mastery}</p>
        </div>
      </section>

      <section className="prose">
        <h2 className="display">What's happening</h2>
        {s.overview.map((p, i) => <p key={i}>{p}</p>)}
      </section>

      <section>
        <h2 className="display">Techniques</h2>
        <div className="techs">
          {s.techniques.map((t) => {
            const drill = t.drill ? DRILLS.find((d) => d.id === t.drill) : null;
            return (
              <article className="tech" key={t.id}>
                <img className="tech-img" src={stillFrame(t.visual, 480, 260)} alt="" />
                <div className="tech-body">
                  <h3>{t.name}</h3>
                  <p className="tech-one">{t.oneLine}</p>
                  <ol className="steps">{t.steps.map((x) => <li key={x}>{x}</li>)}</ol>
                  <p className="why"><span className="k">Why it works</span>{t.why}</p>
                  {drill && (
                    <button className="btn small" onClick={() => start(buildDrill(drill.id))}>
                      Try it · {drill.minutes}-minute drill
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="two-col">
        <div>
          <h2 className="display">Tips</h2>
          <ul className="bullets good">{s.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div>
          <h2 className="display">Watch out for</h2>
          <ul className="bullets warn">{s.pitfalls.map((t) => <li key={t}>{t}</li>)}</ul>
          <h3 className="mt">You're likely here if…</h3>
          <ul className="bullets">{s.signs.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </section>

      {milestone && (
        <section className="milestone-banner">
          <div className="diamond" aria-hidden="true" />
          <div>
            <div className="eyebrow">Mastering stage {s.n} reaches milestone {milestone.n}</div>
            <h3 className="display">{milestone.title}</h3>
            <p>{milestone.text}</p>
          </div>
        </section>
      )}

      <nav className="pager" aria-label="Stages">
        {prev ? (
          <a href={`#stage-${prev.n}`}>
            <span className="eyebrow">← Stage {prev.n}</span>
            {prev.short}
          </a>
        ) : <span />}
        {next ? (
          <a href={`#stage-${next.n}`} className="right">
            <span className="eyebrow">Stage {next.n} →</span>
            {next.short}
          </a>
        ) : <span />}
      </nav>
    </div>
  );
}
