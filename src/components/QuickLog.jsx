import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { useVuna } from '../context';
import {
  CURRENCIES, CATEGORIES, INCOME_SOURCES, SHORTCUT_EMOJIS, CAT_EMOJI, fmtMoney, uid, todayISO,
} from '../utils/storage';

function LogShortcutModal({ shortcut, onClose }) {
  const { actions } = useVuna();
  const [amount, setAmount] = useState(shortcut.amount || '');
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState('');
  const isIncome = shortcut.type === 'income';

  function submit(e) {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) { setError('Enter today\'s amount.'); return; }
    actions.addEntry(shortcut.type, {
      id: uid(), amount: n, currency: shortcut.currency, date, description: shortcut.name,
      ...(isIncome ? { source: shortcut.source } : { category: shortcut.category }),
    });
    onClose();
  }

  return (
    <Modal title={`${shortcut.emoji} ${shortcut.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <p className="muted small">
          {isIncome ? shortcut.source : shortcut.category} · {shortcut.currency}. Prices change daily, so set today's amount.
        </p>
        <div className="field-row">
          <label className="field">
            <span>Amount ({shortcut.currency})</span>
            <input type="number" min="0" step="0.01" inputMode="decimal" autoFocus
              value={amount} onChange={e => setAmount(e.target.value)} />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit">{isIncome ? 'Log income' : 'Log expense'}</button>
      </form>
    </Modal>
  );
}

function NewShortcutModal({ onClose }) {
  const { data, actions } = useVuna();
  const [f, setF] = useState({
    name: '', emoji: '🚌', type: 'expense', category: 'Transport',
    source: 'Cash', currency: data.currency, amount: '',
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const isIncome = f.type === 'income';

  function submit(e) {
    e.preventDefault();
    if (!f.name.trim()) return;
    actions.addShortcut({ ...f, id: uid(), name: f.name.trim(), amount: f.amount ? Number(f.amount) : '' });
    onClose();
  }

  return (
    <Modal title="New shortcut" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="seg">
          <button type="button" className={!isIncome ? 'on' : ''} onClick={() => set('type', 'expense')}>Expense</button>
          <button type="button" className={isIncome ? 'on' : ''} onClick={() => set('type', 'income')}>Income</button>
        </div>
        <label className="field">
          <span>Name</span>
          <input type="text" placeholder="e.g. Trotro, Lunch, Daily allowance" autoFocus
            value={f.name} onChange={e => set('name', e.target.value)} required />
        </label>
        <div className="field">
          <span>Icon</span>
          <div className="emoji-pick">
            {SHORTCUT_EMOJIS.map(em => (
              <button type="button" key={em} className={f.emoji === em ? 'on' : ''} onClick={() => set('emoji', em)}>{em}</button>
            ))}
          </div>
        </div>
        <div className="field-row">
          <label className="field">
            <span>{isIncome ? 'Source' : 'Category'}</span>
            {isIncome ? (
              <select value={f.source} onChange={e => set('source', e.target.value)}>
                {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <select value={f.category} onChange={e => { set('category', e.target.value); }}>
                {CATEGORIES.filter(c => c !== 'Debt payment').map(c => <option key={c}>{CAT_EMOJI[c]} {c}</option>)}
              </select>
            )}
          </label>
          <label className="field">
            <span>Currency</span>
            <select value={f.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Usual amount (optional, always editable)</span>
          <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0.00"
            value={f.amount} onChange={e => set('amount', e.target.value)} />
        </label>
        <button className="btn btn-primary btn-block" type="submit">Save shortcut</button>
      </form>
    </Modal>
  );
}

export default function QuickLog() {
  const { data, actions } = useVuna();
  const [active, setActive] = useState(null);
  const [creating, setCreating] = useState(false);

  return (
    <section className="card">
      <div className="card-head">
        <h2>Quick log</h2>
        <span className="muted small">Tap to add today's amount</span>
      </div>
      <div className="shortcut-grid">
        {data.shortcuts.map(s => (
          <div className="shortcut" key={s.id}>
            <button className="shortcut-main" onClick={() => setActive(s)}>
              <span className="shortcut-emoji">{s.emoji}</span>
              <span className="shortcut-name">{s.name}</span>
              <span className="shortcut-sub">
                {s.amount ? `${fmtMoney(s.amount, s.currency)} · edit amount` : `${s.currency} · enter amount`}
              </span>
            </button>
            <button className="shortcut-del" aria-label={`Remove ${s.name}`} onClick={() => actions.deleteShortcut(s.id)}>
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
        <button className="shortcut shortcut-new" onClick={() => setCreating(true)}>
          <Icon name="plus" />
          <span>Create shortcut</span>
        </button>
      </div>
      {active && <LogShortcutModal shortcut={active} onClose={() => setActive(null)} />}
      {creating && <NewShortcutModal onClose={() => setCreating(false)} />}
    </section>
  );
}
