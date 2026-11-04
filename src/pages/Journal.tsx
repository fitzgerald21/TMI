import { useState } from 'react';
import { deleteSession, dayKey, minutesByDay, streak, useStore } from '../lib/store';
import { SCMap } from '../components/SCMap';
import { go } from '../lib/router';

export function Journal() {
  const sessions = useStore((s) => s.sessions);
  const [open, setOpen] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  if (!sessions.length) {
    return (
      <div className="page journal">
        <h1 className="display xl">Journal</h1>
        <div className="empty">
          <p className="lede">Your sits will appear here: a calendar of practice, your "aha!" moments, and where each sit landed between distraction and dullness.</p>
          <button className="btn primary" onClick={() => go('practice')}>Do your first sit</button>
        </div>
      </div>
    );
  }

  const total = sessions.reduce((a, s) => a + s.minutes, 0);
  const str = streak(sessions);
  const byDay = minutesByDay(sessions);
  const rated = sessions.filter((s) => s.stability && s.clarity).slice(0, 30);
  const recent = sessions.slice(0, 20).reverse();
  const maxAha = Math.max(1, ...recent.map((s) => s.aha));

  // heatmap: last 15 weeks, ending this week
  const weeks = 15;
  const end = new Date();
  end.setDate(end.getDate() + (6 - end.getDay()));
  const cells: { k: string; m: number; future: boolean; d: Date }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    cells.push({ k: dayKey(d), m: byDay.get(dayKey(d)) || 0, future: d > new Date(), d });
  }

  return (
    <div className="page journal">
      <h1 className="display xl">Journal</h1>
      <section className="j-stats">
        <div className="stat"><span className="stat-n tabnum">{str}</span><span className="stat-l">day streak</span></div>
        <div className="stat"><span className="stat-n tabnum">{sessions.length}</span><span className="stat-l">sits</span></div>
        <div className="stat"><span className="stat-n tabnum">{total >= 120 ? (total / 60).toFixed(1) : Math.round(total)}</span><span className="stat-l">{total >= 120 ? 'hours' : 'minutes'} total</span></div>
        <div className="stat"><span className="stat-n tabnum">{sessions.reduce((a, s) => a + s.aha, 0)}</span><span className="stat-l">"aha!" moments</span></div>
      </section>

      <section className="j-grid">
        <div className="j-card">
          <h3>Practice calendar</h3>
          <div className="heat" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }} role="img" aria-label="Minutes practiced per day, last 15 weeks">
            {Array.from({ length: weeks }).map((_, w) => (
              <div className="heat-col" key={w}>
                {cells.slice(w * 7, w * 7 + 7).map((c) => (
                  <span
                    key={c.k}
                    className={`heat-cell ${c.future ? 'future' : ''}`}
                    title={`${c.d.toDateString()}: ${Math.round(c.m)} min`}
                    style={{ ['--v' as string]: c.m ? Math.min(1, 0.25 + c.m / 45) : 0 }}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="muted small">Each square is a day. Brighter means more minutes.</p>
        </div>

        <div className="j-card">
          <h3>"Aha!" per sit</h3>
          <div className="aha-chart" role="img" aria-label="Aha moments in recent sits">
            {recent.map((s) => (
              <span key={s.id} title={`${new Date(s.date).toLocaleDateString()}: ${s.aha}`}>
                <i style={{ height: `${(s.aha / maxAha) * 100}%` }} />
              </span>
            ))}
          </div>
          <p className="muted small">More "aha!" moments early on is a good sign: you're noticing. Over time, wandering gets shorter.</p>
        </div>

        <div className="j-card">
          <h3>Stability × clarity</h3>
          {rated.length ? (
            <SCMap points={rated.map((s, i) => ({ s: s.stability!, c: s.clarity!, id: s.id, hi: i === 0, age: i / Math.max(1, rated.length - 1) }))} />
          ) : (
            <p className="muted">Rate your sits in the review after each session and they'll appear on this map.</p>
          )}
          <p className="muted small">The latest sit is the large dot. Over months, the cloud should drift up and to the right.</p>
        </div>
      </section>

      <section>
        <h2 className="display">Sits</h2>
        <ul className="j-list">
          {sessions.map((s) => {
            const d = new Date(s.date);
            const isOpen = open === s.id;
            const lbl = Object.entries(s.labels).sort((a, b) => b[1] - a[1]);
            return (
              <li key={s.id} className={isOpen ? 'open' : ''}>
                <button className="j-row" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}>
                  <span className="j-date">
                    <b>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</b>
                    <span className="muted small">{d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                  </span>
                  <span className="j-title">
                    {s.title}
                    {!s.completed && <span className="pill warn">ended early</span>}
                  </span>
                  <span className="j-meta tabnum">
                    <span>{s.minutes} min</span>
                    <span className="gold">{s.aha} aha</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="j-detail">
                    {s.goal && <p><span className="k">Goal</span>{s.goal}</p>}
                    {s.motivation && <p><span className="k">Motivation</span>{s.motivation}</p>}
                    {(s.stability || s.clarity) && <p><span className="k">Rated</span>stability {s.stability ?? '–'}/5 · clarity {s.clarity ?? '–'}/5</p>}
                    {lbl.length > 0 && <p><span className="k">Labels</span>{lbl.map(([k, v]) => `${k} ×${v}`).join(', ')}</p>}
                    {s.breath && <p><span className="k">Breath</span>{s.breath.count} breaths traced · in {s.breath.inAvg}s / out {s.breath.outAvg || '–'}s</p>}
                    {s.dullness > 0 && <p><span className="k">Dullness caught</span>{s.dullness}×</p>}
                    {s.notes && <p className="j-notes">{s.notes}</p>}
                    {confirmDel === s.id ? (
                      <div className="row">
                        <span className="muted small">Delete this sit?</span>
                        <button className="btn small danger" onClick={() => deleteSession(s.id)}>Delete</button>
                        <button className="btn small ghost" onClick={() => setConfirmDel(null)}>Keep</button>
                      </div>
                    ) : (
                      <button className="btn small ghost" onClick={() => setConfirmDel(s.id)}>Delete</button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
