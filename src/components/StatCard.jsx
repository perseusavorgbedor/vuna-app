export default function StatCard({ label, sub, value, note, tone, delta, icon }) {
  // delta: { pct, goodWhenDown } — null/undefined hides it
  let deltaEl = null;
  if (delta && delta.pct !== null && delta.pct !== undefined && isFinite(delta.pct)) {
    const up = delta.pct >= 0;
    const good = delta.goodWhenDown ? !up : up;
    deltaEl = (
      <span className={`delta ${good ? 'delta-good' : 'delta-bad'}`}>
        {up ? '↑' : '↓'} {Math.abs(delta.pct).toFixed(1)}% <span className="delta-vs">{delta.vs}</span>
      </span>
    );
  }
  return (
    <div className={`stat ${tone ? 'stat-' + tone : ''}`}>
      <div className="stat-top">
        <span className="stat-label">{label}{sub && <span className="stat-sub"> · {sub}</span>}</span>
        {icon && <span className={`stat-icon stat-icon-${tone || 'plain'}`}>{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {deltaEl}
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}
