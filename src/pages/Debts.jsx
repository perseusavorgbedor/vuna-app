import { useState } from 'react';
import { useVuna } from '../context';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import StatCard from '../components/StatCard';
import { debtPayoff } from '../utils/insights';
import { CURRENCIES, fmtMoney, fmtDate, convert, uid, todayISO } from '../utils/storage';

function DebtForm({ onClose }) {
  const { data, actions } = useVuna();
  const [f, setF] = useState({ name: '', lender: '', original: '', balance: '', currency: data.currency, due: '', minPayment: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  function submit(e) {
    e.preventDefault();
    const original = Number(f.original);
    if (!f.name.trim() || !(original > 0)) return;
    actions.addDebt({
      id: uid(), name: f.name.trim(), lender: f.lender.trim(), original,
      balance: f.balance === '' ? original : Math.min(Number(f.balance), original),
      currency: f.currency, due: f.due, minPayment: Number(f.minPayment) || 0, payments: [],
    });
    onClose();
  }
  return (
    <Modal title="Add a debt" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field"><span>What is it?</span>
          <input autoFocus required placeholder="e.g. Laptop loan" value={f.name} onChange={e => set('name', e.target.value)} /></label>
        <label className="field"><span>Lender (optional)</span>
          <input placeholder="e.g. Kofi, GCB Bank" value={f.lender} onChange={e => set('lender', e.target.value)} /></label>
        <div className="field-row">
          <label className="field"><span>Original amount</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" required value={f.original} onChange={e => set('original', e.target.value)} /></label>
          <label className="field"><span>Still owed (optional)</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="same as original" value={f.balance} onChange={e => set('balance', e.target.value)} /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Currency</span>
            <select value={f.currency} onChange={e => set('currency', e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="field"><span>Due date (optional)</span>
            <input type="date" value={f.due} onChange={e => set('due', e.target.value)} /></label>
        </div>
        <label className="field"><span>Minimum payment (optional)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={f.minPayment} onChange={e => set('minPayment', e.target.value)} /></label>
        <button className="btn btn-primary btn-block">Save debt</button>
      </form>
    </Modal>
  );
}

function PayForm({ debt, onClose }) {
  const { actions } = useVuna();
  const [amt, setAmt] = useState(debt.minPayment || '');
  const [date, setDate] = useState(todayISO());
  function submit(e) {
    e.preventDefault();
    const n = Number(amt);
    if (n > 0) { actions.payDebt(debt.id, n, date); onClose(); }
  }
  return (
    <Modal title={`Pay ${debt.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <p className="muted small">You owe {fmtMoney(debt.balance, debt.currency)}. This also logs an expense under "Debt payment".</p>
        <div className="field-row">
          <label className="field"><span>Amount ({debt.currency})</span>
            <input autoFocus type="number" min="0" step="0.01" inputMode="decimal" value={amt} onChange={e => setAmt(e.target.value)} /></label>
          <label className="field"><span>Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        </div>
        <button className="btn btn-primary btn-block">Record payment</button>
      </form>
    </Modal>
  );
}

export default function Debts() {
  const { data, actions } = useVuna();
  const { debts, currency: cur, rates } = data;
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(null);

  const owed = debts.reduce((s, d) => s + convert(d.balance, d.currency, cur, rates), 0);
  const original = debts.reduce((s, d) => s + convert(d.original, d.currency, cur, rates), 0);
  const cleared = original > 0 ? Math.round(((original - owed) / original) * 100) : 0;

  return (
    <>
      <div className="page-head">
        <div><h1>Debts</h1><p className="muted">Name it, track it, clear it.</p></div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><Icon name="plus" /> Add debt</button>
      </div>

      <div className="grid-3">
        <StatCard label="Total owed" tone="expense" value={fmtMoney(owed, cur)} note="approximate, converted" />
        <StatCard label="Cleared so far" value={`${cleared}%`} note={`of ${fmtMoney(original, cur)} borrowed`} />
        <StatCard label="Active debts" value={debts.filter(d => d.balance > 0).length} />
      </div>

      {debts.length === 0 && (
        <section className="card empty-card"><h2>Debt-free, or not logged yet</h2>
          <p className="muted">Add a loan or money you owe. Payments here also count as expenses.</p></section>
      )}

      <div className="grid-cards">
        {debts.map(d => {
          const pct = Math.min(100, Math.round(((d.original - d.balance) / d.original) * 100));
          const est = debtPayoff(d);
          const clear = d.balance <= 0;
          return (
            <section className="card goal" key={d.id}>
              <div className="goal-top">
                <div><h3>{d.name}</h3>{d.lender && <p className="muted small">{d.lender}</p>}</div>
                <button className="icon-btn" aria-label="Delete debt" onClick={() => actions.deleteDebt(d.id)}><Icon name="trash" size={16} /></button>
              </div>
              <div className="goal-amount">{fmtMoney(d.balance, d.currency)} <span className="muted">left of {fmtMoney(d.original, d.currency)}</span></div>
              <div className="bar bar-warm"><span style={{ width: `${pct}%` }} /></div>
              <p className="muted small">
                {clear ? 'Fully paid 🎉' : [
                  `${pct}% paid`,
                  d.due && `due ${fmtDate(d.due)}`,
                  est && `on pace to clear by ${est.label}`,
                ].filter(Boolean).join(' · ')}
              </p>
              {!clear && <div className="goal-foot"><span />
                <button className="btn btn-ghost btn-sm" onClick={() => setPaying(d)}>Make payment</button></div>}
            </section>
          );
        })}
      </div>
      {creating && <DebtForm onClose={() => setCreating(false)} />}
      {paying && <PayForm debt={paying} onClose={() => setPaying(null)} />}
    </>
  );
}
