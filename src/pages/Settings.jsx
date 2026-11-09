import { useState, useRef } from 'react';
import { useVuna } from '../context';
import { CURRENCIES, DEFAULT_RATES } from '../utils/storage';

export default function Settings() {
  const { data, actions } = useVuna();
  const [name, setName] = useState(data.profile.name);
  const [subtitle, setSubtitle] = useState(data.profile.subtitle);
  const [rates, setRates] = useState(() => ({ ...data.rates }));
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const flash = t => { setMsg(t); setTimeout(() => setMsg(''), 3500); };

  function saveProfile(e) {
    e.preventDefault();
    actions.setProfile({ name: name.trim(), subtitle: subtitle.trim() });
    flash('Profile saved.');
  }
  function saveRates(e) {
    e.preventDefault();
    const clean = {};
    CURRENCIES.forEach(c => { const n = Number(rates[c]); clean[c] = n > 0 ? n : DEFAULT_RATES[c]; });
    clean.USD = 1;
    actions.setRates(clean);
    flash('Rates saved.');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vuna-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importData(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const o = JSON.parse(reader.result);
        if (!o || typeof o !== 'object' || !Array.isArray(o.income) || !Array.isArray(o.expenses)) throw new Error('bad');
        if (!window.confirm('This replaces everything currently in Vuna with the backup. Continue?')) return;
        actions.replaceAll({
          ...data, ...o,
          profile: { ...data.profile, ...(o.profile || {}) },
          rates: { ...DEFAULT_RATES, ...(o.rates || {}) },
          goals: o.goals || [], debts: o.debts || [], shortcuts: o.shortcuts || [],
        });
        flash('Backup restored.');
      } catch { flash('That file is not a valid Vuna backup.'); }
    };
    reader.readAsText(file);
  }
  function reset() {
    if (window.confirm('Delete ALL your data on this device? Export a backup first if unsure.')) {
      actions.replaceAll({ ...data, income: [], expenses: [], goals: [], debts: [], shortcuts: [] });
      flash('All entries cleared.');
    }
  }

  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><p className="muted">Your profile, rates and data.</p></div></div>
      {msg && <p className="toast" role="status">{msg}</p>}

      <section className="card">
        <div className="card-head"><h2>Profile</h2></div>
        <form onSubmit={saveProfile}>
          <div className="field-row">
            <label className="field"><span>Your name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Perseus" /></label>
            <label className="field"><span>What you do</span><input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Freelancer" /></label>
          </div>
          <button className="btn btn-primary">Save profile</button>
        </form>
      </section>

      <section className="card">
        <div className="card-head"><h2>Exchange rates</h2><span className="muted small">Per 1 USD. Approximate, edit anytime.</span></div>
        <form onSubmit={saveRates}>
          <div className="field-row wrap">
            {CURRENCIES.filter(c => c !== 'USD').map(c => (
              <label className="field" key={c}><span>{c}</span>
                <input type="number" min="0" step="0.01" inputMode="decimal" value={rates[c]} onChange={e => setRates(r => ({ ...r, [c]: e.target.value }))} /></label>
            ))}
          </div>
          <p className="muted small" style={{ marginBottom: 12 }}>Used only to total different currencies together. Totals are estimates.</p>
          <button className="btn btn-primary">Save rates</button>
        </form>
      </section>

      <section className="card">
        <div className="card-head"><h2>Your data</h2></div>
        <p className="muted small" style={{ marginBottom: 12 }}>Everything is stored only in this browser. Export a backup regularly, especially before clearing browser data.</p>
        <div className="btn-row">
          <button className="btn" onClick={exportData}>Export backup</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import backup</button>
          <button className="btn btn-danger" onClick={reset}>Clear all data</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importData} />
        </div>
      </section>
    </>
  );
}
