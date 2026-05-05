import { useState } from 'react';
import StatCard from '../components/StatCard';
import EntryItem from '../components/EntryItem';
import Modal from '../components/Modal';
import {
  fmt, uid, todayISO, thisMonth, lastMonth,
  totalAllCurrencies, CURRENCIES, INCOME_SOURCES,
} from '../utils/storage';

export default function Income({ data, onAdd, onDelete }) {
  const { income, currency } = data;
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    amount: '', currency: currency, source: 'Freelance Project',
    date: todayISO(), description: '',
  });
  const [error, setError] = useState('');

  const tm = thisMonth();
  const lm = lastMonth();

  const filtered = [...income]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(e => {
      if (filter === 'month') return e.date.startsWith(tm);
      if (filter === 'last') return e.date.startsWith(lm);
      return true;
    });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    onAdd('income', { ...form, id: uid(), amount: Number(form.amount) });
    setShowModal(false);
    setForm({ amount: '', currency, source: 'Freelance Project', date: todayISO(), description: '' });
    setError('');
  }

  function handleOpen() {
    setForm({ amount: '', currency, source: 'Freelance Project', date: todayISO(), description: '' });
    setError('');
    setShowModal(true);
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="page-sub">Every payment you've earned</p>
        </div>
        <button className="btn-primary" onClick={handleOpen}>+ Log Payment</button>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <StatCard
          label="This Month"
          value={fmt(totalAllCurrencies(income, tm), currency)}
          type="income"
        />
        <StatCard
          label="Last Month"
          value={fmt(totalAllCurrencies(income, lm), currency)}
        />
        <StatCard
          label="All Time"
          value={fmt(income.reduce((s, e) => s + Number(e.amount), 0), currency)}
        />
      </div>

      {/* List */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Payment History</h2>
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
            No income logged yet. Hit "Log Payment" to start.
          </p>
        ) : (
          <div className="entry-list">
            {filtered.map(e => (
              <EntryItem key={e.id} entry={e} type="income" onDelete={id => onDelete('income', id)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title="Log Payment" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  className="form-input"
                  type="number" min="0.01" step="0.01"
                  placeholder="e.g. 500.00"
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
                <label className="form-label">Source</label>
                <select
                  className="form-select"
                  value={form.source}
                  onChange={e => setForm({ ...form, source: e.target.value })}
                >
                  {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
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
                placeholder="e.g. Logo design for Kofi"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn-primary form-submit" type="submit">
              Log Payment
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}