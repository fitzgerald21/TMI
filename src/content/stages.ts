// Stage content for the ten stages of The Mind Illuminated.
// Written as an original study companion: summaries are paraphrased, not quoted.
// For the full teaching, read the book by Culadasa (John Yates, PhD),
// Matthew Immergut and Jeremy Graves.

export type VisualMode =
  | 'arrive'
  | 'present'
  | 'body'
  | 'breathBody'
  | 'nose'
  | 'count'
  | 'follow'
  | 'connect'
  | 'checkin'
  | 'label'
  | 'scan'
  | 'whole'
  | 'fine'
  | 'effortless'
  | 'senses'
  | 'joy'
  | 'still'
  | 'metta'
  | 'walk'
  | 'close';

export interface Technique {
  id: string;
  name: string;
  oneLine: string;
  steps: string[];
  why: string;
  visual: VisualMode;
  /** id of a drill in sessions/drills that lets you try this technique */
  drill?: string;
}

export interface Stage {
  n: number;
  short: string;
  title: string;
  phase: 'Novice' | 'Skilled' | 'Transition' | 'Adept';
  essence: string;
  goal: string;
  obstacles: string[];
  skills: string[];
  mastery: string;
  overview: string[];
  techniques: Technique[];
  tips: string[];
  pitfalls: string[];
  signs: string[];
  /** Visual shown at the top of the stage page */
  heroVisual: VisualMode;
}

export interface Milestone {
  after: number;
  n: number;
  title: string;
  text: string;
}

export const MILESTONES: Milestone[] = [
  {
    after: 3,
    n: 1,
    title: 'Continuous attention to the object',
    text: 'Forgetting and mind-wandering have stopped. You may still be distracted, but the breath never fully drops out of your experience. This is the point where you stop being a novice.',
  },
  {
    after: 6,
    n: 2,
    title: 'Sustained exclusive attention',
    text: 'Attention rests on the breath alone, with subtle distractions gone and mindfulness strong. The mind is beginning to work together as one.',
  },
  {
    after: 7,
    n: 3,
    title: 'Effortless stability of attention',
    text: 'You no longer need to watch over or push attention. Stability and clarity keep themselves going. Practice now unfolds on its own.',
  },
  {
    after: 10,
    n: 4,
    title: 'Persisting mental and physical pliancy',
    text: 'The calm, joy and equanimity of the meditative state carry over into the rest of your day, for hours after you get up from the cushion.',
  },
];

export const STAGES: Stage[] = [
  {
    n: 1,
    short: 'Establishing a Practice',
    title: 'Establishing a Practice',
    phase: 'Novice',
    essence: 'Show up every day. Consistency matters more than anything that happens in the sit.',
    goal: 'Build a consistent, daily meditation practice.',
    obstacles: ['Resistance', 'Procrastination', 'Fatigue', 'Impatience', 'Boredom', 'Low motivation'],
    skills: [
      'Creating a routine with a set time and place',
      'Setting a specific, realistic goal for each session',
      'Generating motivation before you sit',
      'Diligence: sitting out the full time you committed to',
    ],
    mastery: 'You never miss a daily session.',
    overview: [
      'The first stage is about building the habit, not about technique. A short sit every day will take you further than a long sit now and then. Pick a time, a place and a duration you can actually keep, and keep them.',
      'Each sit starts with a short preparation: remind yourself why you practice, set a modest goal, drop your expectations, commit to sitting the full time, set aside likely distractions, and settle your posture. Then ease in with the four-step transition, moving from open awareness of the present, to the body, to the breath in the body, and finally to the breath at the nose.',
      'Once attention is on the breath at the nose, the job is simple. When you notice you have drifted, come back. Every sit you complete is a good sit, however scattered it felt.',
    ],
    techniques: [
      {
        id: 'prep',
        name: 'The six preparation steps',
        oneLine: 'A short ritual before you start that sets up the whole sit.',
        steps: [
          'Motivation: recall why you are practicing.',
          'Goals: choose one modest, specific goal for this sit.',
          'Expectations: let go of hopes about how this sit should go.',
          'Diligence: commit to sitting out the whole time.',
          'Distractions: name what is on your mind and set it aside for now.',
          'Posture: settle into a position that is upright, relaxed and stable.',
        ],
        why: 'A clear intention at the start shapes how the mind behaves for the rest of the session. Unconscious parts of the mind take the intention up and carry it.',
        visual: 'arrive',
      },
      {
        id: 'transition',
        name: 'The four-step transition',
        oneLine: 'Narrow the scope of attention gradually, from everything to the breath at the nose.',
        steps: [
          'Focus on the present: let in everything (sounds, sensations, smells, light) with no favorites.',
          'Bodily sensations: narrow down to sensations in the body only.',
          'Breath sensations in the body: notice how the breath moves the belly, chest and shoulders.',
          'Breath at the nose: settle on the sensations of air at the nostrils and upper lip.',
        ],
        why: 'Narrowing gradually lets the mind settle and keeps peripheral awareness wide, instead of forcing attention onto a narrow point all at once.',
        visual: 'present',
        drill: 'drill-transition',
      },
      {
        id: 'nose',
        name: 'Breath at the nose',
        oneLine: 'Your home base: the sensations where air passes in and out.',
        steps: [
          'Rest attention where you feel the air most clearly: inside the nostrils, the rims, or the upper lip.',
          'Don\'t visualize the breath or control it. Just notice the sensations as they are.',
          'Let everything else stay in the background as peripheral awareness.',
        ],
        why: 'The breath is always there, always changing, and neutral. It is easy to come back to and has endless detail to discover later on.',
        visual: 'nose',
        drill: 'drill-nose',
      },
    ],
    tips: [
      'A short sit you actually do beats a long one you skip. Start with 10–15 minutes and lengthen gradually.',
      'Sit at the same time each day so the habit can attach to something.',
      'There are no bad sits. A restless sit you finished still counts toward mastery of this stage.',
      'Notice and set aside judgments about how the sit "went". That habit will serve you at every stage.',
    ],
    pitfalls: [
      'Waiting until you "feel like it".',
      'Ending early because the sit seems pointless.',
      'Turning the sit into thinking or problem-solving time.',
    ],
    signs: ['You don\'t meditate every day yet', 'You often skip or cut sits short'],
    heroVisual: 'arrive',
  },
  {
    n: 2,
    short: 'Interrupted Attention',
    title: 'Interrupted Attention and Overcoming Mind-Wandering',
    phase: 'Novice',
    essence: 'Celebrate every moment you notice you were wandering. That moment is how you learn.',
    goal: 'Shorten periods of mind-wandering and lengthen the time attention stays on the breath.',
    obstacles: ['Forgetting', 'Mind-wandering', 'Impatience', 'Monkey mind'],
    skills: [
      'Reinforcing the spontaneous moment of noticing (the "aha!")',
      'Learning to sustain attention on the breath',
    ],
    mastery: 'You can stay with the breath for minutes at a time, and most bouts of mind-wandering last only a few seconds.',
    overview: [
      'You sit down intending to watch the breath, and a few seconds later you are planning dinner. First you forget the breath. Then the mind wanders, sometimes for minutes. Eventually you wake up to the fact that you were gone. Everyone goes through this.',
      'That waking up is the key moment of this stage. It is introspective awareness happening spontaneously. If you scold yourself, the mind learns that noticing is unpleasant. If you appreciate it with a warm "aha, good!", the mind learns to notice sooner. Enjoy the moment, then gently bring attention back.',
      'To sustain attention once you are back, give the mind something to do with the breath: count breaths, follow the parts of each breath, or connect one breath to the next.',
    ],
    techniques: [
      {
        id: 'aha',
        name: 'Appreciate the "aha!" moment',
        oneLine: 'Reward noticing, never punish wandering.',
        steps: [
          'When you realize you have wandered, pause for a moment.',
          'Enjoy having woken up. Let it feel good.',
          'Gently, without any rush, bring attention back to the breath.',
        ],
        why: 'The mind learns from whatever you reinforce. Rewarding the moment of noticing makes it happen sooner and more often, so mind-wandering gets shorter.',
        visual: 'nose',
        drill: 'drill-aha',
      },
      {
        id: 'count',
        name: 'Counting the breath',
        oneLine: 'Count each breath silently from one to ten, then begin again.',
        steps: [
          'At the end of each out-breath, silently count: one… two… up to ten.',
          'Then start again at one.',
          'If you lose count or go past ten, simply start over at one, with no judgment.',
          'Once you rarely lose count, drop counting and use connecting or following.',
        ],
        why: 'Counting gives the mind a simple job, and losing count tells you right away that you drifted.',
        visual: 'count',
        drill: 'drill-count',
      },
      {
        id: 'connect',
        name: 'Connecting',
        oneLine: 'Compare each part of the breath with the one before it.',
        steps: [
          'Notice: was this in-breath longer or shorter than the previous one?',
          'Was the out-breath longer or shorter than the in-breath?',
          'Keep the comparisons light, a quick noticing rather than a measurement.',
        ],
        why: 'Comparing needs you to hold the last breath in mind, which links breaths together and makes attention more continuous.',
        visual: 'connect',
        drill: 'drill-connect',
      },
    ],
    tips: [
      'Say "aha!" warmly to yourself. A little smile helps.',
      'Expect wandering. It is how the mind works, not a sign you are failing.',
      'Come back gently. Snapping back with irritation teaches the mind that noticing hurts.',
      'Keep peripheral awareness open: let sounds and sensations be there in the background.',
    ],
    pitfalls: [
      'Scolding yourself for wandering.',
      'Gripping the breath tightly to stop wandering, which creates strain and backfires.',
      'Thinking this stage is a waste because you "can\'t focus".',
    ],
    signs: ['You often realize you\'ve been lost in thought for a long time', 'Wandering episodes last minutes'],
    heroVisual: 'count',
  },
  {
    n: 3,
    short: 'Extended Continuity',
    title: 'Extended Continuity of Attention and Overcoming Forgetting',
    phase: 'Novice',
    essence: 'Catch distractions before they turn into forgetting, by checking in early and often.',
    goal: 'Overcome forgetting and falling asleep.',
    obstacles: ['Distractions', 'Forgetting', 'Mind-wandering', 'Sleepiness'],
    skills: [
      'Following and connecting to extend uninterrupted attention',
      'Building introspective awareness through labeling and checking in',
      'Recognizing and countering sleepiness',
    ],
    mastery: 'You rarely forget the breath or nod off.',
    overview: [
      'Forgetting always starts with a distraction. A thought, a sound or an itch shares the stage with the breath, grows, and finally pushes the breath out entirely. At this stage you learn to catch the distraction while it is still in the background, before forgetting can happen.',
      'The main tool is checking in: deliberate, frequent glances inward to see what the mind is doing. Is attention still on the breath? Is something pulling at it? Make checking in a habit and it starts to happen on its own.',
      'Following the breath in finer detail (where each in-breath begins and ends, the pauses between) keeps attention engaged and vivid. Labeling a distraction ("thinking", "hearing") helps you see it clearly while keeping it in the background.',
    ],
    techniques: [
      {
        id: 'follow',
        name: 'Following the breath',
        oneLine: 'Track the beginning and end of each in-breath and out-breath, and the pauses.',
        steps: [
          'Notice exactly where the in-breath begins and where it ends.',
          'Notice the pause, then where the out-breath begins and ends.',
          'Notice the pause after the out-breath.',
          'As this gets easy, notice more detail: subtle sensations in the middle of each breath.',
        ],
        why: 'Engaging with details keeps attention busy and interested, and it builds the clarity needed later.',
        visual: 'follow',
        drill: 'drill-follow',
      },
      {
        id: 'checkin',
        name: 'Checking in',
        oneLine: 'Frequently and lightly look inward: what is happening in the mind right now?',
        steps: [
          'Every so often, without letting go of the breath, shift a little attention inward.',
          'Ask: is the breath still in the foreground? Is anything else competing?',
          'If a distraction is growing, gently re-emphasize the breath.',
          'Check in often, every few breaths at first, so you catch things before you forget.',
        ],
        why: 'Each check-in strengthens introspective awareness, until it runs continuously in the background like a lookout.',
        visual: 'checkin',
        drill: 'drill-checkin',
      },
      {
        id: 'label',
        name: 'Labeling distractions',
        oneLine: 'Give a distraction a quick, soft name, then return attention to the breath.',
        steps: [
          'When you notice a distraction in the background, label it in one word: "planning", "hearing", "itching".',
          'Keep attention on the breath while you label.',
          'Let the distraction stay in peripheral awareness. No need to push it away.',
        ],
        why: 'Labeling builds clear recognition of what the mind is doing without getting pulled into the content.',
        visual: 'label',
        drill: 'drill-label',
      },
    ],
    tips: [
      'Check in before you think you need to. The aim is to get ahead of forgetting.',
      'For sleepiness: sit up straighter, take a few deeper breaths, or open your eyes a little.',
      'Don\'t meditate right after a heavy meal or when exhausted, if you can avoid it.',
      'Pain and restlessness can be noticed and labeled like any other distraction.',
    ],
    pitfalls: [
      'Checking in so heavily that you lose the breath.',
      'Treating labeling as thinking about the distraction.',
      'Accepting drowsiness because it feels peaceful.',
    ],
    signs: ['You still sometimes lose the breath completely', 'You occasionally nod off'],
    heroVisual: 'checkin',
  },
  {
    n: 4,
    short: 'Continuous Attention',
    title: 'Continuous Attention and Overcoming Gross Distraction and Strong Dullness',
    phase: 'Skilled',
    essence: 'The breath never leaves now. Keep it in the foreground, and keep the mind bright.',
    goal: 'Overcome gross distraction and strong dullness.',
    obstacles: ['Gross distraction', 'Strong dullness', 'Pain and discomfort', 'Intellectual insights', 'Emotionally charged memories and visions'],
    skills: [
      'Continuous introspective awareness that catches gross distraction and strong dullness early',
      'Correcting them before they take over',
      'Working skillfully with pain and emotional purification',
    ],
    mastery: 'Gross distractions no longer push the breath into the background, and breath sensations no longer fade or distort from strong dullness.',
    overview: [
      'You no longer forget the breath, so attention is continuous. But a strong distraction (pain, a vivid memory, a plan) can still take over the foreground while the breath sinks into the background. That is gross distraction. At the other extreme, strong dullness makes the breath fade, blur or distort, with dreamlike images drifting in.',
      'The skill is continuous introspective awareness. Keep checking in until a part of the mind keeps watch on its own. Then you can notice a distraction or dullness starting and correct it right away.',
      'This stage is also where old memories and emotions often come up, sometimes intensely. Let them arise and pass without getting caught in their story. This purification is healthy and frees up energy.',
    ],
    techniques: [
      {
        id: 'continuous',
        name: 'Continuous checking in',
        oneLine: 'Check in so often it becomes a constant, light background awareness.',
        steps: [
          'Check in frequently, as at stage 3.',
          'Notice whether the breath is fully in the foreground or sharing it with something else.',
          'Correct early: renew your intention toward the breath the moment something starts to grow.',
        ],
        why: 'Continuous introspective awareness is what lets you correct distraction and dullness while they are still weak.',
        visual: 'checkin',
        drill: 'drill-checkin',
      },
      {
        id: 'dullness',
        name: 'Antidotes for strong dullness',
        oneLine: 'Raise your energy when the mind starts to sink.',
        steps: [
          'Take three or four deep breaths, then let breathing return to normal.',
          'Tense your body all over for a few seconds, then relax.',
          'Straighten the spine and lift the head slightly.',
          'If needed, open your eyes, or stand and meditate standing for a while.',
        ],
        why: 'Dullness is low mental energy. These physical shifts bring energy and alertness back without breaking the sit.',
        visual: 'nose',
      },
      {
        id: 'pain',
        name: 'Working with pain',
        oneLine: 'Investigate discomfort instead of fighting it, or move mindfully.',
        steps: [
          'When pain becomes the focus, let it be the object of attention for a while.',
          'Explore it: where exactly is it, what is its texture, how does it change?',
          'Notice the difference between the raw sensation and your resistance to it.',
          'If you decide to move, do it slowly and mindfully, then return to the breath.',
        ],
        why: 'Investigating pain makes it less of a threat and builds your ability to stay present with difficult sensations.',
        visual: 'body',
      },
    ],
    tips: [
      'Investigate the breath in more detail. A rich object holds attention against distraction.',
      'Deliberately strengthen peripheral awareness. It is what notices dullness and distraction coming.',
      'If an emotional memory comes up, let it be. Breathe with it. It will pass.',
      'Insights that come up during the sit can wait. Note them briefly and return.',
    ],
    pitfalls: [
      'Settling for a dim, foggy breath because it is pleasant and calm.',
      'Following a fascinating insight for the rest of the sit.',
      'Pushing away strong emotions instead of letting them move through.',
    ],
    signs: ['Breath stays present but is often pushed into the background', 'Breath sensations sometimes get dim or dreamlike'],
    heroVisual: 'label',
  },
  {
    n: 5,
    short: 'Overcoming Subtle Dullness',
    title: 'Overcoming Subtle Dullness and Increasing Mindfulness',
    phase: 'Skilled',
    essence: 'Pleasant stability can hide a quiet loss of clarity. Turn the brightness up.',
    goal: 'Overcome subtle dullness and increase the power of mindfulness.',
    obstacles: ['Subtle dullness, which is stable, comfortable and easy to miss'],
    skills: [
      'Stronger, more continuous introspective awareness that can detect subtle dullness',
      'Body scanning to boost the vividness of perception',
    ],
    mastery: 'You can sustain, and even increase, the power of mindfulness through each session.',
    overview: [
      'Attention is now stable, so a new problem shows up. Things get comfortable, the breath is clear enough, and the mind slowly sinks into a pleasant, slightly hazy calm. That is subtle dullness. It is easy to mistake for good meditation, because it feels peaceful and nothing seems wrong.',
      'Signs to look for: the breath is less vivid than a few minutes ago, peripheral awareness has shrunk, and there is a soft, floaty pleasantness. The remedy is to deliberately raise the level of detail and alertness.',
      'Body scanning is the main practice. Move attention systematically through the body, investigating sensations in each region, while staying aware of the breath. It trains attention to perceive more detail, which lifts the overall power of mindfulness.',
    ],
    techniques: [
      {
        id: 'scan',
        name: 'Body scanning',
        oneLine: 'Move attention through the body, region by region, noticing sensations in detail.',
        steps: [
          'Start at one region, such as the nose and face, and notice every sensation there.',
          'Move slowly through the head, neck, shoulders, arms, chest, back, belly, hips, legs and feet.',
          'In each region, notice how the breath affects the sensations there.',
          'If a region feels blank, stay with it and look for any sensation, even a subtle one.',
        ],
        why: 'Searching for subtle sensations increases how much the mind perceives, which works directly against subtle dullness.',
        visual: 'scan',
        drill: 'drill-scan',
      },
      {
        id: 'vivid',
        name: 'Raising vividness',
        oneLine: 'Keep asking: is the breath as vivid now as a minute ago?',
        steps: [
          'Check in on clarity, not just on whether you are on the breath.',
          'If things feel hazy, raise your interest: find a new detail in the breath.',
          'Keep peripheral awareness wide. Shrinking awareness is a sign of dullness.',
        ],
        why: 'Subtle dullness only goes away if you deliberately check for it and counter it.',
        visual: 'fine',
      },
    ],
    tips: [
      'Be suspicious of a sit that feels nicely relaxed but slightly floaty.',
      'Notice the moment the breath goes from crisp to soft. Correct right there.',
      'Don\'t overcorrect into strain. Aim for alert and relaxed at the same time.',
    ],
    pitfalls: [
      'Mistaking subtle dullness for calm or deep concentration.',
      'Over-efforting until you get agitated.',
    ],
    signs: ['Sits feel stable but slightly sleepy or soft', 'Breath clarity fades as the sit goes on'],
    heroVisual: 'scan',
  },
  {
    n: 6,
    short: 'Subduing Subtle Distractions',
    title: 'Subduing Subtle Distractions',
    phase: 'Skilled',
    essence: 'Let attention narrow to the breath alone. Background chatter fades when it gets no attention.',
    goal: 'Achieve exclusive attention and unify the mind.',
    obstacles: ['Subtle distractions', 'The habit of attention alternating to other objects'],
    skills: [
      'Defining the scope of attention precisely',
      'Experiencing the whole body with the breath',
      'Metacognitive introspective awareness: awareness of the state of the mind itself',
    ],
    mastery: 'Exclusive attention that lasts, with subtle distractions almost entirely gone, together with vivid, intense mindfulness.',
    overview: [
      'Even with stable, bright attention, little things flicker at the edges: a background thought, a sound, an itch. Attention keeps alternating to them for brief moments. These are subtle distractions. At this stage you learn to stop giving them any attention, so they lose their fuel and fade.',
      'Practice whole-body breathing: experience the breath moving through the whole body as one field of sensation. Then define exactly what attention will include and ignore everything else. Distractions still appear in awareness, but attention no longer goes to them.',
      'Awareness also turns more toward the mind itself. Instead of noticing "a sound", you notice the state of the mind: settled, agitated, dull, bright. This metacognitive awareness is the vantage point that lets the mind become unified.',
    ],
    techniques: [
      {
        id: 'whole',
        name: 'Whole-body breathing',
        oneLine: 'Feel the breath as a wave moving through the entire body.',
        steps: [
          'Expand attention to include the whole body at once.',
          'Notice how every part of the body changes subtly with the in-breath and the out-breath.',
          'Let the sense of "breathing with the whole body" fill attention.',
          'Then narrow back to the nose, keeping the same clarity.',
        ],
        why: 'A wide, rich object takes up attention fully, leaving no space for subtle distractions.',
        visual: 'whole',
        drill: 'drill-whole',
      },
      {
        id: 'ignore',
        name: 'Ignoring subtle distractions',
        oneLine: 'Define the scope of attention and give nothing outside it any attention.',
        steps: [
          'Decide exactly what attention includes: the breath at the nose, nothing else.',
          'When a subtle distraction appears, don\'t look at it, label it or push it away.',
          'Let it stay in peripheral awareness, unattended, until it fades.',
        ],
        why: 'Distractions live on attention. Starved of it, they settle down, and attention becomes exclusive.',
        visual: 'fine',
      },
      {
        id: 'meta',
        name: 'Metacognitive awareness',
        oneLine: 'Be aware of the state of the mind, not only its contents.',
        steps: [
          'Turn peripheral awareness toward the mind itself.',
          'Notice qualities: alert or dull, settled or restless, effortful or easy.',
          'Use this overview to make small corrections.',
        ],
        why: 'Seeing the mind\'s overall state lets you guide it with intention instead of reacting to individual thoughts.',
        visual: 'still',
      },
    ],
    tips: [
      'Keep the scope of attention modest and clear. Fuzzy edges invite distraction.',
      'Treat subtle distractions with complete indifference.',
      'Stay with whole-body breathing for long stretches. It deepens with time.',
    ],
    pitfalls: [
      'Labeling or engaging subtle distractions as at earlier stages.',
      'Narrowing attention so much that peripheral awareness collapses.',
    ],
    signs: ['Attention is stable but keeps flicking to faint background thoughts', 'Mindfulness is bright but not exclusive'],
    heroVisual: 'whole',
  },
  {
    n: 7,
    short: 'Exclusive Attention',
    title: 'Exclusive Attention and Unifying the Mind',
    phase: 'Transition',
    essence: 'Keep up the effort until it is no longer needed, then learn to let it go.',
    goal: 'Effortless stability of attention and mindfulness.',
    obstacles: ['Boredom', 'Restlessness', 'Doubt', 'Strange sensations and involuntary movements', 'Letting go of effort too early'],
    skills: [
      'Sustaining diligence until effort becomes unnecessary',
      'Experimenting with gradually letting go of effort',
      'Recognizing mental pliancy as it begins',
    ],
    mastery: 'You can let go of all effort at the start of a sit and still effortlessly sustain exclusive attention and strong mindfulness.',
    overview: [
      'Exclusive attention is stable, but so far it takes constant vigilance and effort to keep it. Through steady practice, the different parts of the mind come to share the same intention. When that happens, effort is no longer needed.',
      'Practice in two ways. Keep investigating the breath in ever finer detail, which keeps the mind engaged. And experiment with dropping effort for short periods. If stability holds, let go a little more. If it slips, pick the effort back up.',
      'Boredom and doubt often show up here because nothing seems to be happening. Strange twitches, tingling or heat may arise as well. Treat all of it as background and keep going.',
    ],
    techniques: [
      {
        id: 'fine',
        name: 'Scanning in fine detail',
        oneLine: 'Explore the breath in the finest detail you can perceive.',
        steps: [
          'At the nose, notice each breath breaking up into many small sensations.',
          'Notice temperature, pressure, tingling, and the moment-to-moment changes.',
          'Keep finding more detail. There is always more.',
        ],
        why: 'Fine-grained investigation keeps attention interested and engaged, so it stays exclusive without strain.',
        visual: 'fine',
      },
      {
        id: 'letgo',
        name: 'Letting go of effort',
        oneLine: 'Test what happens when you stop holding on.',
        steps: [
          'Drop effort for a few breaths and just watch.',
          'If attention stays stable and clear, continue without effort a bit longer.',
          'If it slips, gently reapply effort, then try again later.',
          'Gradually extend the effortless periods.',
        ],
        why: 'Effortlessness comes from the mind learning to trust its own stability. Repeated experiments teach it that.',
        visual: 'effortless',
        drill: 'drill-letgo',
      },
    ],
    tips: [
      'Patience. This stage can take a while, and progress is hard to see.',
      'Ignore strange sensations and involuntary movements. They are a normal sign of the mind unifying.',
      'If you are bored, become curious about the boredom itself.',
    ],
    pitfalls: [
      'Giving up effort before stability is really effortless.',
      'Getting absorbed in or alarmed by unusual sensations.',
    ],
    signs: ['Exclusive attention is reliable but takes vigilance', 'You feel boredom or restlessness despite good stability'],
    heroVisual: 'effortless',
  },
  {
    n: 8,
    short: 'Mental Pliancy',
    title: 'Mental Pliancy and Pacifying the Senses',
    phase: 'Adept',
    essence: 'Simply sit. Let lights, sounds and energy come and go while the senses go quiet.',
    goal: 'Complete pacification of the senses and the arising of meditative joy.',
    obstacles: ['Unusual sensations', 'Involuntary movements', 'Intense energy currents', 'Inner lights and sounds', 'Joy itself can be distracting'],
    skills: [
      'Sitting effortlessly while sensory phenomena come and go',
      'Meeting unusual experiences with equanimity',
      'Allowing joy to arise without grasping',
    ],
    mastery: 'The physical senses go quiet, mental pliancy is stable, and meditative joy arises.',
    overview: [
      'Attention is now effortless, with stability and clarity that don\'t need tending. As the mind unifies, the senses gradually go quiet. Hearing fades, the body may seem to disappear, and the breath can become very subtle.',
      'Along the way, the mind may produce its own phenomena: light, sounds, pressure, energy flowing through the body, involuntary movements. These can be intense. The skill is to let them be and keep sitting with effortless attention.',
      'As the senses settle, a pleasant joy starts to arise. This is meditative joy, a natural result of a unified mind.',
    ],
    techniques: [
      {
        id: 'effortless-sit',
        name: 'Effortless sitting',
        oneLine: 'Hold the object lightly, with no effort, and let everything else be.',
        steps: [
          'Begin with the breath, but let go of all effort right away.',
          'If the breath becomes very subtle or disappears, rest with whatever stable experience remains.',
          'Let lights, sounds and energy come and go without engaging.',
        ],
        why: 'Sensory pacification happens on its own when the mind is left undisturbed. Engaging delays it.',
        visual: 'senses',
      },
    ],
    tips: [
      'Energy currents and movements usually resolve on their own. Let them run their course.',
      'Don\'t chase the pleasant states. That is a subtle form of effort.',
      'Guidance from an experienced teacher is especially useful from here on.',
    ],
    pitfalls: ['Getting fascinated by inner lights and visions', 'Trying to make joy happen'],
    signs: ['Practice is effortless', 'Unusual sensations, lights or energy flows are appearing'],
    heroVisual: 'senses',
  },
  {
    n: 9,
    short: 'Calming Joy',
    title: 'Mental and Physical Pliancy and Calming the Intensity of Meditative Joy',
    phase: 'Adept',
    essence: 'Joy is intense at first. Let familiarity calm it into tranquility.',
    goal: 'Mature meditative joy so it produces tranquility and equanimity.',
    obstacles: ['The intensity of meditative joy disturbing the mind'],
    skills: ['Getting so familiar with joy that its excitement calms down', 'Not clinging to or pushing away pleasure'],
    mastery: 'You consistently evoke mental and physical pliancy, and the intensity of joy matures into deep tranquility and equanimity.',
    overview: [
      'When meditative joy first arises it can be thrilling: waves of bliss, a light body, a buzzing excitement. The excitement itself disturbs the stillness.',
      'There is nothing to do except continue. As the mind gets used to joy, its intensity calms. The joy doesn\'t disappear. It matures into a deep, quiet happiness with tranquility and equanimity.',
      'Physical pliancy develops too. The body becomes comfortable and pleasant to sit in for long periods.',
    ],
    techniques: [
      {
        id: 'familiarize',
        name: 'Familiarizing with joy',
        oneLine: 'Keep sitting with joy until it settles into stillness.',
        steps: [
          'Let joy be present without grabbing it.',
          'Notice its texture and movement with calm interest.',
          'Allow it to settle by itself over many sessions.',
        ],
        why: 'Intensity comes from novelty. Familiarity naturally calms it.',
        visual: 'joy',
      },
    ],
    tips: ['Long sits help this stage mature.', 'Bring the same equanimity to joy that you brought to distraction.'],
    pitfalls: ['Craving the high of early joy', 'Ending sits early because the energy is overwhelming'],
    signs: ['Intense, exciting joy arises in sits'],
    heroVisual: 'joy',
  },
  {
    n: 10,
    short: 'Tranquility & Equanimity',
    title: 'Tranquility and Equanimity',
    phase: 'Adept',
    essence: 'The calm of the cushion carries into the rest of the day.',
    goal: 'Tranquility and equanimity that persist after the sit.',
    obstacles: ['None really. Just time and repetition.'],
    skills: ['Continuing regular practice until meditative qualities persist in daily life'],
    mastery: 'Mental and physical pliancy, joy, tranquility and equanimity persist for hours after you get up.',
    overview: [
      'Every sit now brings the mind into a state of stable attention, strong mindfulness, joy, tranquility and equanimity, with little or nothing to overcome.',
      'With repetition, these qualities start to persist outside meditation. Daily life gets the same steadiness: you meet events with joy and equanimity rather than reactivity.',
      'This is the culmination of calm-abiding (shamatha) training. The unified, stable mind is an ideal foundation for insight practice.',
    ],
    techniques: [
      {
        id: 'abide',
        name: 'Abiding',
        oneLine: 'Sit, and let the mind settle into its natural state.',
        steps: ['Sit as usual.', 'Let everything settle.', 'Rest.'],
        why: 'The work has been done. Repetition consolidates it.',
        visual: 'still',
      },
    ],
    tips: ['Use this stable mind for insight practice.', 'Notice how equanimity shows up in daily interactions.'],
    pitfalls: ['Complacency: stopping practice altogether'],
    signs: ['Sits are reliably joyful and tranquil'],
    heroVisual: 'still',
  },
];

export const stageByN = (n: number) => STAGES[Math.min(10, Math.max(1, n)) - 1];
