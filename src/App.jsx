import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VunaContext } from './context';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Appearance from './pages/Appearance';
import { loadData, saveData, uid, todayISO, monthNow } from './utils/storage';

const ACCENTS = ['forest', 'ocean', 'plum', 'clay'];

export default function App() {
  const [data, setData] = useState(loadData);
  const [viewMonth, setViewMonth] = useState(monthNow());
  const [theme, setThemeState] = useState(() => localStorage.getItem('vuna_theme') || 'light');
  const [accent, setAccentState] = useState(() => {
    const a = localStorage.getItem('vuna_accent');
    return ACCENTS.includes(a) ? a : 'forest';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accent);
  }, [theme, accent]);

  const setTheme = t => { setThemeState(t); localStorage.setItem('vuna_theme', t); };
  const setAccent = a => { setAccentState(a); localStorage.setItem('vuna_accent', a); };

  const actions = useMemo(() => {
    const update = fn => setData(prev => { const next = fn(prev); saveData(next); return next; });

    return {
      addEntry: (type, entry) => update(p => type === 'income'
        ? { ...p, income: [...p.income, entry] }
        : { ...p, expenses: [...p.expenses, entry] }),

      deleteEntry: (type, id) => update(p => {
        if (type === 'income') return { ...p, income: p.income.filter(e => e.id !== id) };
        const gone = p.expenses.find(e => e.id === id);
        let debts = p.debts;
        // removing a debt-payment expense puts the money back on the debt
        if (gone?.debtId) {
          debts = debts.map(x => x.id === gone.debtId ? {
            ...x,
            balance: Math.min(x.original, x.balance + gone.amount),
            payments: (x.payments || []).filter(pay => pay.expenseId !== id),
          } : x);
        }
        return { ...p, expenses: p.expenses.filter(e => e.id !== id), debts };
      }),

      addGoal: goal => update(p => ({ ...p, goals: [...p.goals, goal] })),
      deleteGoal: id => update(p => ({ ...p, goals: p.goals.filter(g => g.id !== id) })),
      addToGoal: (id, amount) => update(p => ({
        ...p, goals: p.goals.map(g => g.id === id ? { ...g, saved: Number(g.saved) + amount } : g),
      })),

      addDebt: debt => update(p => ({ ...p, debts: [...p.debts, debt] })),
      deleteDebt: id => update(p => ({ ...p, debts: p.debts.filter(x => x.id !== id) })),
      payDebt: (id, amount, date) => update(p => {
        const debt = p.debts.find(x => x.id === id);
        if (!debt) return p;
        const paid = Math.min(amount, debt.balance);
        const expenseId = uid();
        return {
          ...p,
          debts: p.debts.map(x => x.id === id ? {
            ...x, balance: x.balance - paid,
            payments: [...(x.payments || []), { date, amount: paid, expenseId }],
          } : x),
          expenses: [...p.expenses, {
            id: expenseId, amount: paid, currency: debt.currency, category: 'Debt payment',
            date, description: `Payment · ${debt.name}`, debtId: id,
          }],
        };
      }),

      addShortcut: s => update(p => ({ ...p, shortcuts: [...p.shortcuts, s] })),
      deleteShortcut: id => update(p => ({ ...p, shortcuts: p.shortcuts.filter(s => s.id !== id) })),

      setProfile: profile => update(p => ({ ...p, profile: { ...p.profile, ...profile } })),
      setCurrency: currency => update(p => ({ ...p, currency })),
      setRates: rates => update(p => ({ ...p, rates: { ...p.rates, ...rates } })),
      replaceAll: next => update(() => next),
    };
  }, []);

  const value = { data, actions, viewMonth, setViewMonth, theme, setTheme, accent, setAccent, todayISO };

  return (
    <VunaContext.Provider value={value}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/appearance" element={<Appearance />} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </VunaContext.Provider>
  );
}
