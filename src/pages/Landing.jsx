import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '💰',
    title: 'Track Every Payment',
    desc: 'Log income from any source — mobile money, bank transfer, cash. Never lose track of what you earned.',
  },
  {
    icon: '🧾',
    title: 'Know Where It Goes',
    desc: 'Log expenses by category. See exactly where your money goes every month.',
  },
  {
    icon: '🎯',
    title: 'Save With Purpose',
    desc: 'Set goals for a new laptop, school fees, or an emergency fund. Track progress every time you save.',
  },
  {
    icon: '📊',
    title: 'Smart Insights',
    desc: 'Get personalized tips based on your spending. Know when a dry season is coming before it hits.',
  },
  {
    icon: '⚡',
    title: 'Quick Log',
    desc: 'Set up your daily regulars — transport, food, data — and log them in one tap. No forms, no friction.',
  },
  {
    icon: '🌍',
    title: 'Built for Africa',
    desc: 'GHS, NGN, KES, USD. Works for freelancers in Accra, Lagos, Nairobi and everywhere in between.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Ama K.',
    role: 'Graphic Designer, Accra',
    text: 'I finally know where my money goes every month. Vuna changed how I manage my income completely.',
    avatar: 'A',
  },
  {
    name: 'Chidi O.',
    role: 'Developer, Lagos',
    text: 'The dry season warning saved me. I cut spending in August before I even felt the slowdown.',
    avatar: 'C',
  },
  {
    name: 'Wanjiru M.',
    role: 'Copywriter, Nairobi',
    text: 'Simple, fast, and actually made for people like me. No unnecessary features, just what I need.',
    avatar: 'W',
  },
];

export default function Landing({ theme, toggleTheme }) {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-mark">V</div>
          <span className="logo-text">Vuna</span>
        </div>
        <div className="landing-nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">Built for African Freelancers 🌍</div>
        <h1 className="hero-title">
          Your money,<br />
          <span className="hero-accent">clearly.</span>
        </h1>
        <p className="hero-sub">
          Vuna helps you track irregular income, manage expenses, and hit savings goals —
          all in one clean dashboard designed for the African hustle.
        </p>
        <div className="hero-actions">
          <button className="btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
            Start Tracking Free →
          </button>
          <span className="hero-note">No sign up. No credit card. Works offline.</span>
        </div>

        {/* HERO STATS */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-val">4</span>
            <span className="hero-stat-label">Currencies supported</span>
          </div>
          <div className="hero-stat-div" />
          <div className="hero-stat">
            <span className="hero-stat-val">0</span>
            <span className="hero-stat-label">Sign ups required</span>
          </div>
          <div className="hero-stat-div" />
          <div className="hero-stat">
            <span className="hero-stat-val">∞</span>
            <span className="hero-stat-label">Entries you can log</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-section">
        <p className="section-eyebrow">Everything you need</p>
        <h2 className="section-title">Built around how you actually earn</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="landing-section testimonials-section">
        <p className="section-eyebrow">From the community</p>
        <h2 className="section-title">Freelancers who get it</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to see your money clearly?</h2>
        <p className="cta-sub">Join thousands of African freelancers taking control of their finances.</p>
        <button className="btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
          Open Vuna Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 13 }}>V</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Vuna</span>
        </div>
        <p className="footer-tag">Your money, clearly. — Built for Africa 🌍</p>
      </footer>

    </div>
  );
}