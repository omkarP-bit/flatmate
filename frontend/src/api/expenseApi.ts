import { expenseClient } from './client';
import {
  Expense, ExpenseCreate, UserBalanceOut,
  BalanceEntry, CategorySuggestion, RecurringSuggestion,
} from '../types/expense.types';

export const expenseApi = {
  create: (data: ExpenseCreate) =>
    expenseClient.post<Expense>('/expenses', data).then(r => r.data),

  getByRoom: (roomId: number) =>
    expenseClient.get<Expense[]>(`/expenses/room/${roomId}`).then(r => r.data),

  getById: (expenseId: number) =>
    expenseClient.get<Expense>(`/expenses/${expenseId}`).then(r => r.data),

  deleteById: (expenseId: number) =>
    expenseClient.delete<{ message: string }>(`/expenses/${expenseId}`).then(r => r.data),

  settleSplit: (expenseId: number) =>
    expenseClient.patch<{ message: string }>(`/expenses/${expenseId}/settle`).then(r => r.data),

  suggestCategory: (title: string) =>
    expenseClient.get<CategorySuggestion>('/expenses/suggest/category', { params: { title } }).then(r => r.data),

  getRecurringSuggestions: (roomId: number) =>
    expenseClient.get<RecurringSuggestion[]>(`/expenses/suggest/recurring/${roomId}`).then(r => r.data),

  getRoomBalances: (roomId: number) =>
    expenseClient.get<BalanceEntry[]>(`/expenses/balance/room/${roomId}`).then(r => r.data),

  getMyBalance: (roomId: number) =>
    expenseClient.get<UserBalanceOut>(`/expenses/balance/me/room/${roomId}`).then(r => r.data),
};