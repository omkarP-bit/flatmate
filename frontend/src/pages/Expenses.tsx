import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseRow from '../components/expenses/ExpenseRow';
import SuggestionBanner from '../components/expenses/SuggestionBanner';
import AddExpenseForm from '../components/expenses/AddExpenseForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import StatCard from '../components/common/StatCard';
import { formatAmount } from '../utils/formateCurrency';
import { ExpenseCategory } from '../types/expense.types';
import { getCategoryMeta } from '../utils/categoryMeta';

const CATS: Array<{ id: string; label: string }> = [
  { id: 'all',         label: 'All' },
  { id: 'rent',        label: 'Rent' },
  { id: 'electricity', label: 'Electricity' },
  { id: 'groceries',   label: 'Groceries' },
  { id: 'utilities',   label: 'Utilities' },
  { id: 'other',       label: 'Other' },
];

export default function Expenses() {
  const { expenses, grouped, suggestions, loading, handleDelete, handleSettle } = useExpenses();
  const [showAdd,   setShowAdd]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [sort,      setSort]      = useState('newest');
  const [dismissed, setDismissed] = useState<string[]>([]);

  const totalMonth  = expenses.reduce((s, e) => s + e.amount, 0);
  const myShares    = expenses.flatMap(e => e.splits).reduce((s, sp) => s + sp.amount, 0);
  const iPaidTotal  = expenses.filter(e => e.paid_by === 'me').reduce((s, e) => s + e.amount, 0);

  const filtered = expenses.filter(e =>
    (activeCat === 'all' || e.category === activeCat) &&
    (search === '' || e.title.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (sort === 'newest')  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === 'oldest')  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === 'highest') return b.amount - a.amount;
    return 0;
  });

  const groupedFiltered = filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
    const key = new Date(e.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div style={s.page}>
      <header style={s.topbar}>
        <div style={s.topLeft}>
          <span style={s.breadcrumb}>My flat</span>
          <span style={s.sep}>/</span>
          <span style={s.pageTitle}>Expenses</span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}
          icon={<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>}>
          Add expense
        </Button>
      </header>

      <div style={s.content}>
        {/* Suggestions */}
        {suggestions.filter(sg => !dismissed.includes(sg.category)).slice(0, 1).map(sg => (
          <SuggestionBanner key={sg.category} suggestion={sg}
            onAdd={() => setShowAdd(true)}
            onDismiss={() => setDismissed(p => [...p, sg.category])} />
        ))}

        {/* Stats */}
        <div style={s.statsRow}>
          <StatCard label="Total this month"  value={formatAmount(totalMonth)} />
          <StatCard label="Your total share"  value={formatAmount(myShares)}   valueColor="var(--text-danger)" />
          <StatCard label="Total expenses"    value={String(expenses.length)} />
        </div>

        {/* Main card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>All expenses</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={s.sortSel}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
            </select>
          </div>

          {/* Toolbar */}
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><circle cx="7" cy="7" r="4"/><path d="M11 11l3 3"/></svg>
              <input style={s.searchInput} placeholder="Search expenses…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {CATS.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                style={{ ...s.chip, ...(activeCat === c.id ? s.chipActive : {}) }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Grouped rows */}
          {Object.entries(groupedFiltered).map(([month, rows]) => (
            <div key={month}>
              <div style={s.monthLabel}>
                <span>{month}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {formatAmount(rows.reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>
              {rows.map(e => (
                <ExpenseRow key={e.id} expense={e}
                  onDelete={handleDelete}
                  onSettle={handleSettle} />
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={s.empty}>No expenses match your filters.</div>
          )}
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
  page:        { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  topbar:      { height: 54, background: 'var(--bg-primary)', borderBottom: '0.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 },
  topLeft:     { display: 'flex', alignItems: 'center', gap: 10 },
  breadcrumb:  { fontSize: 13, color: 'var(--text-tertiary)' },
  sep:         { color: 'var(--border-mid)' },
  pageTitle:   { fontSize: 15, fontWeight: 500 },
  content:     { padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  card:        { background: 'var(--bg-primary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-lg)', padding: '1.1rem' },
  cardHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' },
  cardTitle:   { fontSize: 13.5, fontWeight: 600 },
  sortSel:     { height: 30, padding: '0 8px', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' },
  toolbar:     { display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: '0.85rem' },
  searchBox:   { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-secondary)', border: '0.5px solid var(--border-light)', borderRadius: 'var(--r-md)', padding: '0 10px', height: 30, flex: 1, maxWidth: 240 },
  searchInput: { background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', width: '100%' },
  chip:        { padding: '4px 12px', borderRadius: 9999, border: '0.5px solid var(--border-light)', background: 'transparent', fontSize: 12, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' },
  chipActive:  { background: '#ccff00', color: '#000', borderColor: '#ccff00', fontWeight: 500 },
  monthLabel:  { display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0.5rem 0 0.3rem', borderBottom: '0.5px solid var(--border-light)', marginBottom: 2 },
  empty:       { fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' },
};

import React from 'react';