import { NavLink } from 'react-router-dom';
import { CURRENCIES } from '../utils/storage';

const NAV = [
  {
    to: '/', label: 'Dashboard', icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    )
  },
  {
    to: '/income', label: 'Income', icon: (
      <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
    )
  },
  {
    to: '/expenses', label: 'Expenses', icon: (
      <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
    )
  },
  {
    to: '/goals', label: 'Goals', icon: (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
    )
  },
];

export default function Layout({ children, currency, setCurrency }) {
  return (
    <div className="app-layout">

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">V</div>
          <span className="logo-text">Vuna</span>
        </div>

        <nav className="nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="toggle-label">Currency</span>
          <div className="toggle-group">
            {CURRENCIES.map(c => (
              <button
                key={c}
                className={`toggle-btn${currency === c ? ' active' : ''}`}
                onClick={() => setCurrency(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main">
        {children}
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              {n.icon}
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  );
}