import { useMemo } from 'react';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import EntryItem from '../components/EntryItem';
import {
  fmt, thisMonth, lastMonth, monthKey,
  totalAllCurrencies,
} from '../utils/storage';

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function getInsight(earned, spent, net, rate, lastEarned) {
  if (earned === 0 && spent === 0)
    return 'Welcome to Vuna. Start by logging your first income or expense to see insights here.';

  const lines = [];

  if (earned === 0)
    lines.push('No income logged this month yet — remember to log every payment you receive.');
  else if (rate < 0)
    lines.push(`You are spending more than you earn this month. You are ${Math.abs(net).toFixed(2)} in the red — cut non-essential spending now.`);
  else if (rate < 20)
    lines.push(`Your savings rate is ${rate}%. Try to hit at least 20% to build a buffer for slow months.`);
  else
    lines.push(`Strong month — you are saving ${rate}% of what you earn. Keep it up.`);

  if (lastEarned > 0 && earned < lastEarned * 0.7)
    lines.push(` Income is down ${Math.round(((lastEarned - earned) / lastEarned) * 100)}% from last month. This could be a dry season — reduce spending where you can.`);
  else if (lastEarned > 0 && earned > lastEarned * 1.2)
    lines.push(` Income is up ${Math.round(((earned - lastEarned) / lastEarned) * 100)}% from last month. Great work — consider putting the extra toward a savings goal.`);

  return lines.join('');
}

function getSeasonBadge(earned, lastEarned) {
  const now = new Date();
  const label = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  if (lastEarned > 0 && earned < lastEarned * 0.7)
    return { label: '⚠ Dry season warning', color: 'var(--amber)' };
  if (lastEarned > 0 && earned > lastEarned * 1.2)
    return { label: '↑ Strong month', color: 'var(--green)' };
  return { label, color: 'var(--text3)' };
}

export default function Dashboard({ data, onDelete }) {
  const { income, expenses, currency } = data;
  const tm = thisMonth();
  const lm = lastMonth();

  const earned = totalAllCurrencies(income, tm);
  const spent = totalAllCurrencies(expenses, tm);
  const net = earned - spent;
  const rate = earned > 0 ? Math.round((net / earned) * 100) : 0;
  const lastEarned = totalAllCurrencies(income, lm);

  const insight = useMemo(
    () => getInsight(earned, spent, net, rate, lastEarned),
    [earned, spent, net, rate, lastEarned]
  );

  const badge = getSeasonBadge(earned, lastEarned);

  // spend breakdown by category (this month)
  const breakdown = useMemo(() => {
    const cats = {};
    expenses
      .filter(e => monthKey(e.date) === tm)
      .forEach(e => { cats[e.category] = (cats[e.category] || 0) + Number(e.amount); });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expenses, tm]);

  const maxCat = breakdown[0]?.[1] || 1;

  // recent activity (last 8 entries combined)
  const recent = useMemo(() => {
    return [
      ...income.map(e => ({ ...e, type: 'income' })),
      ...expenses.map(e => ({ ...e, type: 'expense' })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  }, [income, expenses]);

  const now = new Date();

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        </div>
        <div className="season-badge" style={{ borderColor: badge.color, color: badge.color }}>
          {badge.label}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-row">
        <StatCard label="Total Earned" value={fmt(earned, currency)} type="income" />
        <StatCard label="Total Spent" value={fmt(spent, currency)} type="expense" />
        <StatCard
          label="Net Balance"
          value={fmt(net, currency)}
          type="net"
          style={{ '--stat-val-color': net >= 0 ? 'var(--green)' : 'var(--red)' }}
        />
        <StatCard
          label="Savings Rate"
          value={`${rate}%`}
          type="rate"
        />
      </div>

      {/* Chart + Insight */}
      <div className="dash-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Income vs Expenses</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Last 6 months</span>
          </div>
          <BarChart income={income} expenses={expenses} />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Vuna Insight</h2>
          </div>
          <div className="insight-box">
            <p className="insight-text">{insight}</p>
          </div>

          {breakdown.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
                Top spending this month
              </p>
              <div className="spend-breakdown">
                {breakdown.map(([cat, total]) => (
                  <div className="breakdown-row" key={cat}>
                    <span className="breakdown-cat">{cat.split(' ')[0]}</span>
                    <div className="breakdown-bar-wrap">
                      <div
                        className="breakdown-bar"
                        style={{ width: `${Math.round((total / maxCat) * 100)}%` }}
                      />
                    </div>
                    <span className="breakdown-amt">{fmt(total, currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Recent Activity</h2>
        </div>
        {recent.length === 0 ? (
          <p className="empty-state">No activity yet. Start by logging income or an expense.</p>
        ) : (
          <div className="entry-list">
            {recent.map(e => (
              <EntryItem
                key={e.id}
                entry={e}
                type={e.type}
                onDelete={(id) => onDelete(e.type, id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}