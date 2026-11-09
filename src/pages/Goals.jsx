import { useState } from 'react';
import { useVuna } from '../context';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import { CURRENCIES, fmtMoney, uid, fmtDate } from '../utils/storage';

function GoalForm({ onClose }) {
  const { data, actions } = useVuna();
  const [f, setF] = useState({ name: '', target: '', saved: '', currency: data.currency, deadline: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  function submit(e) {
    e.preventDefault();
    if (!f.name.trim() || !(Number(f.target) > 0)) return;
    actions.addGoal({ id: uid(), name: f.name.trim(), target: Number(f.target), saved: Number(f.saved) || 0, currency: f.currency, deadline: f.deadline });
    onClose();
  }
  return (
    <Modal title="New savings goal" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field"><span>What are you saving for?</span>
          <input autoFocus required placeholder="e.g. New laptop" value={f.name} onChange={e => set('name', e.target.value)} /></label>
        <div className="field-row">
          <label className="field"><span>Target</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" required value={f.target} onChange={e => set('target', e.target.value)} /></label>
          <label className="field"><span>Currency</span>
            <select value={f.currency} onChange={e => set('currency', e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Already saved (optional)</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" value={f.saved} onChange={e => set('saved', e.target.value)} /></label>
          <label className="field"><span>Deadline (optional)</span>
            <input type="date" value={f.deadline} onChange={e => set('deadline', e.target.value)} /></label>
        </div>
        <button className="btn btn-primary btn-block">Create goal</button>
      </form>
    </Modal>
  );
}

function AddMoney({ goal, onClose }) {
  const { actions } = useVuna();
  const [amt, setAmt] = useState('');
  function submit(e) {
    e.preventDefault();
    const n = Number(amt);
    if (n > 0) { actions.addToGoal(goal.id, n); onClose(); }
  }
  return (
    <Modal title={`Add to ${goal.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field"><span>Amount ({goal.currency})</span>
          <input autoFocus type="number" min="0" step="0.01" inputMode="decimal" value={amt} onChange={e => setAmt(e.target.value)} /></label>
        <button className="btn btn-primary btn-block">Add</button>
      </form>
    </Modal>
  );
}

export default function Goals() {
  const { data, actions } = useVuna();
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(null);

  return (
    <>
      <div className="page-head">
        <div><h1>Savings goals</h1><p className="muted">Small, steady deposits beat big plans.</p></div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><Icon name="plus" /> New goal</button>
      </div>

      {data.goals.length === 0 && (
        <section className="card empty-card">
          <h2>No goals yet</h2>
          <p className="muted">Pick one thing to save for. A laptop, rent, an emergency fund.</p>
        </section>
      )}

      <div className="grid-cards">
        {data.goals.map(g => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          const done = g.saved >= g.target;
          return (
            <section className="card goal" key={g.id}>
              <div className="goal-top">
                <h3>{g.name}</h3>
                <button className="icon-btn" aria-label="Delete goal" onClick={() => actions.deleteGoal(g.id)}><Icon name="trash" size={16} /></button>
              </div>
              <div className="goal-amount">{fmtMoney(g.saved, g.currency)} <span className="muted">of {fmtMoney(g.target, g.currency)}</span></div>
              <div className="bar"><span style={{ width: `${pct}%` }} /></div>
              <div className="goal-foot">
                <span className="muted small">{done ? 'Goal reached 🎉' : `${pct}% saved${g.deadline ? ` · by ${fmtDate(g.deadline)}` : ''}`}</span>
                {!done && <button className="btn btn-ghost btn-sm" onClick={() => setAdding(g)}>Add money</button>}
              </div>
            </section>
          );
        })}
      </div>
      {creating && <GoalForm onClose={() => setCreating(false)} />}
      {adding && <AddMoney goal={adding} onClose={() => setAdding(null)} />}
    </>
  );
}
