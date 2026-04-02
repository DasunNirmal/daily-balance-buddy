import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, TrendingUp, TrendingDown, DollarSign, CalendarIcon } from 'lucide-react';
import { getTransactions } from '@/lib/storage';
import { Transaction } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { generateReport } from '@/lib/report';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function Dashboard() {
  const [transactions] = useState<Transaction[]>(getTransactions());

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const sorted = [...transactions].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.createdAt.localeCompare(a.createdAt);
  });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(n);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button onClick={() => generateReport(transactions)} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', totalBalance >= 0 ? 'bg-[hsl(var(--income))]/15' : 'bg-[hsl(var(--expense))]/15')}>
                  <DollarSign className={cn('h-6 w-6', totalBalance >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className={cn('text-2xl font-bold', totalBalance >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--income))]/15">
                  <TrendingUp className="h-6 w-6 text-[hsl(var(--income))]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-[hsl(var(--income))]">{formatCurrency(totalIncome)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--expense))]/15">
                  <TrendingDown className="h-6 w-6 text-[hsl(var(--expense))]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-[hsl(var(--expense))]">{formatCurrency(totalExpense)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">All Transactions</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No transactions yet. Start by adding income or expenses.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{format(new Date(txn.date + 'T00:00:00'), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          txn.type === 'income'
                            ? 'bg-[hsl(var(--income))]/15 text-[hsl(var(--income))]'
                            : 'bg-[hsl(var(--expense))]/15 text-[hsl(var(--expense))]'
                        )}>
                          {txn.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>{txn.category}</TableCell>
                      <TableCell className={cn('text-right font-medium', txn.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                        {txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
