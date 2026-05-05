import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Landing from './pages/Landing';
import './landing.css';
import { loadData, saveData } from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [theme, setTheme] = useState(() => localStorage.getItem('vuna_theme') || 'dark');
  const [accent, setAccent] = useState(() => localStorage.getItem('vuna_accent') || 'green');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accent);
  }, [theme, accent]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('vuna_theme', next);
  }

  function handleAccent(color) {
    setAccent(color);
    localStorage.setItem('vuna_accent', color);
  }

  const handleAdd = useCallback((type, entry) => {
    setData(prev => {
      const next = type === 'income'
        ? { ...prev, income: [...prev.income, entry] }
        : { ...prev, expenses: [...prev.expenses, entry] };
      saveData(next);
      return next;
    });
  }, []);

  const handleDelete = useCallback((type, id) => {
    setData(prev => {
      const next = type === 'income'
        ? { ...prev, income: prev.income.filter(e => e.id !== id) }
        : { ...prev, expenses: prev.expenses.filter(e => e.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  const handleAddGoal = useCallback((goal) => {
    setData(prev => {
      const next = { ...prev, goals: [...prev.goals, goal] };
      saveData(next);
      return next;
    });
  }, []);

  const handleDeleteGoal = useCallback((id) => {
    setData(prev => {
      const next = { ...prev, goals: prev.goals.filter(g => g.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  const handleAddToGoal = useCallback((id, amount) => {
    setData(prev => {
      const next = {
        ...prev,
        goals: prev.goals.map(g =>
          g.id === id ? { ...g, saved: Number(g.saved) + amount } : g
        ),
      };
      saveData(next);
      return next;
    });
  }, []);

  const handleCurrency = useCallback((currency) => {
    setData(prev => {
      const next = { ...prev, currency };
      saveData(next);
      return next;
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — no sidebar */}
        <Route path="/" element={
          <Landing theme={theme} toggleTheme={toggleTheme} accent={accent} setAccent={handleAccent} />
        } />

        {/* App pages — inside Layout */}
        <Route path="/dashboard" element={
          <Layout currency={data.currency} setCurrency={handleCurrency} theme={theme} toggleTheme={toggleTheme} accent={accent} setAccent={handleAccent}>
            <Dashboard data={data} onDelete={handleDelete} />
          </Layout>
        } />
        <Route path="/income" element={
          <Layout currency={data.currency} setCurrency={handleCurrency} theme={theme} toggleTheme={toggleTheme} accent={accent} setAccent={handleAccent}>
            <Income data={data} onAdd={handleAdd} onDelete={handleDelete} />
          </Layout>
        } />
        <Route path="/expenses" element={
          <Layout currency={data.currency} setCurrency={handleCurrency} theme={theme} toggleTheme={toggleTheme} accent={accent} setAccent={handleAccent}>
            <Expenses data={data} onAdd={handleAdd} onDelete={handleDelete} />
          </Layout>
        } />
        <Route path="/goals" element={
          <Layout currency={data.currency} setCurrency={handleCurrency} theme={theme} toggleTheme={toggleTheme} accent={accent} setAccent={handleAccent}>
            <Goals
              data={data}
              onAdd={handleAddGoal}
              onDelete={handleDeleteGoal}
              onAddToGoal={handleAddToGoal}
            />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}