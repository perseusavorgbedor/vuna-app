import { useId } from 'react';

const W = 600, H = 200, PAD = 14;

function smooth(pts, lo, hi) {
  if (pts.length < 2) return '';
  const clamp = v => Math.min(hi, Math.max(lo, v));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* labels: string[]; income / expenses: number[] (same length) */
export default function LineChart({ labels, income, expenses }) {
  const gid = useId().replace(/:/g, '');
  const max = Math.max(...income, ...expenses, 1);
  const lo = PAD, hi = H - PAD;
  const n = labels.length;
  const toPts = vals => vals.map((v, i) => [(i / (n - 1)) * W, hi - (v / max) * (hi - lo)]);
  const inPts = toPts(income), exPts = toPts(expenses);
  const hasData = income.some(v => v > 0) || expenses.some(v => v > 0);

  if (!hasData) {
    return <div className="chart-empty">Your cash flow will draw itself here once you log a few entries.</div>;
  }

  const inLine = smooth(inPts, lo, hi);
  const exLine = smooth(exPts, lo, hi);
  const last = inPts[n - 1];

  return (
    <div className="chart">
      <div className="chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
          aria-label="Income and expenses over the last six months">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.22 }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1="0" x2={W} y1={lo + f * (hi - lo)} y2={lo + f * (hi - lo)}
              stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${inLine} L${W},${H} L0,${H} Z`} fill={`url(#${gid})`} />
          <path d={exLine} fill="none" stroke="var(--warm)" strokeWidth="2.5"
            strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={inLine} fill="none" stroke="var(--accent)" strokeWidth="2.5"
            strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="chart-dot" style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%` }} />
      </div>
      <div className="chart-labels">
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}
