#!/bin/sh
# Bundle and run the line collector.
set -e
npx esbuild scripts/voice/collect.ts --bundle --platform=node --format=esm --log-level=warning --outfile=node_modules/.cache/voice-collect.mjs
node node_modules/.cache/voice-collect.mjs scripts/voice/lines.json
