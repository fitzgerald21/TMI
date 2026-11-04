// Reference material: hindrances, factors of awakening, glossary.
// Paraphrased summaries for study.

export const HINDRANCES = [
  {
    name: 'Sensual desire',
    feels: 'Wanting something pleasant: food, comfort, entertainment, a better feeling.',
    antidote: 'Notice the wanting itself as an experience. Recall that it passes. The joy of a settled mind is a better pleasure.',
  },
  {
    name: 'Aversion',
    feels: 'Irritation, resentment, impatience, dislike of a sound, a sensation or the practice itself.',
    antidote: 'Meet it with patience and kindness. Loving-kindness practice is a direct remedy.',
  },
  {
    name: 'Laziness and lethargy',
    feels: 'Heaviness, sleepiness, a reluctance to make any effort.',
    antidote: 'Raise energy: deep breaths, better posture, eyes slightly open, a reminder of your motivation.',
  },
  {
    name: 'Agitation from worry and remorse',
    feels: 'Restlessness, replaying past mistakes, anxious planning.',
    antidote: 'Calm the body, lengthen the exhale naturally, resolve to deal with it later, and act ethically in daily life.',
  },
  {
    name: 'Doubt',
    feels: '"Is this working? Am I doing it right? Is this practice for me?"',
    antidote: 'Recognize doubt as a passing mental state. Look at the progress you have made. Learn more and trust the process.',
  },
];

export const FACTORS = [
  { name: 'Mindfulness', text: 'Attention and peripheral awareness working together at full power.' },
  { name: 'Investigation', text: 'Curious, discerning examination of experience.' },
  { name: 'Diligence', text: 'Energetic, persistent effort applied with balance.' },
  { name: 'Joy', text: 'The uplifting pleasure of a unified mind.' },
  { name: 'Tranquility', text: 'Calm in body and mind, free of agitation.' },
  { name: 'Concentration', text: 'Stable attention, settled on its object.' },
  { name: 'Equanimity', text: 'Balance that doesn\'t grasp the pleasant or push away the unpleasant.' },
];

export const PREP_STEPS = [
  {
    key: 'motivation',
    title: 'Motivation',
    prompt: 'Why are you sitting today?',
    hint: 'Pick one, or write your own. A felt reason works better than a vague one.',
    options: ['To be calmer and kinder', 'To understand my own mind', 'To suffer less', 'To keep my commitment', 'For the people I love'],
  },
  {
    key: 'goal',
    title: 'Goal',
    prompt: 'One modest goal for this sit.',
    hint: 'Specific and achievable. Something you can actually do.',
    options: [],
  },
  {
    key: 'expectations',
    title: 'Expectations',
    prompt: 'Let go of how this sit "should" go.',
    hint: 'Hold the button, then release it, and let the expectations go with it.',
    options: [],
  },
  {
    key: 'diligence',
    title: 'Diligence',
    prompt: 'Commit to the full time.',
    hint: 'However it goes, you\'ll sit until the closing bell.',
    options: [],
  },
  {
    key: 'distractions',
    title: 'Distractions',
    prompt: 'What\'s on your mind?',
    hint: 'Name each thing, then set it aside. It will be here when you\'re done.',
    options: [],
  },
  {
    key: 'posture',
    title: 'Posture',
    prompt: 'Settle into the body.',
    hint: 'Tap each as you adjust it.',
    options: ['Spine upright but not rigid', 'Shoulders soft and dropped', 'Hands resting comfortably', 'Jaw and face relaxed', 'Eyes closed or softly lowered'],
  },
];

export const GLOSSARY: { term: string; def: string }[] = [
  { term: 'Attention', def: 'The mind\'s spotlight. It singles out one thing from the field of experience and analyzes it.' },
  { term: 'Peripheral awareness', def: 'The wide, open, background knowing of everything else going on, both outside (sounds, sensations) and inside (thoughts, moods).' },
  { term: 'Mindfulness', def: 'Attention and peripheral awareness working together in the best way. It grows as the total amount of conscious perception grows.' },
  { term: 'Introspective awareness', def: 'Peripheral awareness turned toward the mind itself: noticing what the mind is doing.' },
  { term: 'Forgetting', def: 'Losing the meditation object completely. It always comes before mind-wandering.' },
  { term: 'Mind-wandering', def: 'Attention goes off after a distraction while the breath is forgotten.' },
  { term: 'Gross distraction', def: 'A distraction takes over attention and pushes the breath into the background, though not out of experience entirely.' },
  { term: 'Subtle distraction', def: 'Competing objects in the background that attention keeps briefly alternating to, while the breath stays in the foreground.' },
  { term: 'Strong dullness', def: 'Heavy dullness. The breath blurs, distorts or fades, dreamlike images arise, and sleep is close.' },
  { term: 'Subtle dullness', def: 'A pleasant, stable, slightly hazy state where the vividness of perception quietly drops.' },
  { term: 'Checking in', def: 'Deliberately glancing inward with introspective awareness to see what the mind is doing.' },
  { term: 'Labeling', def: 'Silently naming a distraction ("hearing", "planning") to recognize it clearly without engaging.' },
  { term: 'Exclusive attention', def: 'Attention rests on the chosen object alone, with no alternating to other objects.' },
  { term: 'Metacognitive awareness', def: 'Awareness of the state and activity of the mind itself, not just its contents.' },
  { term: 'Unification', def: 'The many sub-minds coming to share a single intention, so the mind works as a whole.' },
  { term: 'Pliancy', def: 'Mental and physical malleability and ease. The mind and body go where you intend without resistance.' },
  { term: 'Meditative joy', def: 'Pleasure, happiness and energy that arise naturally from a unified mind.' },
  { term: 'Shamatha', def: 'Calm abiding: a mind that is stable, clear, joyful, tranquil and equanimous.' },
  { term: 'Vipassana', def: 'Insight: clear seeing into the nature of experience.' },
  { term: 'Moment of consciousness', def: 'A model in which experience is a rapid sequence of discrete mind-moments, each seeing, hearing, feeling, thinking, or nothing at all.' },
];

export const QUOTES_OWN = [
  'Every time you notice you\'ve wandered, you are already back.',
  'Intention, not effort. Set the direction and let the mind learn.',
  'Attention is the spotlight. Awareness is the lantern.',
  'There are no bad sits, only sits you\'ve finished.',
  'Come back the way you\'d call back a puppy: warmly, every time.',
  'Notice first, correct gently.',
  'The breath is always here. You only have to come back to it.',
  'A clear mind isn\'t forced. It\'s trained by repetition.',
];
