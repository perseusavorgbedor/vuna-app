import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVuna } from '../context';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import QuickLog from '../components/QuickLog';
import EntryRow from '../components/EntryRow';
import EntryModal from '../components/EntryModal';
import Icon from '../components/Icon';
import { buildInsights } from '../utils/insights';
import {
  sumMonth, pctChange, shiftMonth, monthShort, monthLabel, fmtMoney, greeting, categoryTotals, CAT_EMOJI,
} from '../utils/storage';

export default function Overview() {
  const { data, viewMonth } = useVuna();
  const { income, expenses, currency: cur, rates, profile } = data;
  const [adding, setAdding] = useState(false);
  const prev = shiftMonth(viewMonth, -1);

  const inc = sumMonth(income, viewMonth, cur, rates);
  const exp = sumMonth(expenses, viewMonth, cur, rates);
  const incPrev = sumMonth(income, prev, cur, rates);
  const expPrev = sumMonth(expenses, prev, cur, rates);
  const net = inc - exp;
  const rate = inc > 0 ? Math.round((net / inc) * 100) : null;

  const series = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(viewMonth, i - 5));
    return {
      labels: months.map(monthShort),
      income: months.map(m => sumMonth(income, m, cur, rates)),
      expenses: months.map(m => sumMonth(expenses, m, cur, rates)),
    };
  }, [income, expenses, viewMonth, cur, rates]);

  const insight = buildInsights(data, viewMonth)[0];
  const cats = Object.entries(categoryTotals(expenses, viewMonth, cur, rates)).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const recent = [
    ...income.map(e => ({ e, type: 'income' })),
    ...expenses.map(e => ({ e, type: 'expense' })),
  ].sort((a, b) => b.e.date.localeCompare(a.e.date) || b.e.id.localeCompare(a.e.id)).slice(0, 6);

  const first = (profile.name || '').trim().split(/\s+/)[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{greeting()}{first ? `, ${first}` : ''}</h1>
          <p className="muted">Here's how {monthLabel(viewMonth)} is shaping up.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" /> Log entry</button>
      </div>

      <div className="grid-3">
        <StatCard label="Income" tone="income" icon="↗" value={fmtMoney(inc, cur)}
          delta={{ pct: pctChange(inc, incPrev), vs: 'vs last month' }} note="approximate, converted" />
        <StatCard label="Expenses" tone="expense" icon="↘" value={fmtMoney(exp, cur)}
          delta={{ pct: pctChange(exp, expPrev), goodWhenDown: true, vs: 'vs last month' }} />
        <StatCard label="Net" value={`${net < 0 ? '−' : ''}${fmtMoney(Math.abs(net), cur)}`}
          note={rate === null ? 'No income logged yet' : `${rate}% of income kept`} />
      </div>

      <div className="grid-main">
        <section className="card">
          <div className="card-head">
            <h2>Cash flow</h2>
            <div className="legend"><span className="dot dot-in" />Income <span className="dot dot-out" />Expenses</div>
          </div>
          <LineChart {...series} />
        </section>

        <aside className="stack">
          {insight && (
            <section className={`card insight insight-${insight.tone}`}>
              <p className="insight-kicker">✦ Insight</p>
              <h3>{insight.title}</h3>
              <p>{insight.body}</p>
              <Link to="/insights" className="link">All insights →</Link>
            </section>
          )}
          <section className="card">
            <div className="card-head"><h2>Top spending</h2></div>
            {cats.length === 0 && <p className="muted small">Nothing spent this month.</p>}
            {cats.map(([c, v]) => (
              <div className="cat" key={c}>
                <span>{CAT_EMOJI[c] || '✳️'} {c}</span>
                <span className="cat-bar"><span style={{ width: `${Math.min(100, (v / (cats[0][1] || 1)) * 100)}%` }} /></span>
                <strong>{fmtMoney(v, cur)}</strong>
              </div>
            ))}
          </section>
        </aside>
      </div>

      <QuickLog />

      <section className="card">
        <div className="card-head"><h2>Recent activity</h2></div>
        {recent.length === 0 && <p className="empty">No entries yet. Use Quick log above to add your first.</p>}
        {recent.map(({ e, type }) => <EntryRow key={type + e.id} entry={e} type={type} />)}
      </section>

      {adding && <EntryModal allowSwitch onClose={() => setAdding(false)} />}
    </>
  );
}
