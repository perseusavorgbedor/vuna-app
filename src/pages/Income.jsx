import { useState } from 'react';
import { useVuna } from '../context';
import EntryRow from '../components/EntryRow';
import EntryModal from '../components/EntryModal';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import { sumMonth, pctChange, shiftMonth, fmtMoney, monthLabel } from '../utils/storage';

export default function Income() {
  const { data, viewMonth } = useVuna();
  const { currency: cur, rates } = data;
  const list = data.income;
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('All');

  const month = list.filter(e => e.date.startsWith(viewMonth));
  const groups = ['All', ...Array.from(new Set(month.map(e => e.source)))];
  const shown = (filter === 'All' ? month : month.filter(e => e.source === filter))
    .slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const total = sumMonth(list, viewMonth, cur, rates);
  const prev = sumMonth(list, shiftMonth(viewMonth, -1), cur, rates);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Income</h1>
          <p className="muted">Every payment, across every currency.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" /> Log payment</button>
      </div>

      <div className="grid-3">
        <StatCard label={monthLabel(viewMonth)} value={fmtMoney(total, cur)} tone="income"
          delta={{ pct: pctChange(total, prev), vs: 'vs last month' }} />
        <StatCard label="Entries" value={month.length} note="this month" />
      </div>

      <section className="card">
        {groups.length > 2 && (
          <div className="chips">
            {groups.map(g => <button key={g} className={filter === g ? 'on' : ''} onClick={() => setFilter(g)}>{g}</button>)}
          </div>
        )}
        {shown.length === 0 && <p className="empty">Nothing logged for {monthLabel(viewMonth)} yet.</p>}
        {shown.map(e => <EntryRow key={e.id} entry={e} type="income" />)}
      </section>

      {adding && <EntryModal type="income" onClose={() => setAdding(false)} />}
    </>
  );
}
