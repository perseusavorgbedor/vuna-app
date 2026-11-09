import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useVuna } from '../context';

const FEATURES = [
  ['🌍', 'Every currency, one view', 'Log in GHS, NGN, KES or USD and see one honest total.'],
  ['⚡', 'Quick log in seconds', 'Tap a shortcut like Trotro or Lunch, set today\'s amount, done.'],
  ['🎯', 'Goals and debts', 'Save toward something, or clear what you owe, at your own pace.'],
  ['🌱', 'Insights, not guilt', 'Gentle nudges when income dips or spending creeps up.'],
];

export default function Landing() {
  const { data, actions } = useVuna();
  const nav = useNavigate();
  const [name, setName] = useState('');
  let visited = false;
  try { visited = localStorage.getItem('vuna_visited') === '1'; } catch { /* ignore */ }
  if (visited && data.profile.name) return <Navigate to="/overview" replace />;

  function start(e) {
    e.preventDefault();
    if (name.trim()) actions.setProfile({ name: name.trim() });
    try { localStorage.setItem('vuna_visited', '1'); } catch { /* ignore */ }
    nav('/overview');
  }

  return (
    <div className="landing">
      <header className="land-nav">
        <span className="brand"><span className="brand-mark">v</span><span className="brand-name">vuna.</span></span>
      </header>
      <main className="land-hero">
        <p className="land-kicker">Money clarity for African freelancers</p>
        <h1>Income that comes in waves. <em>Finally, a plan that floats.</em></h1>
        <p className="land-sub">Track payments in any currency, log daily spending in seconds, and see where you really stand. Private, free, and it lives on your device.</p>
        <form className="land-form" onSubmit={start}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" aria-label="Your name" />
          <button className="btn btn-primary">Open Vuna →</button>
        </form>
      </main>
      <section className="land-features">
        {FEATURES.map(([e, t, d]) => (
          <div className="card" key={t}><div className="land-emoji">{e}</div><h3>{t}</h3><p className="muted">{d}</p></div>
        ))}
      </section>
      <footer className="land-foot muted small">Built in Accra. Your data never leaves your browser.</footer>
    </div>
  );
}
