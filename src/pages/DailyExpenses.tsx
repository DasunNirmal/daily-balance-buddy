import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, EXPENSE_DESCRIPTIONS, INCOME_DESCRIPTIONS } from '@/types/database';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  computeCarryForward,
  computeDayTotals,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function DailyExpenses() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [transactions, setTransactions] = useState<Transaction[]>(getTransactions());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formDescSelect, setFormDescSelect] = useState('');
  const [formDescCustom, setFormDescCustom] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');

  const carryForward = computeCarryForward(dateStr);
  const dayTotals = computeDayTotals(dateStr);
  const dayBalance = carryForward + dayTotals.net;

  const filteredTxns = transactions
    .filter((t) => t.date === dateStr && t.type === activeTab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const descriptions = activeTab === 'income' ? INCOME_DESCRIPTIONS : EXPENSE_DESCRIPTIONS;

  const openAdd = () => {
    setEditingTxn(null);
    setFormDate(selectedDate);
    setFormDescSelect('');
    setFormDescCustom('');
    setFormAmount('');
    setDialogOpen(true);
  };

  const openEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setFormDate(new Date(txn.date + 'T00:00:00'));
    const isPreset = (txn.type === 'income' ? INCOME_DESCRIPTIONS : EXPENSE_DESCRIPTIONS).includes(txn.description);
    setFormDescSelect(isPreset ? txn.description : 'Others');
    setFormDescCustom(isPreset ? '' : txn.description);
    setFormAmount(String(txn.amount));
    setFormCategory(txn.category);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const amount = parseFloat(formAmount);
    const finalDesc = formDescSelect === 'Others' ? formDescCustom.trim() : formDescSelect;
    if (!finalDesc || isNaN(amount) || amount <= 0 || !formCategory) return;

    if (editingTxn) {
      const updated = updateTransaction(editingTxn.id, {
        date: format(formDate, 'yyyy-MM-dd'),
        description: finalDesc,
        amount,
        category: formCategory,
      });
      setTransactions(updated);
    } else {
      const newTxn: Transaction = {
        id: crypto.randomUUID(),
        type: activeTab,
        amount,
        description: finalDesc,
        category: formCategory,
        date: format(formDate, 'yyyy-MM-dd'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = addTransaction(newTxn);
      setTransactions(updated);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      const updated = deleteTransaction(deletingId);
      setTransactions(updated);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(n);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Daily Expenses</h1>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <ThemeToggle />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Carry Forward</p>
                <p className={cn('text-xl font-bold', carryForward >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                  {formatCurrency(carryForward)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Today's Income</p>
                <p className="text-xl font-bold text-[hsl(var(--income))]">{formatCurrency(dayTotals.income)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Today's Expenses</p>
                <p className="text-xl font-bold text-[hsl(var(--expense))]">{formatCurrency(dayTotals.expense)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Day Balance</p>
                <p className={cn('text-xl font-bold', dayBalance >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                  {formatCurrency(dayBalance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Toggle + Add */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setActiveTab('income')}
                className={cn(
                  'px-5 py-2 text-sm font-medium transition-colors',
                  activeTab === 'income'
                    ? 'bg-[hsl(var(--income))] text-white'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                )}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={cn(
                  'px-5 py-2 text-sm font-medium transition-colors',
                  activeTab === 'expense'
                    ? 'bg-[hsl(var(--expense))] text-white'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                )}
              >
                Expense
              </button>
            </div>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add {activeTab === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No {activeTab} records for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTxns.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{format(new Date(txn.date + 'T00:00:00'), 'MMM dd')}</TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>{txn.category}</TableCell>
                      <TableCell className={cn('text-right font-medium', txn.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]')}>
                        {formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(txn)} className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(txn.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTxn ? 'Edit' : 'Add'} {activeTab === 'income' ? 'Income' : 'Expense'}</DialogTitle>
            <DialogDescription>Fill in the details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(formDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={(d) => d && setFormDate(d)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="What was this for?" />
            </div>
            <div className="space-y-2">
              <Label>Amount (LKR)</Label>
              <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingTxn ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>Are you sure you want to delete this transaction? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
