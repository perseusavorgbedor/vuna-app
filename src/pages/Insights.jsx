import { useVuna } from '../context';
import { buildInsights } from '../utils/insights';
import { monthLabel } from '../utils/storage';

const MARK = { warn: '⚠️', good: '🌱', info: '✦' };

export default function Insights() {
  const { data, viewMonth } = useVuna();
  const list = buildInsights(data, viewMonth);
  return (
    <>
      <div className="page-head">
        <div><h1>Insights</h1><p className="muted">What Vuna noticed in {monthLabel(viewMonth)}.</p></div>
      </div>
      <div className="stack">
        {list.map(i => (
          <section key={i.id} className={`card insight insight-${i.tone}`}>
            <p className="insight-kicker">{MARK[i.tone]} {i.tone === 'warn' ? 'Heads up' : i.tone === 'good' ? 'Good news' : 'Note'}</p>
            <h3>{i.title}</h3>
            <p>{i.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
