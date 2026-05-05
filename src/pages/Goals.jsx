import { useState } from 'react';
import Modal from '../components/Modal';
import { fmt, uid, CURRENCIES } from '../utils/storage';

function GoalCard({ goal, onDelete, onAddSavings }) {
  const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
  const remaining = Math.max(goal.target - goal.saved, 0);
  const completed = goal.saved >= goal.target;

  return (
    <div className="goal-card">
      <div className="goal-top">
        <h3 className="goal-name">{goal.name}</h3>
        <button className="icon-btn" onClick={() => onDelete(goal.id)} title="Delete goal">
          <svg viewBox="0 0 24 24">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>

      <p className="goal-target">
        Target: {fmt(goal.target, goal.currency)}
        {completed && (
          <span style={{ color: 'var(--green)', marginLeft: 8 }}>✓ Completed!</span>
        )}
      </p>

      <div className="goal-progress-wrap">
        <div
          className="goal-progress-bar"
          style={{
            width: `${pct}%`,
            background: completed ? 'var(--green)' : 'var(--green)',
            opacity: completed ? 1 : 0.85,
          }}
        />
      </div>

      <div className="goal-stats">
        <span>Saved: {fmt(goal.saved, goal.currency)}</span>
        <span className="goal-pct">{pct}%</span>
        <span>Left: {fmt(remaining, goal.currency)}</span>
      </div>

      {!completed && (
        <button className="goal-add-btn" onClick={() => onAddSavings(goal)}>
          + Add savings
        </button>
      )}
    </div>
  );
}

export default function Goals({ data, onAdd, onDelete, onAddToGoal }) {
  const { goals, currency } = data;
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form, setForm] = useState({ name: '', target: '', currency, saved: '' });
  const [addAmount, setAddAmount] = useState('');
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');

  function handleNewGoal(e) {
    e.preventDefault();
    if (!form.target || Number(form.target) <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }
    onAdd({
      id: uid(),
      name: form.name,
      target: Number(form.target),
      currency: form.currency,
      saved: Number(form.saved) || 0,
    });
    setShowNewModal(false);
    setForm({ name: '', target: '', currency, saved: '' });
    setError('');
  }

  function handleAddSavings(e) {
    e.preventDefault();
    if (!addAmount || Number(addAmount) <= 0) {
      setAddError('Please enter a valid amount.');
      return;
    }
    onAddToGoal(selectedGoal.id, Number(addAmount));
    setShowAddModal(false);
    setAddAmount('');
    setAddError('');
  }

  function openAddModal(goal) {
    setSelectedGoal(goal);
    setAddAmount('');
    setAddError('');
    setShowAddModal(true);
  }

  function openNewModal() {
    setForm({ name: '', target: '', currency, saved: '' });
    setError('');
    setShowNewModal(true);
  }

  const active = goals.filter(g => g.saved < g.target);
  const completed = goals.filter(g => g.saved >= g.target);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-sub">What are you working toward?</p>
        </div>
        <button className="btn-primary" onClick={openNewModal}>+ New Goal</button>
      </div>

      {goals.length === 0 ? (
        <div className="goals-grid">
          <div className="goal-empty">
            <p>No goals yet.</p>
            <p>Set your first one — a new laptop, school fees, or an emergency fund.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Active goals */}
          {active.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                In progress
              </p>
              <div className="goals-grid" style={{ marginBottom: 24 }}>
                {active.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onDelete={onDelete}
                    onAddSavings={openAddModal}
                  />
                ))}
              </div>
            </>
          )}

          {/* Completed goals */}
          {completed.length > 0 && (
            <>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Completed 🎉
              </p>
              <div className="goals-grid">
                {completed.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onDelete={onDelete}
                    onAddSavings={openAddModal}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* New Goal Modal */}
      {showNewModal && (
        <Modal title="New Goal" onClose={() => setShowNewModal(false)}>
          <form onSubmit={handleNewGoal}>
            <div className="form-group">
              <label className="form-label">Goal name</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. New laptop, Emergency fund"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Target amount</label>
                <input
                  className="form-input"
                  type="number" min="1" step="0.01"
                  placeholder="5000.00"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
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

            <div className="form-group">
              <label className="form-label">Already saved (optional)</label>
              <input
                className="form-input"
                type="number" min="0" step="0.01"
                placeholder="0.00"
                value={form.saved}
                onChange={e => setForm({ ...form, saved: e.target.value })}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn-primary form-submit" type="submit">
              Create Goal
            </button>
          </form>
        </Modal>
      )}

      {/* Add Savings Modal */}
      {showAddModal && selectedGoal && (
        <Modal title="Add Savings" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSavings}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
              Adding to: <strong style={{ color: 'var(--text)' }}>{selectedGoal.name}</strong>
              <br />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                {fmt(selectedGoal.saved, selectedGoal.currency)} of {fmt(selectedGoal.target, selectedGoal.currency)} saved
              </span>
            </p>

            <div className="form-group">
              <label className="form-label">Amount to add ({selectedGoal.currency})</label>
              <input
                className="form-input"
                type="number" min="0.01" step="0.01"
                placeholder="e.g. 200.00"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            {addError && <p className="form-error">{addError}</p>}

            <button className="btn-primary form-submit" type="submit">
              Add to Goal
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}