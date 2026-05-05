import { NavLink } from 'react-router-dom';
import { CURRENCIES } from '../utils/storage';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: '/income', label: 'Income', icon: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg> },
  { to: '/expenses', label: 'Expenses', icon: <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg> },
  { to: '/goals', label: 'Goals', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg> },
];

const ACCENTS = [
  { key: 'green', color: '#00E87A', label: 'Green' },
  { key: 'blue', color: '#4D9EFF', label: 'Blue' },
  { key: 'purple', color: '#A855F7', label: 'Purple' },
  { key: 'orange', color: '#FF6B35', label: 'Orange' },
];

export default function Layout({ children, currency, setCurrency, theme, toggleTheme, accent, setAccent }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">V</div>
          <span className="logo-text">Vuna</span>
        </div>

        <nav className="nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              {n.icon}{n.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="toggle-label">Currency</span>
          <div className="toggle-group">
            {CURRENCIES.map(c => (
              <button key={c} className={`toggle-btn${currency === c ? ' active' : ''}`} onClick={() => setCurrency(c)}>{c}</button>
            ))}
          </div>

          <span className="toggle-label" style={{ marginTop: 16 }}>Accent Color</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {ACCENTS.map(a => (
              <button
                key={a.key}
                onClick={() => setAccent(a.key)}
                title={a.label}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: a.color, border: accent === a.key ? '2px solid var(--text)' : '2px solid transparent',
                  cursor: 'pointer', padding: 0, transition: 'transform 0.15s',
                  transform: accent === a.key ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <button className="app-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </aside>

      <main className="main">{children}</main>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
              {n.icon}<span>{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}