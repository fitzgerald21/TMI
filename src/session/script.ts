import type { VisualMode } from '../content/stages';

export type Control = 'aha' | 'count' | 'breath' | 'labels' | 'dull';

export interface Cue {
  first: number; // seconds into segment
  every: number; // seconds between cues
  texts: string[]; // spoken (full guidance) / shown
  pulse?: boolean; // draw a check-in pulse
  chime?: boolean; // play a soft chime
  untilFrac?: number; // stop cueing after this fraction of the segment
}

export interface Segment {
  id: string;
  phase: 'Opening' | 'Transition' | 'Practice' | 'Closing';
  title: string;
  text: string; // on-screen instruction
  say: string; // spoken at segment start (full guidance)
  short?: string; // spoken at segment start (light guidance)
  tips?: string[]; // rotate quietly on screen
  visual: VisualMode;
  controls: Control[];
  dur: number; // seconds
  cues?: Cue[];
  scan?: boolean;
  metta?: number; // which circle of beings (0 = self)
  walk?: 3 | 6;
}

export interface Script {
  title: string;
  stage: number;
  kind: 'guided' | 'drill' | 'timer' | 'walking' | 'metta';
  segments: Segment[];
}

// ------------------------------------------------------------------
// Segment templates
// ------------------------------------------------------------------

type T = Omit<Segment, 'dur' | 'id'>;

const opening = (): T => ({
  phase: 'Opening',
  title: 'Arriving',
  text: 'Close your eyes, or let your gaze rest softly downward. Let the body settle.',
  say: 'Welcome. Let the body settle into a posture that is relaxed, upright and stable. Close your eyes, or let your gaze rest softly downward.',
  short: 'Settle in.',
  visual: 'arrive',
  controls: [],
});

const T_PRESENT: T = {
  phase: 'Transition',
  title: 'The present moment',
  text: 'Let in everything: sounds, sensations, smells, light. Nothing is a distraction. No favorites.',
  say: 'Begin by simply being present. Let in everything. Sounds near and far. Sensations in the body. Smells. The light behind your eyes. Nothing is a distraction right now. There are no favorites. Just be here.',
  short: 'Step one. The present moment.',
  tips: ['Let awareness be wide and open.', 'Sounds come and go on their own.'],
  visual: 'present',
  controls: [],
};
const T_BODY: T = {
  phase: 'Transition',
  title: 'The body',
  text: 'Narrow to bodily sensations. Weight, contact, warmth, tingling, tension, ease.',
  say: 'Now narrow your focus to the body. Let sounds and the other senses fade into the background. Feel the body as a whole. Its weight. Where it touches the seat. Warmth or coolness. Tension and ease.',
  short: 'Step two. The body.',
  tips: ['Sounds can stay in the background.', 'Notice where the body touches the ground.'],
  visual: 'body',
  controls: [],
};
const T_BREATH_BODY: T = {
  phase: 'Transition',
  title: 'The breath in the body',
  text: 'Feel how the breath moves the belly, the chest, the shoulders. Don\'t control it.',
  say: 'Now notice the breath within the body. The belly rising and falling. The chest expanding and releasing. Perhaps a gentle movement in the shoulders. There is no need to control the breath. Let it be natural.',
  short: 'Step three. The breath in the body.',
  tips: ['The light doesn\'t set your pace. Breathe naturally.', 'Let the breath breathe itself.'],
  visual: 'breathBody',
  controls: [],
};
const T_NOSE: T = {
  phase: 'Transition',
  title: 'The breath at the nose',
  text: 'Gather attention where the air touches: inside the nostrils, the rims, or the upper lip.',
  say: 'Now let attention gather at the nose. Find the place where you feel the air most clearly. Inside the nostrils, at their rims, or on the upper lip. Rest attention here, while everything else stays in the background.',
  short: 'Step four. The breath at the nose.',
  visual: 'nose',
  controls: ['aha'],
};

const closing = (): T => ({
  phase: 'Closing',
  title: 'Closing',
  text: 'Let go of the breath. Open awareness to the body, sounds, the space around you.',
  say: 'Now let go of the breath. Let awareness open again to the whole body, to sounds, to the space around you. Take a moment to appreciate the time you have given to your practice. When the bells sound, gently open your eyes.',
  short: 'Let go of the breath, and open awareness.',
  visual: 'close',
  controls: [],
});

const ahaCue: Cue = {
  first: 70,
  every: 95,
  texts: [
    'If you notice you\'ve wandered, enjoy that moment of waking up. Then gently return.',
    'Let the breath breathe itself.',
    'Sounds and sensations can stay in the background.',
    'Every return is a success.',
  ],
  untilFrac: 0.9,
};

const P: Record<string, T> = {
  nose: {
    phase: 'Practice',
    title: 'Breath at the nose',
    text: 'Attention on the sensations at the nose. When you notice you\'ve wandered, enjoy the "aha!" and gently come back.',
    say: 'Let attention rest on the sensations of the breath at the nose. Feel the air passing in, and passing out. You don\'t need to change anything. When you notice the mind has wandered, enjoy noticing, and gently return.',
    short: 'Breath at the nose.',
    tips: ['Tap "Aha" each time you notice you wandered.', 'Every return counts.', 'Sounds can stay in the background.'],
    visual: 'nose',
    controls: ['aha'],
    cues: [ahaCue],
  },
  count: {
    phase: 'Practice',
    title: 'Counting the breath',
    text: 'At the end of each out-breath, silently count. One to ten, then start again. Lost count? Smile, and start at one.',
    say: 'At the end of each out-breath, silently count. One. Then two. Up to ten, then begin again at one. If you lose count, or find yourself at eleven, that\'s fine. Simply start again at one.',
    short: 'Counting the breath.',
    tips: ['Tap anywhere at the end of each out-breath to count (optional).', 'Lost count? That\'s a moment of noticing. Start at one.'],
    visual: 'count',
    controls: ['count', 'aha'],
    cues: [{ first: 80, every: 100, texts: ['Count at the end of each out-breath.', 'Lost count? Smile, and start again at one.', 'Keep the counting light, in the background of the breath.'], untilFrac: 0.9 }],
  },
  connect: {
    phase: 'Practice',
    title: 'Connecting',
    text: 'Compare each breath with the one before. Was this in-breath longer or shorter? The out-breath longer or shorter than the in-breath?',
    say: 'Now, instead of counting, connect each breath to the one before it. Was this in-breath longer or shorter than the last one? Was the out-breath longer, or shorter, than the in-breath? Keep it light: a quick noticing, not a measurement.',
    short: 'Connecting.',
    tips: ['Optional: hold the pad while breathing in, release while breathing out.', 'Just a light noticing: longer, shorter, the same.'],
    visual: 'connect',
    controls: ['breath', 'aha'],
    cues: [{ first: 75, every: 90, texts: ['Longer, or shorter?', 'Compare the out-breath with the in-breath.', 'If you\'ve wandered, appreciate noticing, and return.'], untilFrac: 0.9 }],
  },
  follow: {
    phase: 'Practice',
    title: 'Following the breath',
    text: 'Notice where the in-breath begins and ends, the pause, where the out-breath begins and ends, and the pause after.',
    say: 'Follow the breath closely. Notice the exact moment the in-breath begins. Where it ends. The pause. Where the out-breath begins. Where it ends. And the pause after.',
    short: 'Following the breath.',
    tips: ['Optional: hold the pad while breathing in, release while breathing out.', 'Notice the pauses: they\'re often longer than you think.'],
    visual: 'follow',
    controls: ['breath', 'aha'],
    cues: [{ first: 70, every: 85, texts: ['Beginning. And end.', 'Notice the pauses between breaths.', 'Look for the finer sensations in the middle of each breath.'], untilFrac: 0.9 }],
  },
  checkin: {
    phase: 'Practice',
    title: 'Checking in',
    text: 'With each soft pulse, glance inward. What is the mind doing? Is the breath still in the foreground?',
    say: 'Now begin checking in. Every so often, without letting go of the breath, glance inward. What is the mind doing right now? Is the breath still in the foreground? A soft chime will remind you at first. Over time, check in on your own, before you need the chime.',
    short: 'Checking in.',
    tips: ['Each pulse: a light glance inward, then back to the breath.', 'Try to check in before the chime.'],
    visual: 'checkin',
    controls: ['labels', 'aha'],
    cues: [
      { first: 30, every: 40, texts: [], pulse: true, chime: true },
      { first: 70, every: 120, texts: ['Check in. What\'s happening in the mind?', 'Is the breath still center stage?', 'Is anything starting to compete for attention?'], untilFrac: 0.85 },
    ],
  },
  label: {
    phase: 'Practice',
    title: 'Labeling',
    text: 'When something tugs at attention, give it a quick, soft label. Then come back fully to the breath.',
    say: 'When you notice a distraction in the background, give it a quick, soft label. Hearing. Planning. Remembering. Feeling. Then return fully to the breath. The label is just a word, not a conversation.',
    short: 'Labeling.',
    tips: ['Tap a label. It drifts to the edge and stays in the background.', 'Name it, and come back.'],
    visual: 'label',
    controls: ['labels', 'aha'],
    cues: [{ first: 60, every: 100, texts: ['Name it, and return.', 'Let distractions stay in the background.'], untilFrac: 0.9 }],
  },
  continuous: {
    phase: 'Practice',
    title: 'Continuous awareness',
    text: 'Check in so often it becomes continuous. Catch anything starting to take center stage, and re-emphasize the breath.',
    say: 'Keep checking in so often that it becomes continuous: a light awareness always running in the background. Notice when anything begins to take center stage, and gently re-emphasize the breath. If the breath starts to fade or blur, that is dullness. Brighten up.',
    short: 'Continuous awareness.',
    tips: ['Tap "Dull" if the breath fades or blurs. You\'ll get a remedy.', 'The pulse is the lookout, always watching.'],
    visual: 'checkin',
    controls: ['labels', 'dull', 'aha'],
    cues: [
      { first: 45, every: 65, texts: [], pulse: true, chime: false },
      { first: 90, every: 130, texts: ['Is the breath fully in the foreground?', 'Is the breath as clear as it was?', 'Strengthen peripheral awareness. Let it keep watch.'], untilFrac: 0.85 },
    ],
  },
  explore: {
    phase: 'Practice',
    title: 'Exploring the breath',
    text: 'Look into the breath in more detail: temperature, pressure, movement. A rich object holds attention.',
    say: 'Explore the sensations of the breath in more detail. Temperature: cool on the way in, warm on the way out. Pressure. Movement. Tingling. The more interesting the breath becomes, the less pull distractions have.',
    short: 'Exploring the breath.',
    tips: ['Cool in, warm out?', 'If the mind feels heavy: a few deeper breaths, then let it be natural.'],
    visual: 'fine',
    controls: ['dull', 'aha'],
    cues: [{ first: 80, every: 110, texts: ['Is the breath as vivid as it was?', 'Find a new detail.'], untilFrac: 0.9 }],
  },
  scan: {
    phase: 'Practice',
    title: 'Body scanning',
    text: 'Move attention slowly through each region of the body, investigating what\'s there, while staying aware of the breath.',
    say: 'Now we\'ll scan the body. Move attention slowly through each region, investigating whatever sensations are there, while staying aware of the breath. If a region feels blank, stay with it, and look for anything at all.',
    short: 'Body scanning.',
    tips: ['Blank areas are fine. Keep looking gently.', 'Notice how the breath affects each region.'],
    visual: 'scan',
    controls: ['dull', 'aha'],
    scan: true,
  },
  vivid: {
    phase: 'Practice',
    title: 'Raising vividness',
    text: 'Back at the nose. Keep asking: is the breath as vivid now as a minute ago? Brighten your interest.',
    say: 'Return now to the breath at the nose, with the clarity you brought to the body. Keep checking: is the breath as vivid now as it was a minute ago? If things feel soft or hazy, that\'s subtle dullness. Brighten your interest. Find a new detail.',
    short: 'Raising vividness.',
    tips: ['Comfortable but hazy? That\'s subtle dullness.', 'Keep peripheral awareness wide.'],
    visual: 'fine',
    controls: ['dull', 'aha'],
    cues: [{ first: 60, every: 80, texts: ['Is the breath as vivid as a minute ago?', 'Brighten your interest.', 'Keep awareness wide.'], untilFrac: 0.9, pulse: true }],
  },
  whole: {
    phase: 'Practice',
    title: 'Whole-body breathing',
    text: 'Include the whole body at once. Feel the entire body taking part in each breath, like a wave moving through you.',
    say: 'Expand attention to include the whole body at once. Feel how every part of the body takes part in each breath. Like a wave moving through you. In, and out. Let the whole body breathe.',
    short: 'Whole-body breathing.',
    tips: ['Hands, feet, face: everything subtly changes with the breath.', 'Let the field of attention be the whole body.'],
    visual: 'whole',
    controls: ['aha'],
    cues: [{ first: 90, every: 130, texts: ['The whole body breathing.', 'Let attention fill the entire body.'], untilFrac: 0.85 }],
  },
  ignore: {
    phase: 'Practice',
    title: 'Exclusive attention',
    text: 'Attention includes only the breath at the nose. Give everything else no attention at all. Let it fade on its own.',
    say: 'Bring attention back to the nose, keeping the same clarity. Define exactly what attention includes: only the breath at the nose. Whatever else appears, give it no attention at all. Don\'t label it. Don\'t push it away. Just let it stay in the background, until it fades.',
    short: 'Exclusive attention.',
    tips: ['Subtle distractions starve without attention.', 'Complete indifference to anything else.'],
    visual: 'fine',
    controls: ['aha'],
    cues: [{ first: 120, every: 150, texts: ['Only the breath.', 'Let everything else fade.'], untilFrac: 0.8 }],
  },
  meta: {
    phase: 'Practice',
    title: 'Knowing the mind',
    text: 'Let awareness include the mind itself. Alert or dull? Settled or restless? Effortful or easy?',
    say: 'Now let awareness include the mind itself. Notice its state. Alert, or dull. Settled, or restless. Effortful, or easy. Just know it, while the breath continues in attention.',
    short: 'Knowing the mind.',
    tips: ['Not the thoughts, but the weather of the mind.'],
    visual: 'still',
    controls: [],
    cues: [{ first: 90, every: 150, texts: ['What is the state of the mind right now?'], untilFrac: 0.8 }],
  },
  fine: {
    phase: 'Practice',
    title: 'Fine detail',
    text: 'Investigate the breath in the finest detail you can. Each breath dissolves into many tiny sensations.',
    say: 'Investigate the breath in the finest detail you can. Notice how each breath dissolves into many tiny sensations, arising and passing. There is always more detail to discover.',
    short: 'Fine detail.',
    tips: ['Many small sensations within each breath.', 'Curiosity keeps attention engaged.'],
    visual: 'fine',
    controls: ['aha'],
    cues: [{ first: 120, every: 160, texts: ['Finer still.', 'Each sensation arising and passing.'], untilFrac: 0.8 }],
  },
  letgo: {
    phase: 'Practice',
    title: 'Letting go of effort',
    text: 'For a few breaths, stop holding on, and just watch. If attention stays, let go a little more. If it slips, gently take hold again.',
    say: 'Now experiment with letting go of effort. For a few breaths, stop holding on, and simply watch. If attention stays stable, keep letting go. If it slips, gently pick up the effort again, and try once more.',
    short: 'Letting go of effort.',
    tips: ['Guidance will fade from here on.', 'Notice the stability that stays when you let go.'],
    visual: 'effortless',
    controls: [],
    cues: [{ first: 60, every: 110, texts: ['Let go a little more.', 'Is it still stable? Then keep letting go.', 'Nothing to hold.'], untilFrac: 0.5 }],
  },
  senses: {
    phase: 'Practice',
    title: 'Effortless sitting',
    text: 'Let go of all effort. Rest with the breath, or with whatever stable experience remains. Let everything come and go.',
    say: 'Let go of all effort. Rest with the breath, or with whatever stable experience remains. Lights, sounds, sensations of energy: let them come, and let them go.',
    short: 'Effortless sitting.',
    tips: ['Nothing to do.', 'Let phenomena run their course.'],
    visual: 'senses',
    controls: [],
    cues: [{ first: 240, every: 300, texts: ['Nothing to do. Let everything be.'], untilFrac: 0.7 }],
  },
  joy: {
    phase: 'Practice',
    title: 'Calming joy',
    text: 'If joy is here, let it be, without grasping. Let familiarity calm its intensity, like ripples settling on a lake.',
    say: 'If joy is present, let it be here, without grasping. Let familiarity calm its intensity, like ripples settling on a lake.',
    short: 'Calming joy.',
    tips: ['Let it settle on its own.'],
    visual: 'joy',
    controls: [],
    cues: [{ first: 300, every: 400, texts: ['Let it settle.'], untilFrac: 0.6 }],
  },
  still: {
    phase: 'Practice',
    title: 'Abiding',
    text: 'Simply rest.',
    say: 'Simply rest.',
    short: 'Rest.',
    visual: 'still',
    controls: [],
  },
};

// Weighted practice plans per stage.
const PLANS: Record<number, [keyof typeof P, number][]> = {
  1: [['nose', 1]],
  2: [['count', 0.4], ['connect', 0.3], ['nose', 0.3]],
  3: [['follow', 0.35], ['connect', 0.15], ['checkin', 0.3], ['label', 0.2]],
  4: [['continuous', 0.4], ['explore', 0.3], ['label', 0.3]],
  5: [['scan', 0.6], ['vivid', 0.4]],
  6: [['whole', 0.45], ['ignore', 0.35], ['meta', 0.2]],
  7: [['fine', 0.4], ['letgo', 0.6]],
  8: [['senses', 1]],
  9: [['joy', 1]],
  10: [['still', 1]],
};

let idc = 0;
const mk = (t: T, dur: number): Segment => ({ ...t, dur: Math.round(dur), id: `seg${++idc}` });

/** Build a full guided sit for a stage. */
export function buildGuided(stage: number, minutes: number): Script {
  const total = minutes * 60;
  const openDur = Math.min(30, total * 0.05);
  const closeDur = Math.min(60, Math.max(30, total * 0.06));
  const transFrac = stage <= 4 ? 0.2 : stage <= 7 ? 0.13 : 0.08;
  const trans = Math.min(stage <= 4 ? 420 : 240, Math.max(stage <= 7 ? 100 : 60, total * transFrac));
  const practice = Math.max(60, total - openDur - closeDur - trans);

  const segs: Segment[] = [mk(opening(), openDur)];
  if (stage >= 8) {
    // At the adept stages the transition is brief: body, then the breath.
    segs.push(mk(T_BODY, trans * 0.5), mk(T_NOSE, trans * 0.5));
  } else {
    segs.push(mk(T_PRESENT, trans * 0.27), mk(T_BODY, trans * 0.25), mk(T_BREATH_BODY, trans * 0.24), mk(T_NOSE, trans * 0.24));
  }
  for (const [k, w] of PLANS[stage]) segs.push(mk(P[k], practice * w));
  segs.push(mk(closing(), closeDur));
  // Stage-specific nuance on the nose step
  if (stage === 1) {
    const n = segs.find((s) => s.title === 'Breath at the nose' && s.phase === 'Practice');
    if (n) n.tips = ['Your only job: stay for the whole sit.', ...(n.tips || [])];
  }
  return { title: `Stage ${stage} sit`, stage, kind: 'guided', segments: fixTotal(segs, total) };
}

function fixTotal(segs: Segment[], total: number) {
  const sum = segs.reduce((a, s) => a + s.dur, 0);
  const diff = Math.round(total - sum);
  // give rounding remainder to the longest practice segment
  const longest = segs.filter((s) => s.phase === 'Practice').sort((a, b) => b.dur - a.dur)[0];
  if (longest) longest.dur += diff;
  return segs;
}

// ------------------------------------------------------------------
// Technique drills: short focused sessions
// ------------------------------------------------------------------

export interface Drill {
  id: string;
  name: string;
  blurb: string;
  stage: number;
  minutes: number;
  visual: VisualMode;
}

export const DRILLS: Drill[] = [
  { id: 'drill-transition', name: 'Four-step transition', blurb: 'Move from open awareness to the breath at the nose.', stage: 1, minutes: 5, visual: 'present' },
  { id: 'drill-nose', name: 'Breath at the nose', blurb: 'Find the spot where the air is clearest and rest there.', stage: 1, minutes: 5, visual: 'nose' },
  { id: 'drill-aha', name: 'The "aha!" moment', blurb: 'Practice rewarding every moment of noticing.', stage: 2, minutes: 5, visual: 'nose' },
  { id: 'drill-count', name: 'Counting', blurb: 'One to ten, at the end of each out-breath.', stage: 2, minutes: 5, visual: 'count' },
  { id: 'drill-connect', name: 'Connecting', blurb: 'Longer or shorter than the last breath?', stage: 2, minutes: 5, visual: 'connect' },
  { id: 'drill-follow', name: 'Following', blurb: 'Beginnings, endings and the pauses between.', stage: 3, minutes: 5, visual: 'follow' },
  { id: 'drill-checkin', name: 'Checking in', blurb: 'Soft pulses train the inner lookout.', stage: 3, minutes: 6, visual: 'checkin' },
  { id: 'drill-label', name: 'Labeling', blurb: 'Name a distraction, keep it in the background.', stage: 3, minutes: 5, visual: 'label' },
  { id: 'drill-scan', name: 'Body scan', blurb: 'A slow sweep through every region of the body.', stage: 5, minutes: 8, visual: 'scan' },
  { id: 'drill-whole', name: 'Whole-body breathing', blurb: 'The whole body as one field of breath.', stage: 6, minutes: 6, visual: 'whole' },
  { id: 'drill-letgo', name: 'Letting go of effort', blurb: 'Test how stability holds without effort.', stage: 7, minutes: 6, visual: 'effortless' },
];

export function buildDrill(id: string): Script {
  const d = DRILLS.find((x) => x.id === id) || DRILLS[1];
  const total = d.minutes * 60;
  const o = mk(opening(), 15);
  const c = mk(closing(), 25);
  const body = total - 40;
  const segs: Segment[] = [o];
  switch (id) {
    case 'drill-transition':
      segs.push(mk(T_PRESENT, body * 0.25), mk(T_BODY, body * 0.25), mk(T_BREATH_BODY, body * 0.25), mk(T_NOSE, body * 0.25));
      break;
    case 'drill-nose':
      segs.push(mk(T_NOSE, 40), mk(P.nose, body - 40));
      break;
    case 'drill-aha':
      segs.push(mk(T_NOSE, 30), mk({ ...P.nose, title: 'The "aha!" moment', text: 'Each time you realize you drifted, tap Aha, enjoy it for a moment, and return gently.', tips: ['Enjoy the moment of noticing.', 'Return gently, with no rush.'] }, body - 30));
      break;
    case 'drill-count':
      segs.push(mk(T_NOSE, 30), mk(P.count, body - 30));
      break;
    case 'drill-connect':
      segs.push(mk(T_NOSE, 30), mk(P.connect, body - 30));
      break;
    case 'drill-follow':
      segs.push(mk(T_NOSE, 30), mk(P.follow, body - 30));
      break;
    case 'drill-checkin':
      segs.push(mk(T_NOSE, 30), mk(P.checkin, body - 30));
      break;
    case 'drill-label':
      segs.push(mk(T_NOSE, 30), mk(P.label, body - 30));
      break;
    case 'drill-scan':
      segs.push(mk(T_BODY, 30), mk(P.scan, body - 30));
      break;
    case 'drill-whole':
      segs.push(mk(T_BREATH_BODY, 30), mk(P.whole, body - 30));
      break;
    case 'drill-letgo':
      segs.push(mk(T_NOSE, 30), mk(P.fine, 60), mk(P.letgo, body - 90));
      break;
  }
  segs.push(c);
  return { title: d.name, stage: d.stage, kind: 'drill', segments: fixTotal(segs, total) };
}

// ------------------------------------------------------------------
// Silent timer
// ------------------------------------------------------------------
export function buildTimer(minutes: number, intervalMin: number): Script {
  const total = minutes * 60;
  const seg = mk(
    {
      phase: 'Practice',
      title: 'Silent sit',
      text: '',
      say: '',
      visual: 'still',
      controls: ['aha'],
      cues: intervalMin > 0 ? [{ first: intervalMin * 60, every: intervalMin * 60, texts: [], chime: true, pulse: true }] : [],
    },
    total
  );
  return { title: `${minutes}-minute silent sit`, stage: 0, kind: 'timer', segments: [seg] };
}

// ------------------------------------------------------------------
// Walking meditation
// ------------------------------------------------------------------
export function buildWalking(minutes: number): Script {
  const total = minutes * 60;
  const segs = [
    mk({ phase: 'Opening', title: 'Standing', text: 'Stand still. Feel the weight of the body pressing through the feet into the ground.', say: 'Stand still for a moment, at one end of a short path. Feel the weight of the body pressing down through the soles of the feet. Let the arms rest. Let the gaze rest a few steps ahead.', visual: 'walk', controls: [] }, 40),
    mk({ phase: 'Practice', title: 'Lift · move · place', text: 'Walk slowly. Silently note each part of the step: lift, move, place. At the end of the path, stand, turn mindfully, and continue.', say: 'Begin to walk, slowly. With each step, notice three parts. Lift. Move. Place. Let the sensations of the feet be the object of attention. At the end of the path, pause, turn mindfully, and continue.', short: 'Lift, move, place.', tips: ['Gaze softly ahead, not at your feet.', 'Wandered? Stop, appreciate noticing, then continue.'], visual: 'walk', walk: 3, controls: ['aha'], cues: [{ first: 60, every: 90, texts: ['Lift. Move. Place.', 'Feel the sole of the foot meeting the ground.'], untilFrac: 0.9 }] }, (total - 100) * 0.5),
    mk({ phase: 'Practice', title: 'Six-part step', text: 'Slower now. Heel rising, lifting, moving, lowering, touching, pressing.', say: 'Slow down further, and notice six parts of each step. The heel rising. Lifting. Moving forward. Lowering. Touching. Pressing down.', short: 'Six parts.', tips: ['Shift weight fully before the next step.'], visual: 'walk', walk: 6, controls: ['aha'], cues: [{ first: 80, every: 100, texts: ['Rising, lifting, moving, lowering, touching, pressing.'], untilFrac: 0.85 }] }, (total - 100) * 0.5),
    mk({ phase: 'Closing', title: 'Standing', text: 'Come to stillness. Feel the whole body standing.', say: 'Come to a stop. Stand still, and feel the whole body standing here. When the bells sound, the practice is complete.', visual: 'walk', controls: [] }, 60),
  ];
  return { title: 'Walking meditation', stage: 0, kind: 'walking', segments: fixTotal(segs, total) };
}

// ------------------------------------------------------------------
// Loving-kindness
// ------------------------------------------------------------------
const CIRCLES = [
  { who: 'yourself', title: 'Yourself', text: 'Hold yourself in mind with warmth.', say: 'Begin with yourself. Bring to mind a sense of your own presence, sitting here. Silently offer these wishes. May I be happy. May I be healthy. May I be safe. May I live with ease.' },
  { who: 'a benefactor', title: 'A benefactor', text: 'Someone who has been kind to you.', say: 'Now bring to mind someone who has been kind to you. A teacher, a friend, a grandparent. See them, and offer the wishes. May you be happy. May you be healthy. May you be safe. May you live with ease.' },
  { who: 'a friend', title: 'A friend', text: 'Someone you love easily.', say: 'Now a good friend. Someone you love easily. May you be happy. May you be healthy. May you be safe. May you live with ease.' },
  { who: 'a neutral person', title: 'A neutral person', text: 'Someone you see but barely know.', say: 'Now someone neutral, someone you see but barely know. A neighbor, a cashier. They want to be happy, just as you do. May you be happy. May you be healthy. May you be safe. May you live with ease.' },
  { who: 'a difficult person', title: 'A difficult person', text: 'Someone mildly difficult. Start small.', say: 'If you feel ready, bring to mind someone mildly difficult. Not the hardest person. Recognize that they too want to be free from suffering. May you be happy. May you be healthy. May you be safe. May you live with ease.' },
  { who: 'all beings', title: 'All beings', text: 'Let the warmth radiate in every direction.', say: 'Now let this warmth radiate outward in every direction. To everyone in this building. This city. This world. All beings, everywhere. May all beings be happy. May all beings be healthy. May all beings be safe. May all beings live with ease.' },
];

export function buildMetta(minutes: number): Script {
  const total = minutes * 60;
  const body = total - 60;
  const segs: Segment[] = [
    mk({ phase: 'Opening', title: 'Arriving', text: 'Settle in. Rest a hand on the heart if you like.', say: 'Settle into a comfortable posture. If you like, rest a hand on your heart. Take a few natural breaths, and let a gentle smile come to the face.', visual: 'metta', metta: 0, controls: [] }, 30),
    ...CIRCLES.map((c, i) =>
      mk(
        {
          phase: 'Practice',
          title: c.title,
          text: c.text,
          say: c.say,
          short: c.title + '.',
          tips: ['May you be happy.', 'May you be healthy.', 'May you be safe.', 'May you live with ease.'],
          visual: 'metta',
          metta: i,
          controls: [],
          cues: [{ first: 50, every: 60, texts: [i === 0 ? 'May I be happy. May I live with ease.' : i === 5 ? 'May all beings be happy.' : 'May you be happy. May you live with ease.'], untilFrac: 0.85 }],
        },
        body / CIRCLES.length
      )
    ),
    mk({ ...closing(), visual: 'metta', metta: 5, say: 'Let the phrases go, and rest in whatever warmth remains. When the bells sound, gently open your eyes.' }, 30),
  ];
  return { title: 'Loving-kindness', stage: 0, kind: 'metta', segments: fixTotal(segs, total) };
}

export const SCAN_REGIONS = [
  { name: 'the crown and scalp', y: -0.45 },
  { name: 'the face', y: -0.37 },
  { name: 'the jaw, throat and neck', y: -0.29 },
  { name: 'the shoulders', y: -0.23 },
  { name: 'the chest, upper back and upper arms', y: -0.14 },
  { name: 'the belly, lower back and forearms', y: -0.02 },
  { name: 'the hands and hips', y: 0.12 },
  { name: 'the legs and feet', y: 0.21 },
];
