"""Record every spoken line with Kokoro (open-source neural TTS) into public/voice/<voice>/<key>.mp3.

Setup (once):
  python3 -m venv .tts && .tts/bin/pip install kokoro-onnx soundfile
  download kokoro-v1.0.onnx and voices-v1.0.bin from
  https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into $KOKORO_DIR
Run:
  npm run voice:lines && KOKORO_DIR=... .tts/bin/python scripts/voice/generate.py
Only missing clips are generated, so re-running after editing a few lines is quick.
"""
import json, os, re, subprocess, sys
import numpy as np
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.tts/models"))
VOICES = {  # id: (kokoro voice, language, speed)
    "heart": ("af_heart", "en-us", 0.86),
    "emma": ("bf_emma", "en-gb", 0.88),
    "michael": ("am_michael", "en-us", 0.88),
}
SR = 24000
SENTENCE_GAP = 0.75  # seconds of silence between sentences: unhurried, meditative pacing


def sentences(text):
    return [s for s in re.split(r"(?<=[.!?…])\s+", text) if s.strip()]


def trim(x, thresh=0.004):
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x
    a, b = max(0, idx[0] - int(0.03 * SR)), min(len(x), idx[-1] + int(0.08 * SR))
    return x[a:b]


def main():
    lines = json.load(open(os.path.join(ROOT, "scripts/voice/lines.json")))
    k = Kokoro(os.path.join(MODEL_DIR, "kokoro-v1.0.onnx"), os.path.join(MODEL_DIR, "voices-v1.0.bin"))
    index_path = os.path.join(ROOT, "src/content/voiceClips.json")
    index = json.load(open(index_path)) if os.path.exists(index_path) else {}
    clips = {}
    for vid, (voice, lang, speed) in VOICES.items():
        out_dir = os.path.join(ROOT, "public/voice", vid)
        os.makedirs(out_dir, exist_ok=True)
        for n, (key, text) in enumerate(lines.items()):
            path = os.path.join(out_dir, key + ".mp3")
            if os.path.exists(path) and key in index.get("clips", {}):
                clips[key] = index["clips"][key]
                continue
            parts = []
            for s in sentences(text):
                audio, sr = k.create(s, voice=voice, speed=speed, lang=lang)
                parts += [trim(np.asarray(audio, dtype=np.float32)), np.zeros(int(SENTENCE_GAP * SR), np.float32)]
            pcm = np.concatenate(parts[:-1])
            pcm = pcm / max(1e-6, np.abs(pcm).max()) * 0.89  # consistent loudness across clips
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                 "-c:a", "libmp3lame", "-b:a", "48k", path],
                input=pcm.tobytes(), check=True,
            )
            clips[key] = max(clips.get(key, 0), round(len(pcm) / SR, 2))
            print(f"{vid} {n + 1}/{len(lines)} {key} {text[:50]}", file=sys.stderr)
    # Drop clips for lines that no longer exist.
    for vid in VOICES:
        d = os.path.join(ROOT, "public/voice", vid)
        for f in os.listdir(d):
            if f[:-4] not in lines:
                os.remove(os.path.join(d, f))
    json.dump({"voices": list(VOICES), "clips": {k: clips[k] for k in sorted(lines)}}, open(index_path, "w"), indent=1)
    print(f"{len(lines)} lines x {len(VOICES)} voices")


if __name__ == "__main__":
    main()
