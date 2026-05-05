import { totalAllCurrencies, monthKey } from '../utils/storage';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BarChart({ income, expenses }) {
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: MONTHS[d.getMonth()],
    };
  });

  const data = months.map(m => ({
    label: m.label,
    income: totalAllCurrencies(income, m.key),
    expense: totalAllCurrencies(expenses, m.key),
  }));

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1);
  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text3)', fontSize: 13 }}>
          No data yet. Log your first income or expense.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 160 }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)' }}></div>
          Income
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', opacity: 0.8 }}></div>
          Expenses
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
        {data.map((d, i) => {
          const ih = Math.max((d.income / maxVal) * 120, d.income > 0 ? 4 : 0);
          const eh = Math.max((d.expense / maxVal) * 120, d.expense > 0 ? 4 : 0);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', width: '100%' }}>
                <div
                  title={`Income: ${d.income.toFixed(2)}`}
                  style={{
                    flex: 1, height: ih, background: 'var(--green)',
                    borderRadius: '3px 3px 0 0', minHeight: d.income > 0 ? 4 : 0,
                    transition: 'height 0.4s ease',
                  }}
                />
                <div
                  title={`Expenses: ${d.expense.toFixed(2)}`}
                  style={{
                    flex: 1, height: eh, background: 'var(--red)',
                    borderRadius: '3px 3px 0 0', minHeight: d.expense > 0 ? 4 : 0,
                    opacity: 0.8, transition: 'height 0.4s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
