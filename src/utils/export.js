import jsPDF from 'jspdf';
import 'jspdf-autotable';

/* ══════════════════════════════════════════════
   CSV EXPORT
   ══════════════════════════════════════════════ */

/**
 * Export tickets to CSV.
 * Expects normalized ticket fields.
 */
export function exportToCSV(tickets, filename = 'tickets') {
  const headers = ['ID', 'Name', 'Email', 'Subject', 'Description', 'Status', 'Priority', 'Agent', 'Created At'];

  const rows = tickets.map((t) => [
    t.id,
    t.name,
    t.email,
    t.subject,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.status,
    t.priority,
    t.agent || 'Unassigned',
    t.createdAt,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════
   PDF EXPORT
   ══════════════════════════════════════════════ */

/**
 * Export tickets to PDF.
 * Expects normalized ticket fields.
 */
export function exportToPDF(tickets, filename = 'tickets') {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Title
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text('Ticket Management Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total tickets: ${tickets.length}`, 14, 34);

  // Table
  const headers = [['ID', 'Name', 'Subject', 'Status', 'Priority', 'Agent', 'Created']];

  const rows = tickets.map((t) => [
    String(t.id),
    t.name,
    (t.subject || '').substring(0, 40),
    t.status,
    t.priority,
    t.agent || 'Unassigned',
    t.createdAt,
  ]);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 40,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    styles: {
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [203, 213, 225],
    },
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
