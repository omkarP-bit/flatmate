import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useRoom } from '../hooks/useRoom';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/common/StatCard';
import ExpenseRow from '../components/expenses/ExpenseRow';
import SuggestionBanner from '../components/expenses/SuggestionBanner';
import MemberCard from '../components/room/MemberCard';
import BreakdownBar from '../components/room/BreakdownBar';
import Modal from '../components/common/Modal';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { formatAmount } from '../utils/formateCurrency';

interface Props { onNavigate: (page: string) => void }

export default function Dashboard({ onNavigate }: Props) {
  const { user } = useAuth();
  const { expenses, balance, suggestions, loading, handleDelete, handleSettle } = useExpenses();
  const { activeRoom, members, isAdmin, handleRemoveMember } = useRoom();
  const [showAdd, setShowAdd] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  const TABS = ['All', 'Rent', 'Electricity', 'Groceries', 'Utilities'];
  const recent = expenses
    .filter(e => activeTab === 'All' || e.category === activeTab.toLowerCase())
    .slice(0, 5);

  const visibleSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.category));
  const settled = expenses.filter(e => e.splits.every(sp => sp.is_settled)).length;
  const settledPct = expenses.length ? Math.round((settled / expenses.length) * 100) : 0;

  return (
    <div style={s.page}>
      {/* Topbar */}
      <header style={s.topbar}>
        <div style={s.topLeft}>
          <span style={s.breadcrumb}>{activeRoom?.name ?? 'My flat'}</span>
          <span style={s.sep}>/</span>
          <span style={s.pageTitle}>Dashboard</span>
        </div>
        <div style={s.topRight}>
          <button style={s.notifBtn}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 2a4 4 0 0 0-4 4v2l-1 2h10l-1-2V6a4 4 0 0 0-4-4zM6.5 12a1.5 1.5 0 0 0 3 0"/>
            </svg>
          </button>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}
            icon={<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>}>
            Add expense
          </Button>
        </div>
      </header>

      <div style={s.content}>
        {loading && <Loader />}

        {/* Suggestions */}
        {visibleSuggestions.slice(0, 1).map(sg => (
          <SuggestionBanner key={sg.category} suggestion={sg}
            onAdd={() => setShowAdd(true)}
            onDismiss={() => setDismissedSuggestions(p => [...p, sg.category])} />
        ))}

        {/* Metrics */}
        <div style={s.metricsRow}>
          <StatCard label="You are owed"  value={formatAmount(balance?.owed_to_me ?? 0)}  sub="From flatmates"     valueColor="var(--text-success)" />
          <StatCard label="You owe"       value={formatAmount(balance?.i_owe ?? 0)}        sub="Net balance"        valueColor="var(--text-danger)" />
          <StatCard label="Total expenses" value={String(expenses.length)}                 sub="This room, all time" />
          <StatCard label="Settled"       value={`${settled} / ${expenses.length}`}        sub={`${settledPct}% cleared`} progress={settledPct} />
        </div>

        <div style={s.twoCol}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Recent expenses */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Recent expenses</span>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('expenses')}>View all</Button>
              </div>
              <div style={s.tabRow}>
                {TABS.map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}>{t}</button>
                ))}
              </div>
              {recent.length === 0
                ? <div style={s.empty}>No expenses yet. Add one above!</div>
                : recent.map(e => (
                    <ExpenseRow key={e.id} expense={e}
                      onDelete={handleDelete}
                      onSettle={handleSettle} />
                  ))
              }
            </div>

            {/* Balances */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Balance summary</span>
              </div>
              {(balance?.details ?? []).length === 0
                ? <div style={s.empty}>All settled up! 🎉</div>
                : (balance?.details ?? []).map((d, i) => {
                    const isOwed = d.to_user === user?.id;
                    const other = members.find(m => m.user_id === (isOwed ? d.from_user : d.to_user));
                    return (
                      <div key={i} style={s.balanceRow}>
                        <div style={s.balanceInfo}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{other?.name ?? 'Flatmate'}</span>
                          <span style={{ fontSize: 11, color: isOwed ? 'var(--text-success)' : 'var(--text-danger)', marginTop: 2 }}>
                            {isOwed ? `Owes you ${formatAmount(d.amount)}` : `You owe ${formatAmount(d.amount)}`}
                          </span>
                        </div>
                        <button style={s.settleBtn}>{isOwed ? 'Remind' : 'Pay'}</button>
                      </div>
                    );
                  })
              }
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Room info */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>{activeRoom?.name ?? 'Room'}</span>
              </div>
              {members.map(m => (
                <MemberCard key={m.user_id} member={m}
                  isRequesterAdmin={isAdmin}
                  onRemove={isAdmin ? handleRemoveMember : undefined} />
              ))}
              {activeRoom?.room_code && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '0.5px solid var(--border-light)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Invite code</div>
                  <div style={s.inviteBox}>
                    <span style={s.inviteCode}>{activeRoom.room_code}</span>
                    <button style={s.copyBtn} onClick={() => navigator.clipboard.writeText(activeRoom.room_code)}>Copy</button>
                  </div>
                </div>
              )}
            </div>

            {/* Spending breakdown */}
            <div style={s.card}>
              <div style={s.cardHeader}><span style={s.cardTitle}>Spending by category</span></div>
              <BreakdownBar expenses={expenses} />
            </div>

          </div>
        </div>
      </div>

      {showAdd && (
        <Modal title="Add expense" onClose={() => setShowAdd(false)}>
          <AddExpenseForm onClose={() => setShowAdd(false)} />
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
  topRight:   { display: 'flex', alignItems: 'center', gap: 8 },
  notifBtn:   { width: 32, height: 32, border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-md)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' },
  content:    { padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.1rem', alignItems: 'start' },
  card:       { background: 'var(--bg-primary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: '1.1rem', boxShadow: 'var(--shadow-sm)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  cardTitle:  { fontSize: 13.5, fontWeight: 600 },
  tabRow:     { display: 'flex', borderBottom: '0.5px solid var(--border-light)', marginBottom: '0.5rem' },
  tab:        { padding: '0.4rem 0.8rem', fontSize: 12.5, cursor: 'pointer', color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', marginBottom: -1, fontFamily: 'var(--font-sans)' },
  tabActive:  { color: 'var(--text-primary)', borderBottomColor: '#ccff00', fontWeight: 500 },
  empty:      { fontSize: 13, color: 'var(--text-tertiary)', padding: '1rem 0', textAlign: 'center' },
  balanceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '0.5px solid var(--border-light)' },
  balanceInfo:{ display: 'flex', flexDirection: 'column' },
  settleBtn:  { fontSize: 11, border: '0.5px solid var(--border-mid)', background: 'transparent', borderRadius: 9999, padding: '3px 12px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' },
  inviteBox:  { background: 'var(--bg-secondary)', borderRadius: 'var(--r-md)', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  inviteCode: { fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, letterSpacing: '0.1em' },
  copyBtn:    { fontSize: 11, border: '0.5px solid var(--border-mid)', background: 'transparent', borderRadius: 'var(--r-sm)', padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' },
};

import React from 'react';