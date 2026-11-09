import { useVuna } from '../context';

const ACCENTS = [
  { key: 'forest', label: 'Forest', color: '#2F6B4A' },
  { key: 'ocean', label: 'Ocean', color: '#2B6C8F' },
  { key: 'plum', label: 'Plum', color: '#7A4A8C' },
  { key: 'clay', label: 'Clay', color: '#B4532A' },
];

export default function Appearance() {
  const { theme, setTheme, accent, setAccent } = useVuna();
  return (
    <>
      <div className="page-head"><div><h1>Appearance</h1><p className="muted">Make Vuna feel like yours.</p></div></div>
      <section className="card">
        <div className="card-head"><h2>Mode</h2></div>
        <div className="seg seg-wide">
          <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>☀️ Light</button>
          <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>🌙 Dark</button>
        </div>
      </section>
      <section className="card">
        <div className="card-head"><h2>Accent colour</h2></div>
        <div className="swatches">
          {ACCENTS.map(a => (
            <button key={a.key} className={`swatch${accent === a.key ? ' on' : ''}`} onClick={() => setAccent(a.key)}>
              <span className="swatch-dot" style={{ background: a.color }} />{a.label}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
