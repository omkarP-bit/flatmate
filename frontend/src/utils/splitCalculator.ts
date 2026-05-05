import { SplitType, CustomSplitEntry } from '../types/expense.types';

interface SplitResult {
  user_id: string;
  amount: number;
}

export function calculateSplits(
  totalAmount: number,
  members: string[],
  splitType: SplitType,
  customSplits?: CustomSplitEntry[]
): SplitResult[] {
  if (members.length === 0) return [];

  if (splitType === 'equal') {
    const share = Math.floor((totalAmount / members.length) * 100) / 100;
    const remainder = parseFloat((totalAmount - share * (members.length - 1)).toFixed(2));
    return members.map((uid, i) => ({
      user_id: uid,
      amount: i === members.length - 1 ? remainder : share,
    }));
  }

  if (splitType === 'custom') {
    if (!customSplits) throw new Error('Custom splits required');
    const total = customSplits.reduce((s, c) => s + c.amount, 0);
    if (Math.abs(total - totalAmount) > 0.02)
      throw new Error(`Split amounts (₹${total}) don't match total (₹${totalAmount})`);
    return customSplits.map(s => ({ user_id: s.user_id, amount: s.amount }));
  }

  if (splitType === 'percentage') {
    if (!customSplits) throw new Error('Percentage splits required');
    const total = customSplits.reduce((s, c) => s + c.amount, 0);
    if (Math.abs(total - 100) > 0.01)
      throw new Error(`Percentages must sum to 100 (got ${total})`);
    const results = customSplits.map((s, i) => ({
      user_id: s.user_id,
      amount: i === customSplits.length - 1
        ? 0
        : Math.floor((s.amount / 100) * totalAmount * 100) / 100,
    }));
    const allocated = results.slice(0, -1).reduce((s, r) => s + r.amount, 0);
    results[results.length - 1].amount = parseFloat((totalAmount - allocated).toFixed(2));
    return results;
  }

  return [];
}

export function validateSplits(
  splits: SplitResult[],
  totalAmount: number
): string | null {
  const sum = splits.reduce((s, r) => s + r.amount, 0);
  if (Math.abs(sum - totalAmount) > 0.02)
    return `Split sum ₹${sum.toFixed(2)} doesn't match total ₹${totalAmount}`;
  return null;
}