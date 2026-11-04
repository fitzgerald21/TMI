// Turns the single-file build into a body-only page (the hosting skeleton adds <html>/<head>/<body>).
import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync('dist-single/index.html', 'utf8');
const head = src.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = src.match(/<body>([\s\S]*?)<\/body>/)[1];
const keep = head
  .split('\n')
  .filter((l) => !/rel="(manifest|icon|apple-touch-icon)"|<meta charset|name="viewport"/.test(l))
  .join('\n');
const out = `<title>Lantern</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${keep.replace(/<title>.*?<\/title>/, '')}\n${body}`;
writeFileSync(process.argv[2] || 'dist-single/lantern.html', out);
console.log('wrote', (out.length / 1024).toFixed(0), 'KB');
