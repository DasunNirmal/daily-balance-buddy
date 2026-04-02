import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, TrendingUp, TrendingDown, DollarSign, CalendarIcon } from 'lucide-react';
import { getTransactions } from '@/lib/storage';
import { Transaction } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import AppSidebar, { MobileMenuButton } from '@/components/AppSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { generateReport } from '@/lib/report';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function Dashboard() {
  const [transactions] = useState<Transaction[]>(getTransactions());
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const fromStr = fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined;
  const toStr = toDate ? format(toDate, 'yyyy-MM-dd') : undefined;

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
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4 gap-2">
          <div className="flex items-center gap-2">
            <MobileMenuButton />
            <h1 className="text-lg md:text-xl font-bold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Date range filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2 text-xs md:text-sm", !fromDate && "text-muted-foreground")}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2 text-xs md:text-sm", !toDate && "text-muted-foreground")}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {toDate ? format(toDate, 'MMM dd, yyyy') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {(fromDate || toDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setFromDate(undefined); setToDate(undefined); }}>
                Clear
              </Button>
            )}
            <Button onClick={() => generateReport(transactions, fromStr, toStr)} variant="outline" size="sm" className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4 md:p-5">
                <div className={cn('flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl shrink-0', totalBalance >= 0 ? 'bg-[hsl(var(--income))]/15' : 'bg-[hsl(var(--expense))]/15')}>
                  <DollarSign className={cn('h-5 w-5 md:h-6 md:w-6', totalBalance >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Balance</p>
                  <p className={cn('text-lg md:text-2xl font-bold truncate', totalBalance >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4 md:p-5">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[hsl(var(--income))]/15 shrink-0">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--income))]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Income</p>
                  <p className="text-lg md:text-2xl font-bold text-[hsl(var(--income))] truncate">{formatCurrency(totalIncome)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4 md:p-5">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[hsl(var(--expense))]/15 shrink-0">
                  <TrendingDown className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--expense))]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-lg md:text-2xl font-bold text-[hsl(var(--expense))] truncate">{formatCurrency(totalExpense)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions table */}
          <Card>
            <div className="p-3 md:p-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm md:text-base">All Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
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
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{format(new Date(txn.date + 'T00:00:00'), 'MMM dd')}</TableCell>
                        <TableCell>
                          <span className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            txn.type === 'income'
                              ? 'bg-[hsl(var(--income))]/15 text-[hsl(var(--income))]'
                              : 'bg-[hsl(var(--expense))]/15 text-[hsl(var(--expense))]'
                          )}>
                            {txn.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{txn.description}</TableCell>
                        <TableCell className="hidden md:table-cell">{txn.category}</TableCell>
                        <TableCell className={cn('text-right font-medium text-xs md:text-sm whitespace-nowrap', txn.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                          {txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
