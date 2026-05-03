import { Expense } from '../../types/expense.types';
import { getCategoryMeta } from '../../utils/categoryMeta';
import { formatAmount } from '../../utils/formateCurrency';
import { formatRelative } from '../../utils/formatDate';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import Badge from '../common/Badge';

interface Props {
  expense: Expense;
  onDelete?: (id: number) => void;
  onSettle?: (id: number) => void;
}

export default function ExpenseRow({ expense, onDelete, onSettle }: Props) {
  const { user } = useAuthStore();
  const { members } = useRoomStore();
  const meta = getCategoryMeta(expense.category);

  const myUserId = user?.id ?? '';
  const iPaid = expense.paid_by === myUserId;
  const payer = members.find(m => m.user_id === expense.paid_by);
  const payerName = iPaid ? 'you' : (payer?.name ?? 'someone');

  const mySplit = expense.splits.find(s => s.user_id === myUserId);
  const myShare = mySplit?.amount ?? 0;
  const isSettled = mySplit?.is_settled ?? false;

  return (
    <div style={s.row}>
      <div style={{ ...s.icon, background: meta.bg, color: meta.color }}>{meta.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.title}>{expense.title}</div>
        <div style={s.meta}>
          Paid by {payerName} · {formatRelative(expense.created_at)}
        </div>
        {/* Member pills */}
        <div style={s.pills}>
          {expense.splits.map(sp => {
            const m = members.find(x => x.user_id === sp.user_id);
            const initials = (m?.name ?? sp.user_id).slice(0, 2).toUpperCase();
            return (
              <div key={sp.user_id} title={m?.name ?? sp.user_id}
                style={{ ...s.pill, opacity: sp.is_settled ? 0.4 : 1 }}>
                {initials}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={s.total}>{formatAmount(expense.amount)}</div>
        {iPaid ? (
          <Badge label="You paid" variant="success" />
        ) : (
          <div style={{ fontSize: 11, color: isSettled ? 'var(--text-success)' : 'var(--text-danger)' }}>
            {isSettled ? '✓ Settled' : `Your share −${formatAmount(myShare)}`}
          </div>
        )}
        {!iPaid && !isSettled && onSettle && (
          <button style={s.settleBtn} onClick={() => onSettle(expense.id)}>Settle</button>
        )}
        {iPaid && onDelete && (
          <button style={s.deleteBtn} onClick={() => onDelete(expense.id)}>Delete</button>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  row:       { display: 'flex', alignItems: 'center', gap: 11, padding: '0.75rem 0.4rem', borderBottom: '0.5px solid var(--border-light)', borderRadius: 'var(--r-md)', cursor: 'default' },
  icon:      { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 },
  title:     { fontSize: 13, fontWeight: 500 },
  meta:      { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 },
  pills:     { display: 'flex', gap: 3, marginTop: 5 },
  pill:      { width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--text-secondary)' },
  total:     { fontSize: 13, fontWeight: 500 },
  settleBtn: { fontSize: 11, border: '0.5px solid var(--border-mid)', background: 'transparent', borderRadius: 9999, padding: '2px 10px', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' },
  deleteBtn: { fontSize: 11, border: '0.5px solid #fca5a5', background: 'transparent', borderRadius: 9999, padding: '2px 10px', cursor: 'pointer', color: 'var(--text-danger)', fontFamily: 'var(--font-sans)' },
};

import React from 'react';