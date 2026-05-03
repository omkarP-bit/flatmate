import { useState } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { useAuthStore } from '../../store/authStore';
import { paymentApi } from '../../api/paymentApi';
import { formatAmount } from '../../utils/formateCurrency';
import Button from '../common/Button';

interface Props {
  onSuccess?: () => void;
  onClose?: () => void;
  prefillToUser?: string;
  prefillAmount?: number;
}

export default function RecordPaymentForm({ onSuccess, onClose, prefillToUser, prefillAmount }: Props) {
  const { members, activeRoomId } = useRoomStore();
  const { user } = useAuthStore();

  const others = members.filter(m => m.user_id !== user?.id);

  const [toUser,  setToUser]  = useState(prefillToUser ?? others[0]?.user_id ?? '');
  const [amount,  setAmount]  = useState(prefillAmount ? String(prefillAmount) : '');
  const [upiRef,  setUpiRef]  = useState('');
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const selectedMember = members.find(m => m.user_id === toUser);

  const handleSubmit = async () => {
    if (!toUser)         return setError('Select a recipient');
    if (!amount || +amount <= 0) return setError('Enter a valid amount');
    if (!activeRoomId)   return setError('No active room');

    setLoading(true);
    setError('');
    try {
      await paymentApi.create({
        room_id: activeRoomId,
        to_user: toUser,
        amount:  +amount,
        upi_ref: upiRef.trim() || undefined,
        note:    note.trim()   || undefined,
      });
      onSuccess?.();
      onClose?.();
    } catch (e: any) {
      setError(e.response?.data?.detail ?? e.message ?? 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.field}>
        <label style={s.label}>Pay to</label>
        <select style={s.select} value={toUser} onChange={e => setToUser(e.target.value)}>
          {others.map(m => (
            <option key={m.user_id} value={m.user_id}>{m.name ?? m.user_id}</option>
          ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>Amount (₹)</label>
        <input type="number" style={s.input} placeholder="0.00"
          value={amount} onChange={e => setAmount(e.target.value)} />
      </div>

      <div style={s.field}>
        <label style={s.label}>UPI ref (optional)</label>
        <input type="text" style={s.input} placeholder="Paste UPI transaction ID"
          value={upiRef} onChange={e => setUpiRef(e.target.value)} />
      </div>

      <div style={s.field}>
        <label style={s.label}>Note (optional)</label>
        <input type="text" style={s.input} placeholder="e.g. Electricity Oct"
          value={note} onChange={e => setNote(e.target.value)} />
      </div>

      {/* Recipient UPI info */}
      {selectedMember?.upi_id && (
        <div style={s.upiCard}>
          <div style={s.upiLabel}>{selectedMember.name}'s UPI ID</div>
          <div style={s.upiValue}>{selectedMember.upi_id}</div>
          <div style={s.upiHint}>Pay outside the app, then record here</div>
        </div>
      )}

      {error && <div style={s.error}>{error}</div>}

      <div style={s.footer}>
        {onClose && <Button variant="ghost" onClick={onClose}>Cancel</Button>}
        <Button variant="primary" loading={loading} onClick={handleSubmit}>Record payment</Button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap:     { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  field:    { display: 'flex', flexDirection: 'column', gap: 5 },
  label:    { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },
  input:    { height: 34, padding: '0 10px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-mid)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' },
  select:   { height: 34, padding: '0 10px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-mid)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' },
  upiCard:  { background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '0.7rem 0.85rem' },
  upiLabel: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 },
  upiValue: { fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)' },
  upiHint:  { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 },
  error:    { fontSize: 12, color: 'var(--text-danger)', background: 'var(--bg-danger)', padding: '8px 12px', borderRadius: 'var(--r-md)' },
  footer:   { display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 },
};

import React from 'react';