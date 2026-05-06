export default function StatCard({ label, value, type, valueStyle }) {
  return (
    <div className={`stat-card${type ? ` stat-${type}` : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={valueStyle}>{value}</span>
    </div>
  );
}