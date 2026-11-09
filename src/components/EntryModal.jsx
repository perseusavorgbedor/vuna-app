import { useState } from 'react';
import Modal from './Modal';
import { useVuna } from '../context';
import { CURRENCIES, CATEGORIES, INCOME_SOURCES, uid, todayISO } from '../utils/storage';

/* Full add-entry form. `allowSwitch` shows an income/expense toggle. */
export default function EntryModal({ type: startType = 'expense', allowSwitch = false, onClose }) {
  const { data, actions } = useVuna();
  const [type, setType] = useState(startType);
  const [form, setForm] = useState({
    amount: '', currency: data.currency, category: 'Food & Drinks',
    source: 'Freelance Project', date: todayISO(), description: '',
  });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isIncome = type === 'income';

  function submit(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { setError('Enter an amount greater than zero.'); return; }
    const base = { id: uid(), amount, currency: form.currency, date: form.date, description: form.description.trim() };
    actions.addEntry(type, isIncome ? { ...base, source: form.source } : { ...base, category: form.category });
    onClose();
  }

  return (
    <Modal title={allowSwitch ? 'Quick log' : (isIncome ? 'Log a payment' : 'Log an expense')} onClose={onClose}>
      <form onSubmit={submit}>
        {allowSwitch && (
          <div className="seg" role="tablist">
            <button type="button" className={!isIncome ? 'on' : ''} onClick={() => setType('expense')}>Expense</button>
            <button type="button" className={isIncome ? 'on' : ''} onClick={() => setType('income')}>Income</button>
          </div>
        )}
        <div className="field-row">
          <label className="field">
            <span>Amount</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00" autoFocus
              value={form.amount} onChange={e => set('amount', e.target.value)} />
          </label>
          <label className="field">
            <span>Currency</span>
            <select value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>{isIncome ? 'Source' : 'Category'}</span>
            {isIncome ? (
              <select value={form.source} onChange={e => set('source', e.target.value)}>
                {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.filter(c => c !== 'Debt payment').map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          </label>
        </div>
        <label className="field">
          <span>Note (optional)</span>
          <input type="text" placeholder={isIncome ? 'e.g. Logo design for Kofi' : 'e.g. Bolt ride to client'}
            value={form.description} onChange={e => set('description', e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit">{isIncome ? 'Log payment' : 'Log expense'}</button>
      </form>
    </Modal>
  );
}
