# Lantern

An interactive companion for practicing **The Mind Illuminated**, the ten-stage meditation method by Culadasa (John Yates, PhD), Matthew Immergut and Jeremy Graves.

> Attention is the spotlight. Awareness is the lantern.

Lantern is not a book in an app. Every technique has a live visual that shows you what to do while you do it, plus spoken guidance and singing-bowl bells, so it works with your eyes closed.

## What's inside

**The path.** All ten stages and four milestones on one map. Each stage page covers the goal, obstacles, skills and mastery criteria, a plain-language overview, the techniques with step-by-step instructions and the reason each one works, tips, pitfalls and "you're likely here if…".

**Guided sits.** Built for your stage and length (5–60 min):
- *Six preparation steps*, done interactively: pick a motivation, set a goal, hold a circle to let go of expectations, commit, set distractions aside, check your posture.
- *The four-step transition*: the camera narrows from open awareness (expanding rings, sense sparks) to the body, to the breath in the body, to a point of light at the nose.
- *Stage-specific practice*, with visuals and interactions:
  - **Aha!** button in every sit. Noticing you wandered makes the light bloom. That moment is the core habit of the early stages.
  - **Counting**: tap at the end of each out-breath and beads fill from 1 to 10. "Lost count" counts as an aha.
  - **Following / connecting**: hold the pad while breathing in and release to breathe out. Your real breath is drawn as a live trace with in/out markers, and connecting compares each breath with the last.
  - **Checking in**: soft pulses ripple out from the breath with a chime, and an "inner lookout" circles quietly.
  - **Labeling**: tap *Planning*, *Hearing*, … and the word drifts to the periphery and fades, staying in the background.
  - **Dullness remedies**: tap *Dull?* for a brightening flash and remedies.
  - **Body scan**: a band of light moves region by region, and the voice names each one.
  - **Whole-body breathing**: the whole figure glows, with a wave moving through it.
  - **Fine detail** (shimmering micro-sensations), **letting go of effort** (a jittery ring of vigilance that smooths out), **pacifying the senses** (aurora streams that calm), **calming joy** (ripples that slow), **abiding** (a single still point).
- *Mindful review* afterwards: aha count, what pulled at attention, breath stats, stability and clarity ratings plotted on a map, and notes.

**Technique drills.** Short 5–8 minute sits that isolate one skill.

**Other practices.** Walking meditation (animated lift / move / place and six-part steps), loving-kindness (warmth that reaches more beings circle by circle), and a silent timer with interval chimes.

**Learn.** Four interactive explainers:
- *Attention & awareness*: a live simulation. Turn peripheral awareness down and distractions hijack the spotlight; turn it up and they get noticed and released in the periphery.
- *Distraction & dullness*: every early obstacle on one stability × clarity map, with the path through it.
- *Moments of consciousness*: a stream of mind-moments. Sliders for dullness, distraction and introspective awareness, with a live "mindfulness power" meter.
- *The mind system*: sub-minds bidding for the stage of consciousness, and what unification does.

Plus the "aha!" principle, preparation and transition, the five hindrances with antidotes, the seven factors of awakening, and a glossary.

**Journal.** Streak, practice calendar, aha trend, your sits plotted on the stability × clarity map, and per-sit notes. Data stays on your device (localStorage).

**Find your stage.** A short quiz that walks through each stage's mastery criterion.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/ (installable PWA, works offline)
npm run build:single # one self-contained HTML file in dist-single/
```

Deploy `dist/` to any static host (GitHub Pages, Netlify, Vercel). On a phone, use "Add to Home Screen" to run it like an app. The screen stays awake during sits.

## Structure

```
src/
  content/     stages.ts (10 stages, milestones, techniques), concepts.ts (hindrances, factors, glossary, prep steps)
  session/     script.ts (builds timed sits, drills, walking, metta, timer), Session.tsx (player engine + controls),
               Prep.tsx (six preparation steps), Review.tsx (mindful review)
  visual/      scene.ts (procedural canvas renderer: seated figure, camera and every visual mode), SceneCanvas.tsx
  learn/       interactive explainers
  pages/       Home (path), StagePage, Practice, Learn, Journal, Finder, Prefs, Welcome
  lib/         store (localStorage), audio (synthesized bells), voice (Web Speech), router (hash routes)
```

No audio files and no images: the bells are synthesized with Web Audio, the voice uses the device's speech engine, and every visual is drawn procedurally on canvas.

## A note on the source

Lantern is an unofficial study companion. All summaries are paraphrased in original words. To understand the method properly, read *The Mind Illuminated*.
