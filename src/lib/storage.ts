import { Transaction, DailyBalance, Salary } from '@/types/database';

const KEYS = {
  transactions: 'hff_transactions',
  dailyBalances: 'hff_daily_balances',
  salaries: 'hff_salaries',
  user: 'hff_user',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Auth
export function getUser(): { email: string } | null {
  return get(KEYS.user, null);
}
export function setUser(email: string) {
  set(KEYS.user, { email });
}
export function clearUser() {
  localStorage.removeItem(KEYS.user);
}

// Transactions
export function getTransactions(): Transaction[] {
  return get<Transaction[]>(KEYS.transactions, []);
}
export function saveTransactions(txns: Transaction[]) {
  set(KEYS.transactions, txns);
}
export function addTransaction(txn: Transaction) {
  const all = getTransactions();
  all.push(txn);
  saveTransactions(all);
  return all;
}
export function updateTransaction(id: string, updates: Partial<Transaction>) {
  const all = getTransactions().map((t) =>
    t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  );
  saveTransactions(all);
  return all;
}
export function deleteTransaction(id: string) {
  const all = getTransactions().filter((t) => t.id !== id);
  saveTransactions(all);
  return all;
}

// Daily Balances
export function getDailyBalances(): DailyBalance[] {
  return get<DailyBalance[]>(KEYS.dailyBalances, []);
}
export function saveDailyBalances(balances: DailyBalance[]) {
  set(KEYS.dailyBalances, balances);
}
export function getDailyBalance(date: string): DailyBalance | undefined {
  return getDailyBalances().find((b) => b.date === date);
}
export function upsertDailyBalance(balance: DailyBalance) {
  const all = getDailyBalances();
  const idx = all.findIndex((b) => b.date === balance.date);
  if (idx >= 0) {
    all[idx] = balance;
  } else {
    all.push(balance);
  }
  saveDailyBalances(all);
}

// Salaries
export function getSalaries(): Salary[] {
  return get<Salary[]>(KEYS.salaries, []);
}
export function saveSalaries(sals: Salary[]) {
  set(KEYS.salaries, sals);
}
export function addSalary(sal: Salary) {
  const all = getSalaries();
  all.push(sal);
  saveSalaries(all);
  return all;
}
export function updateSalary(id: string, updates: Partial<Salary>) {
  const all = getSalaries().map((s) =>
    s.id === id ? { ...s, ...updates } : s
  );
  saveSalaries(all);
  return all;
}
export function deleteSalary(id: string) {
  const all = getSalaries().filter((s) => s.id !== id);
  saveSalaries(all);
  return all;
}

// Compute carry-forward balance for a date
export function computeCarryForward(date: string): number {
  const txns = getTransactions();
  // Sum all transactions before this date
  let balance = 0;
  for (const t of txns) {
    if (t.date < date) {
      balance += t.type === 'income' ? t.amount : -t.amount;
    }
  }
  return balance;
}

// Compute today's totals
export function computeDayTotals(date: string) {
  const txns = getTransactions().filter((t) => t.date === date);
  let income = 0;
  let expense = 0;
  for (const t of txns) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}
