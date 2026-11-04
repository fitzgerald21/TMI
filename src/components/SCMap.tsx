// The stability × clarity map: where each sit landed between distraction and dullness.

export interface SCPoint {
  s: number; // stability 1-5
  c: number; // clarity 1-5
  id?: string;
  hi?: boolean;
  age?: number; // 0 newest .. 1 oldest
}

const REGIONS = [
  { x: 1.6, y: 1.5, t: 'Lost and drowsy' },
  { x: 1.6, y: 4.6, t: 'Bright but scattered' },
  { x: 4.3, y: 1.5, t: 'Stable but dull' },
  { x: 4.3, y: 4.6, t: 'Stable and vivid' },
];

export function SCMap({ points, onPick, compact }: { points: SCPoint[]; onPick?: (s: number, c: number) => void; compact?: boolean }) {
  const W = 320, H = 260, L = 44, R = 12, T = 12, B = 40;
  const x = (s: number) => L + ((s - 1) / 4) * (W - L - R);
  const y = (c: number) => T + (1 - (c - 1) / 4) * (H - T - B);
  return (
    <div className="scmap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Map of stability against clarity"
        onClick={(e) => {
          if (!onPick) return;
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const py = ((e.clientY - r.top) / r.height) * H;
          const s = Math.round(1 + ((px - L) / (W - L - R)) * 4);
          const c = Math.round(1 + (1 - (py - T) / (H - T - B)) * 4);
          onPick(Math.min(5, Math.max(1, s)), Math.min(5, Math.max(1, c)));
        }}
        style={{ cursor: onPick ? 'crosshair' : undefined }}
      >
        <defs>
          <linearGradient id="scgoal" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="url(#scgoal)" stroke="var(--line)" />
        {[2, 3, 4].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} stroke="var(--line)" strokeDasharray="2 4" />
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="2 4" />
          </g>
        ))}
        {!compact &&
          REGIONS.map((r) => (
            <text key={r.t} x={x(r.x)} y={y(r.y)} textAnchor="middle" className="scmap-region">
              {r.t}
            </text>
          ))}
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <text x={x(v)} y={H - B + 15} textAnchor="middle" className="scmap-tick">{v}</text>
            <text x={L - 10} y={y(v) + 4} textAnchor="end" className="scmap-tick">{v}</text>
          </g>
        ))}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="scmap-axis">Stability →</text>
        <text x={12} y={(T + H - B) / 2} textAnchor="middle" className="scmap-axis" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>
          Clarity →
        </text>
        {points.map((p, i) => {
          const jitter = p.hi ? 0 : ((i * 37) % 9) - 4;
          return (
            <circle
              key={p.id || i}
              cx={x(p.s) + jitter}
              cy={y(p.c) + (((i * 53) % 9) - 4) * (p.hi ? 0 : 1)}
              r={p.hi ? 8 : 4.5}
              fill={p.hi ? 'var(--accent)' : 'var(--aware)'}
              fillOpacity={p.hi ? 1 : 0.85 - (p.age ?? 0) * 0.6}
              stroke={p.hi ? 'var(--bg)' : 'none'}
              strokeWidth={2}
            />
          );
        })}
      </svg>
    </div>
  );
}
