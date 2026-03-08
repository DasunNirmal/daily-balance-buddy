import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/database';
import { format } from 'date-fns';

export function generateReport(transactions: Transaction[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Henuka Fresh Fruits', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMMM dd, yyyy'), pageWidth - 14, 20, { align: 'right' });

  // Title centered
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Report', pageWidth / 2, 35, { align: 'center' });

  doc.setDrawColor(100);
  doc.line(14, 40, pageWidth - 14, 40);

  // Summary
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const fmt = (n: number) => `LKR ${n.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Income: ${fmt(totalIncome)}`, 14, 50);
  doc.text(`Total Expenses: ${fmt(totalExpense)}`, 14, 57);
  doc.setFont('helvetica', 'bold');
  doc.text(`Balance: ${fmt(balance)}`, 14, 64);

  // Table
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  autoTable(doc, {
    startY: 72,
    head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
    body: sorted.map((t) => [
      format(new Date(t.date + 'T00:00:00'), 'MMM dd, yyyy'),
      t.type === 'income' ? 'Income' : 'Expense',
      t.description,
      t.category,
      `${t.type === 'expense' ? '-' : '+'}${fmt(t.amount)}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 85, 51] },
    alternateRowStyles: { fillColor: [245, 245, 240] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Henuka Fresh Fruits - Generated on ${format(new Date(), 'PPP')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`HFF_Expense_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
