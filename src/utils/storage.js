const KEY = 'vuna_v1';

export const SYMBOLS = { GHS: '₵', NGN: '₦', KES: 'KSh', USD: '$' };
export const CURRENCIES = ['GHS', 'NGN', 'KES', 'USD'];
export const CATEGORIES = [
  'Food & Drinks', 'Transport', 'Tools & Software',
  'Rent & Bills', 'Data & Airtime', 'Health',
  'Entertainment', 'Education', 'Other',
];
export const INCOME_SOURCES = [
  'Freelance Project', 'Design Work', 'Dev Work', 'Writing',
  'Consulting', 'Mobile Money', 'Bank Transfer', 'Cash', 'Other',
];

const DEFAULTS = { currency: 'GHS', income: [], expenses: [], goals: [], recurring: [] };

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function fmt(amount, currency) {
  const sym = SYMBOLS[currency] || '₵';
  return sym + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function monthKey(iso) { return iso.slice(0, 7); }

export function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function lastMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function totalAllCurrencies(arr, mk) {
  return arr.filter(e => monthKey(e.date) === mk).reduce((s, e) => s + Number(e.amount), 0);
}