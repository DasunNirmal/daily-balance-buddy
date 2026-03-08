export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface DailyBalance {
  date: string; // YYYY-MM-DD
  openingBalance: number;
  closingBalance: number;
}

export interface Salary {
  id: string;
  employeeName: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES = [
  'Transport',
  'Food & Beverages',
  'Office Supplies',
  'Utilities',
  'Maintenance',
  'Packaging',
  'Labor',
  'Marketing',
  'Miscellaneous',
];

export const INCOME_CATEGORIES = [
  'Fruit Sales',
  'Wholesale',
  'Retail',
  'Delivery Income',
  'Refund',
  'Other Income',
];
