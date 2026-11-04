import { AttentionAwareness } from '../learn/AttentionAwareness';
import { Moments } from '../learn/Moments';
import { ObstacleMap } from '../learn/ObstacleMap';
import { MindSystem } from '../learn/MindSystem';
import { FACTORS, GLOSSARY, HINDRANCES, PREP_STEPS } from '../content/concepts';
import { STAGES } from '../content/stages';
import { useStart } from '../App';
import { buildDrill } from '../session/script';

const TOPICS = [
  { id: 'attention', name: 'Attention & awareness', blurb: 'The spotlight and the lantern. A live simulation of how distractions get in.', live: true },
  { id: 'obstacles', name: 'Distraction & dullness', blurb: 'Every early obstacle on one map, with the path through it.', live: true },
  { id: 'moments', name: 'Moments of consciousness', blurb: 'Experience as a stream of mind-moments. See what dullness really is.', live: true },
  { id: 'mind', name: 'The mind system', blurb: 'Many sub-minds, one stage. Why intention beats effort.', live: true },
  { id: 'aha', name: 'The "aha!" moment', blurb: 'The most important habit of the early stages.' },
  { id: 'prepare', name: 'Preparing & transitioning', blurb: 'The six preparation steps and the four-step transition.' },
  { id: 'hindrances', name: 'The five hindrances', blurb: 'The usual saboteurs, and their antidotes.' },
  { id: 'factors', name: 'Seven factors of awakening', blurb: 'The qualities the practice cultivates.' },
  { id: 'glossary', name: 'Glossary', blurb: 'The key terms, in plain language.' },
];

export function Learn({ topic }: { topic: string }) {
  const t = TOPICS.find((x) => x.id === topic);
  if (!t) return <LearnIndex />;
  return (
    <div className="page learn-topic">
      <a className="back" href="#learn">← Learn</a>
      <h1 className="display xl">{t.name}</h1>
      <p className="lede">{t.blurb}</p>
      {topic === 'attention' && <AttentionAwareness />}
      {topic === 'moments' && <Moments />}
      {topic === 'obstacles' && <ObstacleMap />}
      {topic === 'mind' && <MindSystem />}
      {topic === 'aha' && <Aha />}
      {topic === 'prepare' && <Prepare />}
      {topic === 'hindrances' && <Hindrances />}
      {topic === 'factors' && <Factors />}
      {topic === 'glossary' && <Glossary />}
      <nav className="topic-next">
        {TOPICS.filter((x) => x.id !== topic).slice(0, 3).map((x) => (
          <a key={x.id} href={`#learn-${x.id}`}>
            <span className="eyebrow">{x.live ? 'Interactive' : 'Read'}</span>
            {x.name}
          </a>
        ))}
      </nav>
    </div>
  );
}

function LearnIndex() {
  return (
    <div className="page learn">
      <h1 className="display xl">Learn</h1>
      <p className="lede">The ideas behind the method. The first four are interactive: drag the sliders and watch the mind change.</p>
      <div className="topics">
        {TOPICS.map((t, i) => (
          <a key={t.id} href={`#learn-${t.id}`} className={`topic ${t.live ? 'live' : ''}`}>
            <span className="topic-n tabnum">{String(i + 1).padStart(2, '0')}</span>
            <span className="topic-body">
              <b>{t.name}</b>
              <span className="muted small">{t.blurb}</span>
            </span>
            {t.live && <span className="pill">Interactive</span>}
          </a>
        ))}
      </div>
      <h2 className="display">The ten stages</h2>
      <div className="stage-index">
        {STAGES.map((s) => (
          <a key={s.n} href={`#stage-${s.n}`}>
            <span className="si-n">{s.n}</span>
            <span>
              <b>{s.short}</b>
              <span className="muted small">{s.essence}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Aha() {
  const start = useStart();
  return (
    <div className="prose">
      <div className="compare">
        <div className="cmp bad">
          <span className="k">Scolding</span>
          <ol>
            <li>Mind wanders off</li>
            <li>You notice</li>
            <li>"Ugh, again. I'm bad at this."</li>
            <li>The mind learns: <em>noticing feels bad</em></li>
          </ol>
          <p className="small muted">Result: you notice later and less often.</p>
        </div>
        <div className="cmp good">
          <span className="k">Appreciating</span>
          <ol>
            <li>Mind wanders off</li>
            <li>You notice</li>
            <li>"Aha! Good, I'm back."</li>
            <li>The mind learns: <em>noticing feels good</em></li>
          </ol>
          <p className="small muted">Result: you notice sooner and more often.</p>
        </div>
      </div>
      <p>
        Waking up from mind-wandering isn't something you do on purpose. It happens on its own: a part of the mind notices that you're off-track. That spontaneous noticing is introspective awareness, the very skill you want to grow.
      </p>
      <p>
        The unconscious mind learns from what feels good and bad. If every moment of noticing is followed by self-criticism, you are training the mind to avoid noticing. If every moment of noticing is met with a warm "aha!", you are training it to notice more. So enjoy it for a moment, then gently return to the breath.
      </p>
      <p>
        In every sit in Lantern, tap <b className="gold">Aha!</b> when you notice you've wandered. The light blooms, the count goes up, and the mind gets its reward.
      </p>
      <button className="btn primary" onClick={() => start(buildDrill('drill-aha'))}>Practice the "aha!" (5 min)</button>
    </div>
  );
}

function Prepare() {
  const start = useStart();
  return (
    <div className="prose">
      <h2 className="display">Six preparation steps</h2>
      <p>A minute or two before each sit. Lantern walks you through these at the start of every guided sit (you can switch it off in Practice).</p>
      <ol className="big-steps">
        {PREP_STEPS.map((s) => (
          <li key={s.key}><b>{s.title}.</b> {s.prompt} <span className="muted">{s.hint}</span></li>
        ))}
      </ol>
      <h2 className="display">The four-step transition</h2>
      <p>Rather than diving straight to the nose, narrow the scope of attention in stages while keeping peripheral awareness open.</p>
      <ol className="big-steps">
        <li><b>The present.</b> Everything in experience, with no favorites. Nothing is a distraction yet.</li>
        <li><b>The body.</b> Narrow to bodily sensations: weight, contact, temperature.</li>
        <li><b>The breath in the body.</b> Belly, chest and shoulders moving with the breath.</li>
        <li><b>The breath at the nose.</b> The sensations of air at the nostrils and upper lip.</li>
      </ol>
      <button className="btn primary" onClick={() => start(buildDrill('drill-transition'))}>Practice the transition (5 min)</button>
    </div>
  );
}

function Hindrances() {
  return (
    <div className="cards-list">
      {HINDRANCES.map((h, i) => (
        <article key={h.name} className="hcard">
          <span className="hcard-n">{i + 1}</span>
          <div>
            <h3>{h.name}</h3>
            <p className="muted">{h.feels}</p>
            <p><span className="k">Antidote</span>{h.antidote}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function Factors() {
  return (
    <div className="factors">
      {FACTORS.map((f, i) => (
        <div key={f.name} className="factor" style={{ ['--i' as string]: i }}>
          <b>{f.name}</b>
          <span className="muted">{f.text}</span>
        </div>
      ))}
      <p className="prose muted">These seven qualities strengthen naturally as you move through the stages. By the adept stages, all of them are present together in every sit.</p>
    </div>
  );
}

function Glossary() {
  return (
    <dl className="glossary">
      {GLOSSARY.map((g) => (
        <div key={g.term}>
          <dt>{g.term}</dt>
          <dd>{g.def}</dd>
        </div>
      ))}
    </dl>
  );
}
