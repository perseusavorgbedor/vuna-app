const KEY = 'vuna_v2';
const OLD_KEY = 'vuna_v1';

export const CURRENCIES = ['GHS', 'NGN', 'KES', 'USD'];

// approximate units per 1 USD — user can edit in Settings
export const DEFAULT_RATES = { USD: 1, GHS: 11, NGN: 1500, KES: 129 };

export const CATEGORIES = [
  'Food & Drinks', 'Transport', 'Tools & Software', 'Rent & Bills',
  'Data & Airtime', 'Health', 'Entertainment', 'Education',
  'Debt payment', 'Other',
];

export const CAT_EMOJI = {
  'Food & Drinks': '🍲', 'Transport': '🚌', 'Tools & Software': '💻',
  'Rent & Bills': '🏠', 'Data & Airtime': '📶', 'Health': '🩺',
  'Entertainment': '🎬', 'Education': '📚', 'Debt payment': '🤝', 'Other': '✳️',
};

export const INCOME_SOURCES = [
  'Freelance Project', 'Design Work', 'Dev Work', 'Writing',
  'Consulting', 'Mobile Money', 'Bank Transfer', 'Cash', 'Other',
];

export const SHORTCUT_EMOJIS = ['🚌', '🍲', '🛵', '☕', '📶', '💼', '🛒', '💊', '🎓', '🏠', '⛽', '🍞'];

const defaults = () => ({
  profile: { name: '', subtitle: 'Freelancer' },
  currency: 'GHS',
  rates: { ...DEFAULT_RATES },
  income: [], expenses: [], goals: [], debts: [], shortcuts: [],
});

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      const base = defaults();
      return {
        ...base, ...d,
        profile: { ...base.profile, ...(d.profile || {}) },
        rates: { ...base.rates, ...(d.rates || {}) },
      };
    }
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const o = JSON.parse(old);
      return {
        ...defaults(),
        currency: o.currency || 'GHS',
        income: o.income || [],
        expenses: o.expenses || [],
        goals: o.goals || [],
        shortcuts: (o.recurring || []).map(r => ({
          id: r.id, name: r.name, type: r.type || 'expense',
          category: r.category, source: r.source, currency: r.currency,
          emoji: r.type === 'income' ? '💼' : (CAT_EMOJI[r.category] || '✳️'),
          amount: '',
        })),
      };
    }
  } catch { /* fall through */ }
  return defaults();
}

export function saveData(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage full or blocked */ }
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------- months ---------- */
export const monthNow = () => todayISO().slice(0, 7);

export function shiftMonth(mk, n) {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(mk) {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function monthShort(mk) {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' });
}

export function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

/* ---------- money ---------- */
export function convert(amount, from, to, rates) {
  if (from === to) return Number(amount);
  const rf = rates[from] || 1, rt = rates[to] || 1;
  return (Number(amount) / rf) * rt;
}

export function fmtMoney(n, cur) {
  const v = Number(n) || 0;
  const body = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const sign = v < 0 ? '-' : '';
  return cur === 'USD' ? `${sign}$${body}` : `${sign}${cur} ${body}`;
}

export function sumMonth(list, mk, cur, rates) {
  return list
    .filter(e => e.date.startsWith(mk))
    .reduce((s, e) => s + convert(e.amount, e.currency, cur, rates), 0);
}

export function sumAll(list, cur, rates) {
  return list.reduce((s, e) => s + convert(e.amount, e.currency, cur, rates), 0);
}

export function pctChange(now, prev) {
  return prev > 0 ? ((now - prev) / prev) * 100 : null;
}

export function categoryTotals(expenses, mk, cur, rates) {
  const out = {};
  expenses.filter(e => e.date.startsWith(mk)).forEach(e => {
    out[e.category] = (out[e.category] || 0) + convert(e.amount, e.currency, cur, rates);
  });
  return out;
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function initials(name) {
  const p = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'V';
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
}
