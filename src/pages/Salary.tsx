import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { Salary } from '@/types/database';
import { getSalaries, addSalary, updateSalary, deleteSalary } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import ThemeToggle from '@/components/ThemeToggle';

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<Salary[]>(getSalaries());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSal, setEditingSal] = useState<Salary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState<Date>(new Date());
  const [formDesc, setFormDesc] = useState('');

  const totalSalaries = salaries.reduce((s, sal) => s + sal.amount, 0);

  const openAdd = () => {
    setEditingSal(null);
    setFormName('');
    setFormAmount('');
    setFormDate(new Date());
    setFormDesc('');
    setDialogOpen(true);
  };

  const openEdit = (sal: Salary) => {
    setEditingSal(sal);
    setFormName(sal.employeeName);
    setFormAmount(String(sal.amount));
    setFormDate(new Date(sal.date + 'T00:00:00'));
    setFormDesc(sal.description);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const amount = parseFloat(formAmount);
    if (!formName.trim() || isNaN(amount) || amount <= 0) return;

    if (editingSal) {
      const updated = updateSalary(editingSal.id, {
        employeeName: formName.trim(),
        amount,
        date: format(formDate, 'yyyy-MM-dd'),
        description: formDesc.trim(),
      });
      setSalaries(updated);
    } else {
      const newSal: Salary = {
        id: crypto.randomUUID(),
        employeeName: formName.trim(),
        amount,
        date: format(formDate, 'yyyy-MM-dd'),
        description: formDesc.trim(),
        createdAt: new Date().toISOString(),
      };
      const updated = addSalary(newSal);
      setSalaries(updated);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      const updated = deleteSalary(deletingId);
      setSalaries(updated);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(n);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Salary Management</h1>
          <ThemeToggle />
        </header>

        <div className="p-6 space-y-6">
          <Card>
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Salaries Paid</p>
              <p className="text-2xl font-bold text-[hsl(var(--expense))]">{formatCurrency(totalSalaries)}</p>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Salary
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No salary records yet
                    </TableCell>
                  </TableRow>
                ) : (
                  [...salaries].sort((a, b) => b.date.localeCompare(a.date)).map((sal) => (
                    <TableRow key={sal.id}>
                      <TableCell>{format(new Date(sal.date + 'T00:00:00'), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">{sal.employeeName}</TableCell>
                      <TableCell>{sal.description}</TableCell>
                      <TableCell className="text-right font-medium text-[hsl(var(--expense))]">
                        {formatCurrency(sal.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(sal)} className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setDeletingId(sal.id); setDeleteDialogOpen(true); }} className="h-8 w-8 text-destructive hover:text-destructive">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSal ? 'Edit' : 'Add'} Salary</DialogTitle>
            <DialogDescription>Fill in the salary details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Employee name" />
            </div>
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
                  <Calendar mode="single" selected={formDate} onSelect={(d) => d && setFormDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Amount (LKR)</Label>
              <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="e.g. Monthly salary" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingSal ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Salary Record</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
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
