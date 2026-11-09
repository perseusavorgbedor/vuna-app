import { useState } from 'react';
import { useVuna } from '../context';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import StatCard from '../components/StatCard';
import { CURRENCIES, fmtMoney, fmtDate, convert, uid, todayISO } from '../utils/storage';

function InvoiceForm({ onClose }) {
  const { data, actions } = useVuna();
  const [f, setF] = useState({ client: '', amount: '', currency: data.currency, due: '', note: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  function submit(e) {
    e.preventDefault();
    const amount = Number(f.amount);
    if (!f.client.trim() || !(amount > 0)) return;
    actions.addInvoice({
      id: uid(), client: f.client.trim(), amount, currency: f.currency,
      due: f.due, note: f.note.trim(), created: todayISO(), paid: false, paidDate: '', incomeId: '',
    });
    onClose();
  }
  return (
    <Modal title="Money owed to you" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field"><span>Who owes you?</span>
          <input autoFocus required placeholder="e.g. Kofi, Acme Ltd" value={f.client} onChange={e => set('client', e.target.value)} /></label>
        <div className="field-row">
          <label className="field"><span>Amount</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" required value={f.amount} onChange={e => set('amount', e.target.value)} /></label>
          <label className="field"><span>Currency</span>
            <select value={f.currency} onChange={e => set('currency', e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Expected by (optional)</span>
            <input type="date" value={f.due} onChange={e => set('due', e.target.value)} /></label>
          <label className="field"><span>For (optional)</span>
            <input placeholder="e.g. Logo design" value={f.note} onChange={e => set('note', e.target.value)} /></label>
        </div>
        <button className="btn btn-primary btn-block">Save</button>
      </form>
    </Modal>
  );
}

export default function Invoices() {
  const { data, actions } = useVuna();
  const { invoices, currency: cur, rates } = data;
  const [creating, setCreating] = useState(false);
  const today = todayISO();

  const open = invoices.filter(v => !v.paid).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const paid = invoices.filter(v => v.paid).sort((a, b) => b.paidDate.localeCompare(a.paidDate));
  const waiting = open.reduce((s, v) => s + convert(v.amount, v.currency, cur, rates), 0);
  const late = open.filter(v => v.due && v.due < today);

  const card = v => {
    const isLate = !v.paid && v.due && v.due < today;
    return (
      <section className="card goal" key={v.id}>
        <div className="goal-top">
          <div><h3>{v.client}</h3>{v.note && <p className="muted small">{v.note}</p>}</div>
          <button className="icon-btn" aria-label="Delete" onClick={() => actions.deleteInvoice(v.id)}><Icon name="trash" size={16} /></button>
        </div>
        <div className="goal-amount">{fmtMoney(v.amount, v.currency)}</div>
        <div className="goal-foot">
          <span className="small">
            {v.paid ? <span className="tag">Paid {fmtDate(v.paidDate)}</span>
              : isLate ? <span className="tag tag-late">Overdue since {fmtDate(v.due)}</span>
              : <span className="muted">{v.due ? `Expected ${fmtDate(v.due)}` : 'No date set'}</span>}
          </span>
          {!v.paid && <button className="btn btn-ghost btn-sm" onClick={() => actions.markInvoicePaid(v.id, todayISO())}>Mark paid</button>}
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Owed to you</h1><p className="muted">Work delivered, money not in yet. Mark it paid and it becomes income.</p></div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><Icon name="plus" /> Add</button>
      </div>

      <div className="grid-3">
        <StatCard label="Waiting on" tone="income" value={fmtMoney(waiting, cur)} note="approximate, converted" />
        <StatCard label="Overdue" value={late.length} note={late.length ? 'worth a polite nudge' : 'all on time'} />
        <StatCard label="Open invoices" value={open.length} />
      </div>

      {invoices.length === 0 && (
        <section className="card empty-card"><h2>Nobody owes you yet</h2>
          <p className="muted">Add a client who hasn't paid. Chasing late payments is half of freelancing.</p></section>
      )}
      {open.length > 0 && <div className="grid-cards">{open.map(card)}</div>}
      {paid.length > 0 && <><h2 className="sub-h">Paid</h2><div className="grid-cards">{paid.map(card)}</div></>}
      {creating && <InvoiceForm onClose={() => setCreating(false)} />}
    </>
  );
}
