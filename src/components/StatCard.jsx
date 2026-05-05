export default function StatCard({ label, value, type, style }) {
  return (
    <div className={`stat-card${type ? ` stat-${type}` : ''}`} style={style}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}