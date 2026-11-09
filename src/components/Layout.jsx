import { useState, useMemo } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { useVuna } from '../context';
import { CURRENCIES, monthNow, shiftMonth, monthLabel, fmtMoney, initials } from '../utils/storage';

const MAIN = [
  { to: '/overview', label: 'Overview', icon: 'home' },
  { to: '/income', label: 'Income', icon: 'up' },
  { to: '/expenses', label: 'Expenses', icon: 'down' },
  { to: '/goals', label: 'Savings goals', short: 'Goals', icon: 'target' },
  { to: '/debts', label: 'Debts', icon: 'debt' },
  { to: '/invoices', label: 'Owed to you', icon: 'inbox' },
  { to: '/insights', label: 'Insights', icon: 'spark' },
];
const PREFS = [
  { to: '/settings', label: 'Settings', icon: 'gear' },
  { to: '/appearance', label: 'Appearance', icon: 'half' },
];
const MOBILE_BAR = ['/overview', '/income', '/expenses', '/goals'];
const MORE = ['/debts', '/invoices', '/insights', '/settings', '/appearance'];

function ProgressCard() {
  const { data } = useVuna();
  const goal = data.goals
    .filter(g => g.saved < g.target)
    .sort((a, b) => b.saved / b.target - a.saved / a.target)[0];

  if (!goal) {
    return (
      <Link to="/goals" className="progress-card progress-empty">
        <span className="progress-label">✦ No goal yet</span>
        <span className="progress-cta">Set your first goal →</span>
      </Link>
    );
  }
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  return (
    <Link to="/goals" className="progress-card">
      <span className="progress-label">✦ {goal.name}</span>
      <span className="progress-amount">{fmtMoney(goal.saved, goal.currency)}</span>
      <span className="progress-bar"><span style={{ width: `${pct}%` }} /></span>
      <span className="progress-foot">{pct}% of {fmtMoney(goal.target, goal.currency)}</span>
    </Link>
  );
}

export default function Layout() {
  const { data, actions, viewMonth, setViewMonth } = useVuna();
  const [moreOpen, setMoreOpen] = useState(false);
  const loc = useLocation();
  const all = [...MAIN, ...PREFS];
  const current = all.find(n => n.to === loc.pathname);

  const months = useMemo(() => {
    const now = monthNow();
    return Array.from({ length: 12 }, (_, i) => shiftMonth(now, -i));
  }, []);

  const navLink = n => (
    <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <Icon name={n.icon} /> {n.label}
    </NavLink>
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/overview" className="brand">
          <span className="brand-mark">v</span>
          <span className="brand-name">vuna.</span>
        </Link>

        <nav aria-label="Workspace">
          <p className="nav-heading">Workspace</p>
          {MAIN.map(navLink)}
        </nav>

        <div className="sidebar-bottom">
          <p className="nav-heading">Your progress</p>
          <ProgressCard />
          <p className="nav-heading">Preferences</p>
          {PREFS.map(navLink)}
          <Link to="/settings" className="user">
            <span className="avatar">{initials(data.profile.name)}</span>
            <span className="user-text">
              <strong>{data.profile.name || 'Your name'}</strong>
              <small>{data.profile.subtitle || 'Freelancer'}</small>
            </span>
          </Link>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <Link to="/overview" className="brand brand-mobile">
            <span className="brand-mark">v</span>
          </Link>
          <div className="crumbs">
            <span>My workspace</span><span className="sep">/</span>
            <strong>{current?.label || 'Overview'}</strong>
          </div>
          <div className="topbar-controls">
            <label className="pill-select">
              <select value={viewMonth} onChange={e => setViewMonth(e.target.value)} aria-label="Month">
                {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </select>
              <Icon name="chevron" size={14} />
            </label>
            <label className="pill-select">
              <select value={data.currency} onChange={e => actions.setCurrency(e.target.value)} aria-label="Display currency">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <Icon name="chevron" size={14} />
            </label>
          </div>
        </header>

        <main className="page" key={loc.pathname}>
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        {MAIN.filter(n => MOBILE_BAR.includes(n.to)).map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
            <Icon name={n.icon} size={20} /><span>{n.short || n.label}</span>
          </NavLink>
        ))}
        <button className={`bn-item${MORE.includes(loc.pathname) ? ' active' : ''}`} onClick={() => setMoreOpen(true)}>
          <Icon name="more" size={20} /><span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="sheet-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setMoreOpen(false); }}>
          <div className="sheet">
            <div className="sheet-grip" />
            {all.filter(n => MORE.includes(n.to)).map(n => (
              <NavLink key={n.to} to={n.to} className="sheet-link" onClick={() => setMoreOpen(false)}>
                <Icon name={n.icon} /> {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
