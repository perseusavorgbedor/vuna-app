import { fmt } from '../utils/storage';

export default function EntryItem({ entry, type, onDelete }) {
  return (
    <div className="entry-item">
      <div className={`entry-dot dot-${type}`}></div>
      <div className="entry-info">
        <div className="entry-desc">
          {entry.description || entry.source || entry.category || '—'}
        </div>
        <div className="entry-meta">
          {entry.date} · {type === 'income' ? entry.source : entry.category}
        </div>
      </div>
      <span className={`entry-amount amt-${type}`}>
        {type === 'income' ? '+' : '-'}{fmt(entry.amount, entry.currency)}
      </span>
      <div className="entry-actions">
        <button
          className="icon-btn"
          onClick={() => onDelete(entry.id)}
          title="Delete"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
