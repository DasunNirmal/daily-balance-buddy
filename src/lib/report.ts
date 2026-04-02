import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/database';
import { format } from 'date-fns';
import { computeCarryForward } from '@/lib/storage';

// Brand colors
const GREEN: [number, number, number] = [34, 100, 54];
const DARK: [number, number, number] = [30, 30, 30];
const ACCENT: [number, number, number] = [220, 120, 60];

export function generateReport(transactions: Transaction[], dateFrom?: string, dateTo?: string) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();

  // === Green header bar ===
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pw, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Henuka Fresh Fruits', 14, 14);

  const rangeLabel = dateFrom && dateTo
    ? `${format(new Date(dateFrom + 'T00:00:00'), 'MMM dd, yyyy')} - ${format(new Date(dateTo + 'T00:00:00'), 'MMM dd, yyyy')}`
    : dateFrom
    ? `From ${format(new Date(dateFrom + 'T00:00:00'), 'MMM dd, yyyy')}`
    : dateTo
    ? `Until ${format(new Date(dateTo + 'T00:00:00'), 'MMM dd, yyyy')}`
    : 'All Time';

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, pw - 14, 10, { align: 'right' });

  doc.setFontSize(10);
  doc.text(`Period: ${rangeLabel}`, pw - 14, 18, { align: 'right' });

  doc.setFontSize(9);
  doc.text('Expense Report', pw - 14, 24, { align: 'right' });

  // === Summary section ===
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Compute carry forward for today
  const today = format(new Date(), 'yyyy-MM-dd');
  const carryForward = computeCarryForward(today);

  const fmt = (n: number) => `LKR ${n.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  // === Carry Forward box (top, full width) ===
  const cfY = 36;
  const cfW = pw - 28;
  doc.setFillColor(245, 247, 245);
  doc.roundedRect(14, cfY, cfW, 22, 2, 2, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(14, cfY, cfW, 2.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Carry Forward (Opening Balance)', 18, cfY + 9);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT);
  doc.text(fmt(carryForward), 18, cfY + 18);

  // === Transaction Table ===
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  autoTable(doc, {
    startY: cfY + 30,
    head: [['Date', 'Type', 'Description', 'Category', 'Amount']],
    body: sorted.map((t) => [
      format(new Date(t.date + 'T00:00:00'), 'MMM dd, yyyy'),
      t.type === 'income' ? 'Income' : 'Expense',
      t.description,
      t.category,
      `${t.type === 'expense' ? '-' : '+'}${fmt(t.amount)}`,
    ]),
    styles: { fontSize: 8.5, cellPadding: 3, textColor: DARK },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 245] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 20 },
      4: { halign: 'right', cellWidth: 32 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = data.cell.raw as string;
        data.cell.styles.textColor = val === 'Income' ? GREEN : ACCENT;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.raw as string;
        data.cell.styles.textColor = val.startsWith('+') ? GREEN : ACCENT;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // === Bottom Summary (Income, Expenses, Net Balance) ===
  const lastPage = (doc as any).internal.getNumberOfPages();
  doc.setPage(lastPage);
  const tableEndY = (doc as any).lastAutoTable.finalY || 100;
  const sumY = tableEndY + 10;
  const boxW = (pw - 38) / 3;
  const bottomBoxes = [
    { label: 'Total Income', value: fmt(totalIncome), color: GREEN },
    { label: 'Total Expenses', value: fmt(totalExpense), color: ACCENT },
    { label: 'Net Balance', value: fmt(balance), color: balance >= 0 ? GREEN : ACCENT },
  ];

  bottomBoxes.forEach((box, i) => {
    const x = 14 + i * (boxW + 5);
    doc.setFillColor(245, 247, 245);
    doc.roundedRect(x, sumY, boxW, 22, 2, 2, 'F');
    doc.setFillColor(...box.color);
    doc.rect(x, sumY, boxW, 2.5, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(box.label, x + 4, sumY + 9);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...box.color);
    doc.text(box.value, x + 4, sumY + 17);
  });

  // === Footer on every page ===
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    // Footer line
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.line(14, ph - 14, pw - 14, ph - 14);
    // Footer text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Henuka Fresh Fruits', 14, ph - 9);
    doc.text(`Page ${i} of ${pageCount}`, pw - 14, ph - 9, { align: 'right' });
  }

  doc.save(`HFF_Expense_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
