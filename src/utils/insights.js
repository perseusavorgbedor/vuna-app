import {
  convert, sumMonth, sumAll, shiftMonth, categoryTotals, pctChange, fmtMoney, monthShort,
} from './storage';

/* Builds a prioritised list of insights for the viewed month.
   tone: 'warn' | 'good' | 'info' */
export function buildInsights(d, mk) {
  const { income, expenses, goals, debts, currency: cur, rates } = d;

  if (!income.length && !expenses.length) {
    return [{
      id: 'start', tone: 'info', title: 'Start with one entry',
      body: 'Log an income payment or a quick expense and Vuna will begin finding patterns for you.',
    }];
  }

  const prev = shiftMonth(mk, -1);
  const earned = sumMonth(income, mk, cur, rates);
  const spent = sumMonth(expenses, mk, cur, rates);
  const pEarned = sumMonth(income, prev, cur, rates);
  const warns = [], goods = [], infos = [];

  // overspending / savings rate
  if (earned > 0 || spent > 0) {
    if (spent > earned) {
      warns.push({
        id: 'overspend', tone: 'warn', title: 'Spending is ahead of income',
        body: `You have spent ${fmtMoney(spent - earned, cur)} more than you earned this month. Trim the non-essentials until the next payment lands.`,
      });
    } else if (earned > 0) {
      const rate = Math.round(((earned - spent) / earned) * 100);
      (rate >= 20 ? goods : infos).push({
        id: 'rate', tone: rate >= 20 ? 'good' : 'info',
        title: rate >= 20 ? `Saving ${rate}% this month` : `Savings rate is ${rate}%`,
        body: rate >= 20
          ? 'That is a healthy buffer for the slow months freelancers always get.'
          : 'Aim for 20% or more so a quiet month does not catch you out.',
      });
    }
  }

  // income swings
  const inChange = pctChange(earned, pEarned);
  if (inChange !== null && inChange <= -30) {
    warns.push({
      id: 'dry', tone: 'warn', title: 'Possible dry season',
      body: `Income is down ${Math.round(Math.abs(inChange))}% from ${monthShort(prev)}. Cut flexible spending now, before the gap widens.`,
    });
  } else if (inChange !== null && inChange >= 20) {
    goods.push({
      id: 'inup', tone: 'good', title: 'A stronger month',
      body: `Income is up ${Math.round(inChange)}% on ${monthShort(prev)}. Consider moving part of it into a goal or a debt.`,
    });
  }

  // category movement
  const now = categoryTotals(expenses, mk, cur, rates);
  const before = categoryTotals(expenses, prev, cur, rates);
  const activeGoal = goals.filter(g => g.saved < g.target)
    .sort((a, b) => (b.saved / b.target) - (a.saved / a.target))[0];

  let bestDrop = null, worstRise = null;
  Object.keys(before).forEach(cat => {
    const b = before[cat], n = now[cat] || 0;
    if (cat === 'Debt payment' || b <= 0) return;
    const change = (n - b) / b;
    if (change <= -0.2 && (!bestDrop || b - n > bestDrop.diff)) bestDrop = { cat, diff: b - n, change };
    if (change >= 0.4 && (!worstRise || n - b > worstRise.diff)) worstRise = { cat, diff: n - b, change };
  });

  if (bestDrop) {
    let tail = '';
    if (activeGoal) {
      const targetInCur = convert(activeGoal.target, activeGoal.currency, cur, rates);
      const closer = Math.max(1, Math.round((bestDrop.diff / targetInCur) * 100));
      tail = ` That is enough to put your ${activeGoal.name} goal ${closer}% closer.`;
    }
    goods.unshift({
      id: 'drop', tone: 'good', title: "You're finding your rhythm.",
      body: `You spent ${fmtMoney(bestDrop.diff, cur)} less on ${bestDrop.cat.toLowerCase()} than in ${monthShort(prev)}.${tail}`,
    });
  }
  if (worstRise) {
    warns.push({
      id: 'rise', tone: 'warn', title: `${worstRise.cat} is climbing`,
      body: `Up ${Math.round(worstRise.change * 100)}% on ${monthShort(prev)} (${fmtMoney(worstRise.diff, cur)} more). Worth a look.`,
    });
  }

  // debts
  const today = new Date();
  debts.filter(x => x.balance > 0).forEach(debt => {
    if (debt.due) {
      const days = Math.ceil((new Date(debt.due + 'T00:00:00') - today) / 86400000);
      if (days <= 14) {
        warns.push({
          id: 'due-' + debt.id, tone: 'warn',
          title: days < 0 ? `${debt.name} is overdue` : `${debt.name} is due soon`,
          body: days < 0
            ? `It was due ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago. ${fmtMoney(debt.balance, debt.currency)} is still outstanding.`
            : `Due in ${days} day${days === 1 ? '' : 's'}, with ${fmtMoney(debt.balance, debt.currency)} left to pay.`,
        });
      }
    }
    const est = debtPayoff(debt);
    if (est) {
      infos.push({
        id: 'pace-' + debt.id, tone: 'info', title: `${debt.name}: on pace`,
        body: `At your current pace you will be clear by ${est.label}.`,
      });
    }
  });

  const all = [...warns, ...goods, ...infos];
  return all.length ? all : [{
    id: 'steady', tone: 'info', title: 'Steady so far',
    body: 'Nothing unusual this month. Keep logging and the patterns will show up.',
  }];
}

/* Estimates the payoff month from payments made in the last 90 days. */
export function debtPayoff(debt) {
  if (!debt.payments?.length || debt.balance <= 0) return null;
  const cutoff = Date.now() - 90 * 86400000;
  const recent = debt.payments.filter(p => new Date(p.date + 'T00:00:00').getTime() >= cutoff);
  if (!recent.length) return null;
  const total = recent.reduce((s, p) => s + p.amount, 0);
  const monthly = total / 3;
  if (monthly <= 0) return null;
  const months = Math.ceil(debt.balance / monthly);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return { months, label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
}

export { sumAll };
