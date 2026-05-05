import { useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useRoomStore } from '../store/roomStore';
import { ExpenseCreate } from '../types/expense.types';

export function useExpenses() {
  const { activeRoomId } = useRoomStore();
  const {
    expenses, balance, suggestions, loading, error,
    fetchExpenses, createExpense, deleteExpense,
    settleSplit, fetchMyBalance, fetchSuggestions,
  } = useExpenseStore();

  useEffect(() => {
    if (!activeRoomId) return;
    fetchExpenses(activeRoomId);
    fetchMyBalance(activeRoomId);
    fetchSuggestions(activeRoomId);
  }, [activeRoomId]);

  const handleCreate = async (data: ExpenseCreate) => {
    const exp = await createExpense(data);
    if (activeRoomId) await fetchMyBalance(activeRoomId);
    return exp;
  };

  const handleDelete = async (expenseId: number) => {
    if (!activeRoomId) return;
    await deleteExpense(expenseId, activeRoomId);
  };

  const handleSettle = async (expenseId: number) => {
    await settleSplit(expenseId);
    if (activeRoomId) await fetchMyBalance(activeRoomId);
  };

  // Group expenses by month label
  const grouped = expenses.reduce<Record<string, typeof expenses>>((acc, e) => {
    const key = new Date(e.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return {
    expenses, grouped, balance, suggestions,
    loading, error,
    handleCreate, handleDelete, handleSettle,
  };
}