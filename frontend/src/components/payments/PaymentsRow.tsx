import { Payment } from '../../types/payments.types';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { formatAmount } from '../../utils/formateCurrency';
import { formatRelative } from '../../utils/formatDate';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

interface Props {
  payment: Payment;
  onConfirm?: (id: number) => void;
}

export default function PaymentsRow({ payment, onConfirm }: Props) {
  const { user } = useAuthStore();
  const { members } = useRoomStore();

  const myId   = user?.id ?? '';
  const isOut  = payment.from_user === myId;
  const isPending = payment.status === 'pending';

  const otherUserId = isOut ? payment.to_user : payment.from_user;
  const otherMember = members.find(m => m.user_id === otherUserId);
  const otherName   = otherMember?.name ?? otherUserId;

  return (
    <div style={s.row}>
      <Avatar name={otherName} userId={otherUserId} size={36} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.title}>
          {isOut ? `You → ${otherName}` : `${otherName} → You`}
        </div>
        <div style={s.meta}>
          {payment.note ? `${payment.note} · ` : ''}{formatRelative(payment.created_at)}
        </div>
        {payment.upi_ref && (
          <div style={s.upiRef}>UPI: {payment.upi_ref}</div>
        )}
        {!payment.upi_ref && isPending && (
          <div style={s.upiRef}>UPI ref: pending</div>
        )}
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{ ...s.amount, color: isOut ? 'var(--text-danger)' : 'var(--text-success)' }}>
          {isOut ? '−' : '+'}{formatAmount(payment.amount)}
        </div>
        <Badge
          label={isPending ? 'Pending' : 'Settled'}
          variant={isPending ? 'warning' : 'success'}
        />
        {isPending && !isOut && onConfirm && (
          <button style={s.confirmBtn} onClick={() => onConfirm(payment.id)}>
            Confirm receipt
          </button>
        )}
        {isPending && isOut && (
          <span style={s.pendingNote}>Awaiting confirmation</span>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  row:         { display: 'flex', alignItems: 'center', gap: 11, padding: '0.8rem 0', borderBottom: '0.5px solid var(--border-light)' },
  title:       { fontSize: 13, fontWeight: 500 },
  meta:        { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 },
  upiRef:      { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 },
  amount:      { fontSize: 14, fontWeight: 500 },
  confirmBtn:  { fontSize: 11, border: '0.5px solid var(--border-mid)', background: 'transparent', borderRadius: 9999, padding: '3px 11px', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' },
  pendingNote: { fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' },
};

import React from 'react';