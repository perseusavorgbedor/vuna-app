import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CURRENCIES } from '../utils/storage';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: '/income', label: 'Income', icon: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg> },
  { to: '/expenses', label: 'Expenses', icon: <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg> },
  { to: '/goals', label: 'Goals', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg> },
];

const ACCENTS = [
  { key: 'green',  color: '#00E87A', label: 'Green'  },
  { key: 'blue',   color: '#4D9EFF', label: 'Blue'   },
  { key: 'purple', color: '#A855F7', label: 'Purple' },
  { key: 'orange', color: '#FF6B35', label: 'Orange' },
];

export default function Layout({ children, currency, setCurrency, theme, toggleTheme, accent, setAccent }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // close panel when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  const currentAccent = ACCENTS.find(a => a.key === accent) || ACCENTS[0];

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

          {/* Theme & Color trigger */}
          <div style={{ position: 'relative', marginTop: 12 }} ref={panelRef}>
            <button
              className="app-theme-btn"
              onClick={() => setPanelOpen(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: currentAccent.color, display: 'inline-block', flexShrink: 0 }} />
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text3)' }}>▲</span>
            </button>

            {/* Floating panel */}
            {panelOpen && (
              <div style={{
                position: 'absolute', bottom: '110%', left: 0, right: 0,
                background: 'var(--bg2)', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius)', padding: '14px 16px',
                zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                animation: 'fadeIn 0.15s ease',
              }}>
                {/* Dark / Light toggle */}
                <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Mode</p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  {['dark', 'light'].map(t => (
                    <button
                      key={t}
                      onClick={() => { if (theme !== t) toggleTheme(); }}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 'var(--radius-sm)',
                        border: theme === t ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: theme === t ? 'var(--accent-dim)' : 'transparent',
                        color: theme === t ? 'var(--accent)' : 'var(--text2)',
                        fontFamily: 'var(--font)', fontSize: 12, cursor: 'pointer',
                        fontWeight: theme === t ? 600 : 400,
                      }}
                    >
                      {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                  ))}
                </div>

                {/* Accent colors */}
                <p style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Accent</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {ACCENTS.map(a => (
                    <button
                      key={a.key}
                      onClick={() => setAccent(a.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                        border: accent === a.key ? `1.5px solid ${a.color}` : '1px solid var(--border)',
                        background: accent === a.key ? `${a.color}18` : 'transparent',
                        color: accent === a.key ? a.color : 'var(--text2)',
                        fontFamily: 'var(--font)', fontSize: 12, cursor: 'pointer',
                        fontWeight: accent === a.key ? 600 : 400,
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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