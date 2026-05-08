import { useMemo, useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import EntryItem from '../components/EntryItem';
import Modal from '../components/Modal';
import { fmt, thisMonth, lastMonth, monthKey, totalAllCurrencies, uid, todayISO, CATEGORIES, CURRENCIES } from '../utils/storage';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CHECKLIST = [
  { id: 'income', label: 'Log your first income payment', icon: '💰' },
  { id: 'expense', label: 'Log your first expense', icon: '🧾' },
  { id: 'goal', label: 'Set a savings goal', icon: '🎯' },
  { id: 'recurring', label: 'Add a daily regular expense', icon: '⚡' },
];

function getInsight(earned, spent, net, rate, lastEarned, catAnalysis) {
  if (earned === 0 && spent === 0) return 'Welcome to Vuna. Start by logging your first income or expense to see insights here.';
  const lines = [];
  if (earned === 0) lines.push('No income logged this month yet — remember to log every payment.');
  else if (rate < 0) lines.push(`You are spending more than you earn. You are ${Math.abs(net).toFixed(2)} in the red — cut non-essential spending now.`);
  else if (rate < 20) lines.push(`Your savings rate is ${rate}%. Try to hit at least 20% to build a buffer for slow months.`);
  else lines.push(`Strong month — you are saving ${rate}% of what you earn. Keep it up.`);
  if (lastEarned > 0 && earned < lastEarned * 0.7) lines.push(` Income is down ${Math.round(((lastEarned - earned) / lastEarned) * 100)}% from last month — dry season incoming.`);
  else if (lastEarned > 0 && earned > lastEarned * 1.2) lines.push(` Income is up ${Math.round(((earned - lastEarned) / lastEarned) * 100)}% from last month. Consider putting the extra toward a goal.`);
  if (catAnalysis.length > 0) lines.push(` ${catAnalysis[0]}`);
  return lines.join('');
}

function getCatAnalysis(expenses) {
  const tm = thisMonth(); const lm = lastMonth();
  const tmCats = {}; const lmCats = {};
  expenses.filter(e => monthKey(e.date) === tm).forEach(e => { tmCats[e.category] = (tmCats[e.category] || 0) + Number(e.amount); });
  expenses.filter(e => monthKey(e.date) === lm).forEach(e => { lmCats[e.category] = (lmCats[e.category] || 0) + Number(e.amount); });
  const insights = [];
  Object.entries(tmCats).forEach(([cat, amt]) => {
    const last = lmCats[cat] || 0;
    if (last > 0 && amt < last * 0.7) insights.push(`You spent ${Math.round(((last - amt) / last) * 100)}% less on ${cat} than last month — great discipline.`);
    else if (last > 0 && amt > last * 1.4) insights.push(`Your ${cat} spending is up ${Math.round(((amt - last) / last) * 100)}% from last month — worth reviewing.`);
  });
  return insights;
}

function getSeasonBadge(earned, lastEarned) {
  const now = new Date();
  const label = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  if (lastEarned > 0 && earned < lastEarned * 0.7) return { label: '⚠ Dry season warning', color: 'var(--amber)' };
  if (lastEarned > 0 && earned > lastEarned * 1.2) return { label: '↑ Strong month', color: 'var(--accent)' };
  return { label, color: 'var(--text3)' };
}

// Toast component
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 999,
      background: 'var(--bg2)', border: '1px solid var(--accent)',
      borderRadius: 'var(--radius)', padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'modalIn 0.3s ease',
      maxWidth: 300,
    }}>
      <span style={{ fontSize: 18 }}>👋</span>
      <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{message}</span>
      <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, marginLeft: 4 }}>✕</button>
    </div>
  );
}

export default function Dashboard({ data, onDelete, onAdd, onAddRecurring, onDeleteRecurring, isReturning }) {
  const { income, expenses, goals = [], currency, recurring = [] } = data;
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringForm, setRecurringForm] = useState({ name: '', amount: '', currency, category: 'Transport' });
  const [recurringError, setRecurringError] = useState('');
  const [showToast, setShowToast] = useState(isReturning);

  const tm = thisMonth(); const lm = lastMonth();
  const earned = totalAllCurrencies(income, tm);
  const spent = totalAllCurrencies(expenses, tm);
  const net = earned - spent;
  const rate = earned > 0 ? Math.round((net / earned) * 100) : 0;
  const lastEarned = totalAllCurrencies(income, lm);
  const catAnalysis = useMemo(() => getCatAnalysis(expenses), [expenses]);
  const insight = useMemo(() => getInsight(earned, spent, net, rate, lastEarned, catAnalysis), [earned, spent, net, rate, lastEarned, catAnalysis]);
  const badge = getSeasonBadge(earned, lastEarned);

  const breakdown = useMemo(() => {
    const cats = {};
    expenses.filter(e => monthKey(e.date) === tm).forEach(e => { cats[e.category] = (cats[e.category] || 0) + Number(e.amount); });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [expenses, tm]);
  const maxCat = breakdown[0]?.[1] || 1;

  const recent = useMemo(() => [
    ...income.map(e => ({ ...e, type: 'income' })),
    ...expenses.map(e => ({ ...e, type: 'expense' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8), [income, expenses]);

  // checklist completion
  const checklistDone = {
    income: income.length > 0,
    expense: expenses.length > 0,
    goal: goals.length > 0,
    recurring: recurring.length > 0,
  };
  const allDone = Object.values(checklistDone).every(Boolean);
  const checklistDismissed = !!localStorage.getItem('vuna_checklist_done');
  const showChecklist = !checklistDismissed && !allDone;

  useEffect(() => {
    if (allDone && !checklistDismissed) localStorage.setItem('vuna_checklist_done', 'true');
  }, [allDone, checklistDismissed]);

  const now = new Date();
  const netColor = net > 0 ? 'var(--accent)' : net < 0 ? 'var(--red)' : 'var(--text)';
  const isEmpty = income.length === 0 && expenses.length === 0;

  function logRecurring(item) {
    onAdd('expense', { id: uid(), amount: item.amount, currency: item.currency, category: item.category, date: todayISO(), description: item.name });
  }

  function handleAddRecurring(e) {
    e.preventDefault();
    if (!recurringForm.amount || Number(recurringForm.amount) <= 0) { setRecurringError('Enter a valid amount.'); return; }
    onAddRecurring({ id: uid(), ...recurringForm, amount: Number(recurringForm.amount) });
    setShowRecurringModal(false);
    setRecurringForm({ name: '', amount: '', currency, category: 'Transport' });
    setRecurringError('');
  }

  const firstName = 'back'; // can be personalised later when auth is added

  return (
    <div className="page">
      {/* Welcome back toast */}
      {showToast && (
        <Toast
          message={`Welcome back! You're on track — keep logging.`}
          onDone={() => setShowToast(false)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{MONTHS[now.getMonth()]} {now.getFullYear()}</p>
        </div>
        <div className="season-badge" style={{ borderColor: badge.color, color: badge.color }}>{badge.label}</div>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <StatCard label="Total Earned" value={fmt(earned, currency)} type="income" />
        <StatCard label="Total Spent" value={fmt(spent, currency)} type="expense" />
        <StatCard label="Net Balance" value={fmt(net, currency)} type="net" valueStyle={{ color: netColor }} />
        <StatCard label="Savings Rate" value={`${rate}%`} type="rate" />
      </div>

      {/* Getting started checklist */}
      {showChecklist && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 500 }}>Getting started</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{Object.values(checklistDone).filter(Boolean).length} of {CHECKLIST.length} done</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHECKLIST.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: checklistDone[item.id] ? 'var(--accent-dim)' : 'var(--bg3)', opacity: checklistDone[item.id] ? 0.7 : 1 }}>
                <span style={{ fontSize: 16 }}>{checklistDone[item.id] ? '✅' : item.icon}</span>
                <span style={{ fontSize: 13, color: checklistDone[item.id] ? 'var(--text3)' : 'var(--text)', textDecoration: checklistDone[item.id] ? 'line-through' : 'none' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !showChecklist && (
        <div style={{ background: 'var(--bg2)', border: '1px dashed var(--border2)', borderRadius: 'var(--radius)', padding: '32px 24px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Welcome to Vuna</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto' }}>
            Start by logging your first income payment or expense. Your dashboard will come alive with charts, insights, and your financial picture.
          </p>
        </div>
      )}

      {/* Chart + Insight */}
      {!isEmpty && (
        <div className="dash-grid">
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Income vs Expenses</h2>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Last 6 months</span>
            </div>
            <BarChart income={income} expenses={expenses} />
          </div>
          <div className="panel">
            <div className="panel-header"><h2 className="panel-title">Vuna Insight</h2></div>
            <div className="insight-box"><p className="insight-text">{insight}</p></div>
            {breakdown.length > 0 && (
              <>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Top spending this month</p>
                <div className="spend-breakdown">
                  {breakdown.map(([cat, total]) => (
                    <div className="breakdown-row" key={cat}>
                      <span className="breakdown-cat">{cat.split(' ')[0]}</span>
                      <div className="breakdown-bar-wrap"><div className="breakdown-bar" style={{ width: `${Math.round((total / maxCat) * 100)}%` }} /></div>
                      <span className="breakdown-amt">{fmt(total, currency)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Log Recurring */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Quick Log</h2>
          <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setShowRecurringModal(true)}>+ Add Regular</button>
        </div>
        {recurring.length === 0 ? (
          <p className="empty-state" style={{ padding: '16px 0' }}>Add your daily regulars — transport, food, data — and log them in one tap. No forms needed.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {recurring.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
                <button onClick={() => logRecurring(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }} title={`Log ${item.name}`}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
                  {item.name}
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>{fmt(item.amount, item.currency)}</span>
                </button>
                <button onClick={() => onDeleteRecurring(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: '0 2px', lineHeight: 1 }} title="Remove">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="panel">
        <div className="panel-header"><h2 className="panel-title">Recent Activity</h2></div>
        {recent.length === 0 ? (
          <p className="empty-state">No activity yet. Start by logging income or an expense.</p>
        ) : (
          <div className="entry-list">
            {recent.map(e => <EntryItem key={e.id} entry={e} type={e.type} onDelete={(id) => onDelete(e.type, id)} />)}
          </div>
        )}
      </div>

      {/* Add Recurring Modal */}
      {showRecurringModal && (
        <Modal title="Add Regular Expense" onClose={() => setShowRecurringModal(false)}>
          <form onSubmit={handleAddRecurring}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" placeholder="e.g. Bolt ride, Lunch, Data bundle" value={recurringForm.name} onChange={e => setRecurringForm({ ...recurringForm, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input className="form-input" type="number" min="0.01" step="0.01" placeholder="20.00" value={recurringForm.amount} onChange={e => setRecurringForm({ ...recurringForm, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={recurringForm.currency} onChange={e => setRecurringForm({ ...recurringForm, currency: e.target.value })}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={recurringForm.category} onChange={e => setRecurringForm({ ...recurringForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {recurringError && <p className="form-error">{recurringError}</p>}
            <button className="btn-primary form-submit" type="submit">Save Regular</button>
          </form>
        </Modal>
      )}
    </div>
  );
}