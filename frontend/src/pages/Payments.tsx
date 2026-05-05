import { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';
import { Payment, PaymentSummary } from '../types/payments.types';
import { useAuthStore } from '../store/authStore';
import PaymentsRow from '../components/payments/PaymentsRow';
import RecordPaymentForm from '../components/payments/RecordPaymentForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import StatCard from '../components/common/StatCard';
import Loader from '../components/common/Loader';
import { formatAmount } from '../utils/formateCurrency';

type Filter = 'all' | 'pending' | 'settled';

export default function Payments() {
  const { user } = useAuthStore();
  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [summary,   setSummary]   = useState<PaymentSummary | null>(null);
  const [filter,    setFilter]    = useState<Filter>('all');
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([paymentApi.getMyPayments(), paymentApi.getMySummary()]);
      setPayments(p);
      setSummary(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (paymentId: number) => {
    await paymentApi.settle(paymentId, {});
    load();
  };

  const shown = payments.filter(p =>
    filter === 'all' ? true : p.status === filter
  );

  return (
    <div style={s.page}>
      <header style={s.topbar}>
        <div style={s.topLeft}>
          <span style={s.breadcrumb}>My flat</span>
          <span style={s.sep}>/</span>
          <span style={s.pageTitle}>Payments</span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}
          icon={<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>}>
          Record payment
        </Button>
      </header>

      <div style={s.content}>
        {loading && <Loader />}

        {/* Stats */}
        <div style={s.metricsRow}>
          <StatCard label="Total paid out"   value={formatAmount(summary?.total_paid      ?? 0)} sub="Settled" />
          <StatCard label="Total received"   value={formatAmount(summary?.total_received  ?? 0)} sub="Confirmed" valueColor="var(--text-success)" />
          <StatCard label="Pending out"      value={formatAmount(summary?.pending_out     ?? 0)} sub="Awaiting confirmation" valueColor="var(--text-danger)" />
          <StatCard label="Pending in"       value={formatAmount(summary?.pending_in      ?? 0)} sub="From flatmates" valueColor="var(--text-warning)" />
        </div>

        <div style={s.twoCol}>

          {/* History */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Payment history</span>
              <div style={s.filterRow}>
                {(['all','pending','settled'] as Filter[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ ...s.chip, ...(filter === f ? s.chipActive : {}) }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {shown.length === 0
              ? <div style={s.empty}>No payments found.</div>
              : shown.map(p => (
                  <PaymentsRow key={p.id} payment={p} onConfirm={handleConfirm} />
                ))
            }
          </div>

          {/* Quick record form */}
          <div style={s.card}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Send a payment</span></div>
            <RecordPaymentForm onSuccess={load} />
          </div>

        </div>
      </div>

      {showForm && (
        <Modal title="Record payment" onClose={() => setShowForm(false)}>
          <RecordPaymentForm onClose={() => setShowForm(false)} onSuccess={() => { load(); setShowForm(false); }} />
        </Modal>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:       { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  topbar:     { height: 54, background: 'var(--bg-primary)', borderBottom: '0.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 },
  topLeft:    { display: 'flex', alignItems: 'center', gap: 10 },
  breadcrumb: { fontSize: 13, color: 'var(--text-tertiary)' },
  sep:        { color: 'var(--border-mid)' },
  pageTitle:  { fontSize: 15, fontWeight: 500 },
  content:    { padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.1rem', alignItems: 'start' },
  card:       { background: 'var(--bg-primary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: '1.1rem' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' },
  cardTitle:  { fontSize: 13.5, fontWeight: 600 },
  filterRow:  { display: 'flex', gap: 5 },
  chip:       { padding: '3px 12px', borderRadius: 9999, border: '0.5px solid var(--border-light)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' },
  chipActive: { background: '#ccff00', color: '#000', borderColor: '#ccff00', fontWeight: 500 },
  empty:      { fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' },
};

import React from 'react';