// Lists every line the app can speak. Run via `npm run voice:lines` (bundled with esbuild).
import { writeFileSync } from 'node:fs';
import { buildDrill, buildGuided, buildMetta, buildTimer, buildWalking, DRILLS, SAMPLE_LINE, scriptLines, type Script } from '../../src/session/script';
import { lineKey, normalizeLine } from '../../src/lib/voiceKey';

const scripts: Script[] = [];
const MINUTES = [5, 10, 15, 20, 25, 30, 40, 45, 60];
for (let st = 1; st <= 10; st++) for (const m of MINUTES) scripts.push(buildGuided(st, m));
for (const d of DRILLS) scripts.push(buildDrill(d.id));
for (const m of MINUTES) scripts.push(buildWalking(m), buildMetta(m), buildTimer(m, 5));

const lines = new Map<string, string>();
const add = (t: string) => {
  const k = lineKey(t);
  const prev = lines.get(k);
  if (prev && prev !== normalizeLine(t)) throw new Error(`Key collision: "${prev}" vs "${t}"`);
  lines.set(k, normalizeLine(t));
};
for (const s of scripts) for (const g of ['full', 'light'] as const) scriptLines(s, g).forEach(add);
add(SAMPLE_LINE);

const out = Object.fromEntries([...lines].sort());
writeFileSync(process.argv[2] || 'scripts/voice/lines.json', JSON.stringify(out, null, 1) + '\n');
const chars = [...lines.values()].reduce((a, t) => a + t.length, 0);
console.log(`${lines.size} lines, ${chars} characters`);
