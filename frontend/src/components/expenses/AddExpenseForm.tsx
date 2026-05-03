import { useState, useEffect } from 'react';
import { useRoomStore } from '../../store/roomStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useAuthStore } from '../../store/authStore';
import { ExpenseCategory, SplitType, ExpenseCreate } from '../../types/expense.types';
import { getCategoryMeta, CATEGORY_META } from '../../utils/categoryMeta';
import { calculateSplits } from '../../utils/splitCalculator';
import { formatAmount } from '../../utils/formateCurrency';
import Button from '../common/Button';

const CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[];
const SPLIT_TYPES: SplitType[] = ['equal', 'custom', 'percentage'];

function predictCategory(title: string): ExpenseCategory | null {
  const t = title.toLowerCase();
  if (['rent','landlord','deposit','pg','hostel'].some(k => t.includes(k))) return 'rent';
  if (['electric','msedcl','bescom','tata power','power bill'].some(k => t.includes(k))) return 'electricity';
  if (['bigbasket','zepto','blinkit','grocery','groceries','dmart','swiggy instamart'].some(k => t.includes(k))) return 'groceries';
  if (['wifi','broadband','airtel','jio','bsnl','water bill','gas','lpg','cylinder','indane'].some(k => t.includes(k))) return 'utilities';
  return null;
}

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddExpenseForm({ onClose, onSuccess }: Props) {
  const { activeRoomId, members } = useRoomStore();
  const { createExpense } = useExpenseStore();
  const { user } = useAuthStore();

  const [title,     setTitle]     = useState('');
  const [amount,    setAmount]    = useState('');
  const [category,  setCategory]  = useState<ExpenseCategory>('other');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [paidBy,    setPaidBy]    = useState(user?.id ?? '');
  const [selected,  setSelected]  = useState<string[]>(members.map(m => m.user_id));
  const [notes,     setNotes]     = useState('');
  const [aiSuggest, setAiSuggest] = useState<ExpenseCategory | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // AI keyword prediction
  useEffect(() => {
    if (title.length > 3) {
      const cat = predictCategory(title);
      if (cat) { setAiSuggest(cat); setCategory(cat); }
      else setAiSuggest(null);
    } else {
      setAiSuggest(null);
    }
  }, [title]);

  const toggleMember = (uid: string) =>
    setSelected(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);

  const perShare = (): string => {
    const n = selected.length || 1;
    const a = parseFloat(amount) || 0;
    return formatAmount(parseFloat((a / n).toFixed(2)));
  };

  const handleSubmit = async () => {
    if (!title.trim())       return setError('Title is required');
    if (!amount || +amount <= 0) return setError('Enter a valid amount');
    if (selected.length === 0)   return setError('Select at least one member');
    if (!activeRoomId)           return setError('No active room');

    setLoading(true);
    setError('');
    try {
      const splits = calculateSplits(+amount, selected, splitType);
      const data: ExpenseCreate = {
        room_id: activeRoomId,
        title: title.trim(),
        amount: +amount,
        category,
        split_type: splitType,
        members: selected,
        splits: splitType !== 'equal' ? splits.map(s => ({ user_id: s.user_id, amount: s.amount })) : undefined,
        notes: notes.trim() || undefined,
      };
      await createExpense(data);
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      {/* Title */}
      <div style={s.field}>
        <label style={s.label}>Title</label>
        <input
          style={s.input}
          placeholder="e.g. Electricity bill, BigBasket order…"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        {aiSuggest && (
          <div style={s.aiTag}>
            <span style={{ color: '#ccff00', marginRight: 4 }}>✦</span>
            AI suggestion: <strong style={{ margin: '0 3px' }}>{getCategoryMeta(aiSuggest).label}</strong>
            <span style={{ opacity: 0.6 }}>· high confidence</span>
          </div>
        )}
      </div>

      {/* Amount + Paid by */}
      <div style={s.twoCol}>
        <div style={s.field}>
          <label style={s.label}>Amount (₹)</label>
          <input
            type="number" style={s.input}
            value={amount} placeholder="0.00"
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Paid by</label>
          <select style={s.select} value={paidBy} onChange={e => setPaidBy(e.target.value)}>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>
                {m.name ?? m.user_id}{m.user_id === user?.id ? ' (you)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div style={s.field}>
        <label style={s.label}>Category</label>
        <div style={s.catGrid}>
          {CATEGORIES.map(c => {
            const meta = getCategoryMeta(c);
            return (
              <div key={c} onClick={() => setCategory(c)}
                style={{ ...s.catChip, ...(category === c ? s.catChipActive : {}) }}>
                <span style={{ fontSize: 18 }}>{meta.icon}</span>
                <span style={{ fontSize: 11 }}>{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split type */}
      <div style={s.field}>
        <label style={s.label}>Split type</label>
        <div style={s.splitTabs}>
          {SPLIT_TYPES.map(t => (
            <button key={t} onClick={() => setSplitType(t)}
              style={{ ...s.splitTab, ...(splitType === t ? s.splitTabActive : {}) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Members */}
      <div style={s.field}>
        <label style={s.label}>Split among</label>
        <div style={s.membersGrid}>
          {members.map(m => {
            const on = selected.includes(m.user_id);
            const share = on && amount
              ? formatAmount(parseFloat((+amount / selected.length).toFixed(2)))
              : '—';
            return (
              <div key={m.user_id} onClick={() => toggleMember(m.user_id)}
                style={{ ...s.chip, ...(on ? s.chipOn : {}) }}>
                <div style={s.chipAv}>
                  {(m.name ?? m.user_id).slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, flex: 1 }}>
                  {m.name ?? m.user_id}{m.user_id === user?.id ? ' (you)' : ''}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  {on ? share : '—'}
                </span>
                <div style={{ ...s.check, ...(on ? s.checkOn : {}) }}>
                  {on && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#000" strokeWidth="2">
                      <path d="M1.5 4l2 2 3-3"/>
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div style={s.summary}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Each person pays</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500 }}>{perShare()}</span>
      </div>

      {/* Notes */}
      <div style={s.field}>
        <label style={s.label}>Notes (optional)</label>
        <textarea rows={2} style={s.textarea} placeholder="Any reference or note…"
          value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {error && <div style={s.error}>{error}</div>}

      {/* Footer */}
      <div style={s.footer}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={loading} onClick={handleSubmit}>Add expense</Button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap:         { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  field:        { display: 'flex', flexDirection: 'column', gap: 5 },
  label:        { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 },
  input:        { height: 34, padding: '0 10px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-mid)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' },
  select:       { height: 34, padding: '0 10px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-mid)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' },
  textarea:     { padding: '8px 10px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-mid)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', width: '100%', resize: 'none' },
  twoCol:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  aiTag:        { display: 'inline-flex', alignItems: 'center', background: 'rgba(204,255,0,0.12)', border: '0.5px solid rgba(204,255,0,0.3)', borderRadius: 9999, padding: '3px 10px', fontSize: 11, color: '#4d6000', marginTop: 2 },
  catGrid:      { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 },
  catChip:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-md)', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s' },
  catChipActive:{ border: '0.5px solid #ccff00', background: 'rgba(204,255,0,0.1)', color: 'var(--text-primary)', fontWeight: 500 },
  splitTabs:    { display: 'flex', border: '0.5px solid var(--border-mid)', borderRadius: 'var(--r-md)', overflow: 'hidden' },
  splitTab:     { flex: 1, padding: '6px', fontSize: 12.5, textAlign: 'center', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' },
  splitTabActive:{ background: '#ccff00', color: '#000', fontWeight: 500 },
  membersGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 },
  chip:         { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'all 0.15s' },
  chipOn:       { border: '0.5px solid #ccff00', background: 'rgba(204,255,0,0.08)' },
  chipAv:       { width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 },
  check:        { width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--border-mid)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkOn:      { background: '#ccff00', borderColor: '#ccff00' },
  summary:      { background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '0.7rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error:        { fontSize: 12, color: 'var(--text-danger)', background: 'var(--bg-danger)', padding: '8px 12px', borderRadius: 'var(--r-md)' },
  footer:       { display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 },
};

import React from 'react';