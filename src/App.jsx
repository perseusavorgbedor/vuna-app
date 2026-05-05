import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import { loadData, saveData } from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => loadData());

  function persist(next) {
    setData(next);
    saveData(next);
  }

  // add income or expense
  const handleAdd = useCallback((type, entry) => {
    setData(prev => {
      const next = type === 'income'
        ? { ...prev, income: [...prev.income, entry] }
        : { ...prev, expenses: [...prev.expenses, entry] };
      saveData(next);
      return next;
    });
  }, []);

  // delete income or expense
  const handleDelete = useCallback((type, id) => {
    setData(prev => {
      const next = type === 'income'
        ? { ...prev, income: prev.income.filter(e => e.id !== id) }
        : { ...prev, expenses: prev.expenses.filter(e => e.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  // add a new goal
  const handleAddGoal = useCallback((goal) => {
    setData(prev => {
      const next = { ...prev, goals: [...prev.goals, goal] };
      saveData(next);
      return next;
    });
  }, []);

  // delete a goal
  const handleDeleteGoal = useCallback((id) => {
    setData(prev => {
      const next = { ...prev, goals: prev.goals.filter(g => g.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  // add savings to a goal
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

  // switch currency
  const handleCurrency = useCallback((currency) => {
    setData(prev => {
      const next = { ...prev, currency };
      saveData(next);
      return next;
    });
  }, []);

  return (
    <BrowserRouter>
      <Layout currency={data.currency} setCurrency={handleCurrency}>
        <Routes>
          <Route path="/" element={
            <Dashboard data={data} onDelete={handleDelete} />
          } />
          <Route path="/income" element={
            <Income data={data} onAdd={handleAdd} onDelete={handleDelete} />
          } />
          <Route path="/expenses" element={
            <Expenses data={data} onAdd={handleAdd} onDelete={handleDelete} />
          } />
          <Route path="/goals" element={
            <Goals
              data={data}
              onAdd={handleAddGoal}
              onDelete={handleDeleteGoal}
              onAddToGoal={handleAddToGoal}
            />
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}