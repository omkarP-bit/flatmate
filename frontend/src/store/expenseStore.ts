import { create } from 'zustand';
import { Expense, ExpenseCreate, UserBalanceOut, RecurringSuggestion } from '../types/expense.types';
import { expenseApi } from '../api/expenseApi';

interface ExpenseState {
  expenses: Expense[];
  balance: UserBalanceOut | null;
  suggestions: RecurringSuggestion[];
  loading: boolean;
  error: string | null;

  fetchExpenses: (roomId: number) => Promise<void>;
  createExpense: (data: ExpenseCreate) => Promise<Expense>;
  deleteExpense: (expenseId: number, roomId: number) => Promise<void>;
  settleSplit: (expenseId: number) => Promise<void>;
  fetchMyBalance: (roomId: number) => Promise<void>;
  fetchSuggestions: (roomId: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  balance: null,
  suggestions: [],
  loading: false,
  error: null,

  fetchExpenses: async (roomId) => {
    set({ loading: true, error: null });
    try {
      const expenses = await expenseApi.getByRoom(roomId);
      set({ expenses });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  createExpense: async (data) => {
    const expense = await expenseApi.create(data);
    set(state => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  deleteExpense: async (expenseId, roomId) => {
    await expenseApi.deleteById(expenseId);
    set(state => ({ expenses: state.expenses.filter(e => e.id !== expenseId) }));
    await get().fetchMyBalance(roomId);
  },

  settleSplit: async (expenseId) => {
    await expenseApi.settleSplit(expenseId);
    set(state => ({
      expenses: state.expenses.map(e =>
        e.id === expenseId
          ? { ...e, splits: e.splits.map(s => ({ ...s, is_settled: true })) }
          : e
      ),
    }));
  },

  fetchMyBalance: async (roomId) => {
    try {
      const balance = await expenseApi.getMyBalance(roomId);
      set({ balance });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchSuggestions: async (roomId) => {
    try {
      const suggestions = await expenseApi.getRecurringSuggestions(roomId);
      set({ suggestions });
    } catch {
      set({ suggestions: [] });
    }
  },
}));