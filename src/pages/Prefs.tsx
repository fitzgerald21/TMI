import { useEffect, useState } from 'react';
import { setState, updateSettings, useStore } from '../lib/store';
import { bell, setVolume, unlockAudio } from '../lib/audio';
import { SAMPLE_LINE } from '../session/script';
import { configureVoice, isRecordedVoice, listVoices, primeVoice, RECORDED_VOICES, recordedVoiceName, speak, voiceSupported } from '../lib/voice';

export function Prefs() {
  const s = useStore((x) => x.settings);
  const count = useStore((x) => x.sessions.length);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const load = () => setVoices(listVoices());
    load();
    if (voiceSupported()) speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => { if (voiceSupported()) speechSynthesis.removeEventListener?.('voiceschanged', load); };
  }, []);

  const testVoice = () => {
    unlockAudio();
    primeVoice();
    configureVoice({ name: s.voiceName, rate: s.voiceRate, enabled: true });
    speak(SAMPLE_LINE, { interrupt: true });
  };

  return (
    <div className="page prefs">
      <h1 className="display xl">Preferences</h1>

      <section className="pref-group">
        <h2>Voice guidance</h2>
        <label className="toggle">
          <input id="pf-voice" type="checkbox" checked={s.voice} onChange={(e) => updateSettings({ voice: e.target.checked })} />
          <span>Spoken guidance</span>
        </label>
        <label className="field" htmlFor="pf-voice-name">
          <span className="k">Voice</span>
          <select id="pf-voice-name" value={s.voiceName || recordedVoiceName(RECORDED_VOICES[0]?.id ?? '')} onChange={(e) => updateSettings({ voiceName: e.target.value })}>
            {RECORDED_VOICES.length > 0 && (
              <optgroup label="Lantern voices (recorded, work in silent mode)">
                {RECORDED_VOICES.map((v) => <option key={v.id} value={recordedVoiceName(v.id)}>{v.label}</option>)}
              </optgroup>
            )}
            {voices.length > 0 && (
              <optgroup label="Your device's voices">
                {voices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
              </optgroup>
            )}
          </select>
        </label>
        {!isRecordedVoice(s.voiceName) && (
          <label className="slider" htmlFor="pf-rate">
            <span>Pace <em>{s.voiceRate.toFixed(2)}×</em></span>
            <input id="pf-rate" type="range" min={0.6} max={1.1} step={0.02} value={s.voiceRate} onChange={(e) => updateSettings({ voiceRate: +e.target.value })} />
          </label>
        )}
        <button className="btn small" onClick={testVoice}>Hear a sample</button>
        <p className="muted small">
          {isRecordedVoice(s.voiceName)
            ? 'Lantern voices are recorded with a neural voice and play even when your phone is on silent. They download once and then work offline.'
            : "Device voices come from your phone or computer. On iPhone they're muted by silent mode, and Settings → Accessibility → Spoken Content → Voices lets you download better ones."}
        </p>
      </section>

      <section className="pref-group">
        <h2>Bells & feedback</h2>
        <label className="toggle">
          <input id="pf-bells" type="checkbox" checked={s.bells} onChange={(e) => updateSettings({ bells: e.target.checked })} />
          <span>Bells and chimes</span>
        </label>
        <label className="slider" htmlFor="pf-vol">
          <span>Bell volume <em>{Math.round(s.bellVolume * 100)}%</em></span>
          <input id="pf-vol" type="range" min={0.1} max={1} step={0.05} value={s.bellVolume} onChange={(e) => { updateSettings({ bellVolume: +e.target.value }); setVolume(+e.target.value); }} />
        </label>
        <button className="btn small" onClick={() => { unlockAudio(); setVolume(s.bellVolume); bell(); }}>Strike the bell</button>
        <label className="toggle">
          <input id="pf-haptics" type="checkbox" checked={s.haptics} onChange={(e) => updateSettings({ haptics: e.target.checked })} />
          <span>Gentle vibration on taps (where supported)</span>
        </label>
      </section>

      <section className="pref-group">
        <h2>Sits</h2>
        <label className="toggle">
          <input id="pf-prep" type="checkbox" checked={s.prep} onChange={(e) => updateSettings({ prep: e.target.checked })} />
          <span>Begin guided sits with the six preparation steps</span>
        </label>
        <label className="toggle">
          <input id="pf-dim" type="checkbox" checked={s.dim} onChange={(e) => updateSettings({ dim: e.target.checked })} />
          <span>Fade the controls after a few seconds (tap to bring them back)</span>
        </label>
      </section>

      <section className="pref-group">
        <h2>Your data</h2>
        <p className="muted small">Everything stays on this device, in this browser. {count} sits recorded.</p>
        {confirm ? (
          <div className="row">
            <span>Erase all sits and settings?</span>
            <button className="btn small danger" onClick={() => { setState({ sessions: [], stage: 1, onboarded: false }); setConfirm(false); }}>Erase</button>
            <button className="btn small ghost" onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn small ghost" onClick={() => setConfirm(true)}>Erase all data…</button>
        )}
      </section>

      <section className="pref-group">
        <h2>Tips for sitting with Lantern</h2>
        <ul className="bullets">
          <li>Keep the phone face-up nearby. The screen stays awake during a sit and dims itself.</li>
          <li>Eyes closed is fine. Voice and bells carry the guidance.</li>
          <li>Space bar = "Aha!" and P = pause, if you're on a keyboard.</li>
          <li>Add Lantern to your home screen to use it like an app.</li>
        </ul>
      </section>
    </div>
  );
}
