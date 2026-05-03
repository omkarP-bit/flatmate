export type ExpenseCategory = 'rent' | 'electricity' | 'groceries' | 'utilities' | 'other';
export type SplitType = 'equal' | 'custom' | 'percentage';

export interface ExpenseSplit {
  expense_id: number;
  user_id: string;
  amount: number;
  is_settled: boolean;
  settled_at?: string;
}

export interface Expense {
  id: number;
  room_id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paid_by: string;
  split_type: SplitType;
  notes?: string;
  created_at: string;
  splits: ExpenseSplit[];
}

export interface CustomSplitEntry {
  user_id: string;
  amount: number;
}

export interface ExpenseCreate {
  room_id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  split_type: SplitType;
  members: string[];
  splits?: CustomSplitEntry[];
  notes?: string;
}

export interface BalanceEntry {
  from_user: string;
  to_user: string;
  amount: number;
}

export interface UserBalanceOut {
  user_id: string;
  room_id: number;
  owed_to_me: number;
  i_owe: number;
  net: number;
  details: BalanceEntry[];
}

export interface CategorySuggestion {
  category: ExpenseCategory;
  confidence: 'high' | 'medium' | 'low';
  source: 'keyword' | 'history' | 'default';
}

export interface RecurringSuggestion {
  category: ExpenseCategory;
  title: string;
  avg_amount: number;
  last_added: string;
  days_since: number;
  message: string;
}