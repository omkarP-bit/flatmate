import { Expense, ExpenseCategory } from '../../types/expense.types';
import { getCategoryMeta, CATEGORY_META } from '../../utils/categoryMeta';
import { formatAmount } from '../../utils/formateCurrency';

interface Props {
  expenses: Expense[];
}

export default function BreakdownBar({ expenses }: Props) {
  // Sum by category
  const totals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  if (grandTotal === 0) return null;

  const cats = (Object.keys(CATEGORY_META) as ExpenseCategory[]).filter(c => totals[c] > 0);

  return (
    <div style={s.wrap}>
      {/* Stacked bar */}
      <div style={s.bar}>
        {cats.map(c => {
          const meta = getCategoryMeta(c);
          const pct  = (totals[c] / grandTotal) * 100;
          return (
            <div key={c} title={`${meta.label}: ${formatAmount(totals[c])}`}
              style={{ ...s.segment, width: `${pct}%`, background: meta.barColor }} />
          );
        })}
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {cats.map(c => {
          const meta = getCategoryMeta(c);
          const pct  = ((totals[c] / grandTotal) * 100).toFixed(0);
          return (
            <div key={c} style={s.legendItem}>
              <div style={{ ...s.dot, background: meta.barColor }} />
              <div>
                <div style={s.catLabel}>{meta.label}</div>
                <div style={s.catValue}>
                  {formatAmount(totals[c])}
                  <span style={{ marginLeft: 4, opacity: 0.5 }}>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap:       { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  bar:        { height: 8, borderRadius: 99, display: 'flex', overflow: 'hidden', gap: 2 },
  segment:    { height: '100%', borderRadius: 99, transition: 'width 0.4s' },
  legend:     { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.3rem 0' },
  dot:        { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  catLabel:   { fontSize: 12, fontWeight: 500 },
  catValue:   { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: 1 },
};

import React from 'react';