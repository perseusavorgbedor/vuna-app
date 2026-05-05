import { useState, useMemo } from 'react';
import StatCard from '../components/StatCard';
import EntryItem from '../components/EntryItem';
import Modal from '../components/Modal';
import {
  fmt, uid, todayISO, thisMonth, lastMonth,
  totalAllCurrencies, monthKey, CURRENCIES, CATEGORIES,
} from '../utils/storage';

export default function Expenses({ data, onAdd, onDelete }) {
  const { expenses, currency } = data;
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    amount: '', currency: currency, category: 'Food & Drinks',
    date: todayISO(), description: '',
  });
  const [error, setError] = useState('');

  const tm = thisMonth();
  const lm = lastMonth();

  const filtered = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(e => {
      if (filter === 'month') return e.date.startsWith(tm);
      if (filter === 'last') return e.date.startsWith(lm);
      return true;
    });

  const biggestCat = useMemo(() => {
    const cats = {};
    expenses
      .filter(e => monthKey(e.date) === tm)
      .forEach(e => { cats[e.category] = (cats[e.category] || 0) + Number(e.amount); });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || '—';
  }, [expenses, tm]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    onAdd('expense', { ...form, id: uid(), amount: Number(form.amount) });
    setShowModal(false);
    setForm({ amount: '', currency, category: 'Food & Drinks', date: todayISO(), description: '' });
    setError('');
  }

  function handleOpen() {
    setForm({ amount: '', currency, category: 'Food & Drinks', date: todayISO(), description: '' });
    setError('');
    setShowModal(true);
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">Know where every cedi goes</p>
        </div>
        <button className="btn-primary" onClick={handleOpen}>+ Log Expense</button>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <StatCard
          label="This Month"
          value={fmt(totalAllCurrencies(expenses, tm), currency)}
          type="expense"
        />
        <StatCard
          label="Last Month"
          value={fmt(totalAllCurrencies(expenses, lm), currency)}
        />
        <StatCard
          label="Biggest Category"
          value={biggestCat.split(' ')[0]}
        />
        <StatCard
          label="All Time"
          value={fmt(expenses.reduce((s, e) => s + Number(e.amount), 0), currency)}
        />
      </div>

      {/* List */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Expense History</h2>
          <select
            className="filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="month">This month</option>
            <option value="last">Last month</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="empty-state">
            No expenses logged yet. Hit "Log Expense" to start.
          </p>
        ) : (
          <div className="entry-list">
            {filtered.map(e => (
              <EntryItem key={e.id} entry={e} type="expense" onDelete={id => onDelete('expense', id)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Log Expense" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  className="form-input"
                  type="number" min="0.01" step="0.01"
                  placeholder="e.g. 50.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  className="form-select"
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Bolt ride to client"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn-primary form-submit" type="submit">
              Log Expense
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}