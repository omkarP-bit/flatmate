import { RecurringSuggestion } from '../../types/expense.types';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { formatAmount } from '../../utils/formateCurrency';

interface Props {
  suggestion: RecurringSuggestion;
  onAdd: () => void;
  onDismiss: () => void;
}

export default function SuggestionBanner({ suggestion, onAdd, onDismiss }: Props) {
  const meta = getCategoryMeta(suggestion.category);

  return (
    <div style={s.banner}>
      <div style={s.left}>
        <div style={{ ...s.icon, background: meta.bg, color: meta.color }}>{meta.icon}</div>
        <div>
          <div style={s.label}>Smart reminder</div>
          <div style={s.message}>{suggestion.message}</div>
          <div style={s.hint}>
            Avg. amount: <strong>{formatAmount(suggestion.avg_amount)}</strong>
          </div>
        </div>
      </div>
      <div style={s.actions}>
        <button style={s.primaryBtn} onClick={onAdd}>Add now</button>
        <button style={s.ghostBtn} onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  banner:     { background: '#dbeafe', border: '0.5px solid #bfdbfe', borderRadius: 'var(--r-lg)', padding: '1rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' },
  left:       { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 },
  icon:       { width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 2 },
  label:      { fontSize: 11, color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 },
  message:    { fontSize: 13, color: '#1e40af', lineHeight: 1.5 },
  hint:       { fontSize: 11, color: '#3b82f6', marginTop: 3 },
  actions:    { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  primaryBtn: { background: '#ccff00', color: '#000', border: 'none', borderRadius: 9999, padding: '5px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' },
  ghostBtn:   { background: 'transparent', border: '0.5px solid #bfdbfe', borderRadius: 9999, padding: '5px 14px', fontSize: 12, color: '#1e40af', cursor: 'pointer', fontFamily: 'var(--font-sans)' },
};

import React from 'react';