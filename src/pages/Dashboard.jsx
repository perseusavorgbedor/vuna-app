import { useMemo, useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import EntryItem from '../components/EntryItem';
import Modal from '../components/Modal';
import { fmt, thisMonth, lastMonth, monthKey, totalAllCurrencies, uid, todayISO, CATEGORIES, CURRENCIES, INCOME_SOURCES } from '../utils/storage';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CHECKLIST = [
  { id: 'income', label: 'Log your first income payment', icon: '💰' },
  { id: 'expense', label: 'Log your first expense', icon: '🧾' },
  { id: 'goal', label: 'Set a savings goal', icon: '🎯' },
  { id: 'recurring', label: 'Add a daily regular', icon: '⚡' },
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

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 999,
      background: 'var(--bg2)', border: '1px solid var(--accent)',
      borderRadius: 'var(--radius)', padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'modalIn 0.3s ease', maxWidth: 300,
    }}>
      <span style={{ fontSize: 18 }}>👋</span>
      <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{message}</span>
      <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, marginLeft: 4 }}>✕</button>
    </div>
  );
}

// Quick log mini modal — shared for both income and expense shortcuts
function QuickLogModal({ item, type, onClose, onLog }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [date, setDate] = useState(todayISO());

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount.'); return; }
    onLog({ ...item, amount: Number(amount), date });
    onClose();
  }

  const isExpense = type === 'expense';

  return (
    <Modal title={`Log — ${item.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          {isExpense ? `Category: ${item.category}` : `Source: ${item.source}`} · {item.currency}
        </p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount ({item.currency})</label>
            <input
              className="form-input"
              type="number" min="0.01" step="0.01"
              placeholder="e.g. 15.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary form-submit" type="submit">
          {isExpense ? 'Log Expense' : 'Log Income'}
        </button>
      </form>
    </Modal>
  );
}

// Shortcut pill button
function ShortcutPill({ item, type, onTap, onDelete }) {
  const dotColor = type === 'expense' ? 'var(--red)' : 'var(--accent)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
      <button
        onClick={onTap}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        title={`Quick log: ${item.name}`}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
        {item.name}
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', background: 'var(--bg2)', padding: '2px 5px', borderRadius: 4 }}>
          {type === 'expense' ? item.category.split(' ')[0] : item.source.split(' ')[0]}
        </span>
      </button>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12, padding: '0 2px', lineHeight: 1 }} title="Remove">✕</button>
    </div>
  );
}

export default function Dashboard({ data, onDelete, onAdd, onAddRecurring, onDeleteRecurring, isReturning }) {
  const { income, expenses, goals = [], currency, recurring = [] } = data;

  // modals
  const [showAddShortcutModal, setShowAddShortcutModal] = useState(false);
  const [quickLogItem, setQuickLogItem] = useState(null); // { item, type }
  const [shortcutForm, setShortcutForm] = useState({ name: '', currency, category: 'Transport', source: 'Cash', type: 'expense' });
  const [shortcutError, setShortcutError] = useState('');
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

  const checklistDone = { income: income.length > 0, expense: expenses.length > 0, goal: goals.length > 0, recurring: recurring.length > 0 };
  const allDone = Object.values(checklistDone).every(Boolean);
  const checklistDismissed = !!localStorage.getItem('vuna_checklist_done');
  const showChecklist = !checklistDismissed && !allDone;
  useEffect(() => { if (allDone && !checklistDismissed) localStorage.setItem('vuna_checklist_done', 'true'); }, [allDone, checklistDismissed]);

  const netColor = net > 0 ? 'var(--accent)' : net < 0 ? 'var(--red)' : 'var(--text)';
  const isEmpty = income.length === 0 && expenses.length === 0;
  const now = new Date();

  // split recurring into expense shortcuts and income shortcuts
  const expenseShortcuts = recurring.filter(r => r.type === 'expense' || !r.type);
  const incomeShortcuts = recurring.filter(r => r.type === 'income');

  function handleQuickLog(item, type) {
    setQuickLogItem({ item, type });
  }

  function handleLogConfirm({ amount, date }) {
    const { item, type } = quickLogItem;
    const entry = {
      id: uid(), amount, currency: item.currency, date,
      description: item.name,
      ...(type === 'expense' ? { category: item.category } : { source: item.source }),
    };
    onAdd(type, entry);
    setQuickLogItem(null);
  }

  function handleAddShortcut(e) {
    e.preventDefault();
    if (!shortcutForm.name.trim()) { setShortcutError('Enter a name.'); return; }
    onAddRecurring({ id: uid(), ...shortcutForm });
    setShowAddShortcutModal(false);
    setShortcutForm({ name: '', currency, category: 'Transport', source: 'Cash', type: 'expense' });
    setShortcutError('');
  }

  return (
    <div className="page">
      {showToast && <Toast message="Welcome back! You're on track — keep logging." onDone={() => setShowToast(false)} />}

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
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: checklistDone[item.id] ? 'var(--accent-dim)' : 'var(--bg3)', opacity: checklistDone[item.id] ? 0.7 : 1, transition: 'all 0.2s' }}>
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

      {/* Quick Log */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Quick Log</h2>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Tap any shortcut, enter today's amount, done.</p>
          </div>
          <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setShowAddShortcutModal(true)}>+ Add Shortcut</button>
        </div>

        {recurring.length === 0 ? (
          <p className="empty-state" style={{ padding: '16px 0' }}>
            Add shortcuts for things you log often — transport, food, allowance, wages. Tap to log, enter the amount, done.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {expenseShortcuts.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Expenses</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {expenseShortcuts.map(item => (
                    <ShortcutPill key={item.id} item={item} type="expense" onTap={() => handleQuickLog(item, 'expense')} onDelete={() => onDeleteRecurring(item.id)} />
                  ))}
                </div>
              </div>
            )}
            {incomeShortcuts.length > 0 && (
              <div>
                <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Income</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {incomeShortcuts.map(item => (
                    <ShortcutPill key={item.id} item={item} type="income" onTap={() => handleQuickLog(item, 'income')} onDelete={() => onDeleteRecurring(item.id)} />
                  ))}
                </div>
              </div>
            )}
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

      {/* Quick Log Mini Modal */}
      {quickLogItem && (
        <QuickLogModal
          item={quickLogItem.item}
          type={quickLogItem.type}
          onClose={() => setQuickLogItem(null)}
          onLog={({ amount, date }) => {
            const { item, type } = quickLogItem;
            onAdd(type, {
              id: uid(), amount, currency: item.currency, date,
              description: item.name,
              ...(type === 'expense' ? { category: item.category } : { source: item.source }),
            });
            setQuickLogItem(null);
          }}
        />
      )}

      {/* Add Shortcut Modal */}
      {showAddShortcutModal && (
        <Modal title="Add Quick Log Shortcut" onClose={() => setShowAddShortcutModal(false)}>
          <form onSubmit={handleAddShortcut}>
            <div className="form-group">
              <label className="form-label">Shortcut name</label>
              <input className="form-input" type="text" placeholder="e.g. Trotro home, Lunch, Daily allowance" value={shortcutForm.name} onChange={e => setShortcutForm({ ...shortcutForm, name: e.target.value })} required />
            </div>

            {/* Type toggle */}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['expense', 'income'].map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setShortcutForm({ ...shortcutForm, type: t })}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                      border: shortcutForm.type === t ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: shortcutForm.type === t ? 'var(--accent-dim)' : 'transparent',
                      color: shortcutForm.type === t ? 'var(--accent)' : 'var(--text2)',
                      fontFamily: 'var(--font)', fontSize: 13, cursor: 'pointer', fontWeight: shortcutForm.type === t ? 600 : 400,
                    }}
                  >
                    {t === 'expense' ? '🧾 Expense' : '💰 Income'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{shortcutForm.type === 'expense' ? 'Category' : 'Source'}</label>
                {shortcutForm.type === 'expense' ? (
                  <select className="form-select" value={shortcutForm.category} onChange={e => setShortcutForm({ ...shortcutForm, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                ) : (
                  <select className="form-select" value={shortcutForm.source} onChange={e => setShortcutForm({ ...shortcutForm, source: e.target.value })}>
                    {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={shortcutForm.currency} onChange={e => setShortcutForm({ ...shortcutForm, currency: e.target.value })}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {shortcutError && <p className="form-error">{shortcutError}</p>}
            <button className="btn-primary form-submit" type="submit">Save Shortcut</button>
          </form>
        </Modal>
      )}
    </div>
  );
}