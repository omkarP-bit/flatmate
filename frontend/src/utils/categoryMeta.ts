import { ExpenseCategory } from '../types/expense.types';

interface CategoryMeta {
  label: string;
  icon: string;
  bg: string;
  color: string;
  barColor: string;
}

export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  rent:        { label: 'Rent',        icon: '🏠', bg: '#EEEDFE', color: '#3C3489', barColor: '#7F77DD' },
  electricity: { label: 'Electricity', icon: '⚡', bg: '#FAEEDA', color: '#633806', barColor: '#EF9F27' },
  groceries:   { label: 'Groceries',   icon: '🛒', bg: '#EAF3DE', color: '#27500A', barColor: '#639922' },
  utilities:   { label: 'Utilities',   icon: '📶', bg: '#E6F1FB', color: '#0C447C', barColor: '#378ADD' },
  other:       { label: 'Other',       icon: '📦', bg: '#F2F2F0', color: '#5a5a58', barColor: '#9a9a98' },
};

export function getCategoryMeta(cat: ExpenseCategory): CategoryMeta {
  return CATEGORY_META[cat] ?? CATEGORY_META.other;
}