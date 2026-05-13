import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utility for exporting data to different formats (CSV, PDF)
 */

export type ExportFormat = 'csv' | 'pdf';

interface ExportColumn {
  header: string;
  key: string;
  render?: (item: any) => string;
}

interface ExportOptions {
  filename: string;
  columns: ExportColumn[];
  data: any[];
  format: ExportFormat;
}

/**
 * Exports data to CSV format
 */
const exportToCSV = (filename: string, columns: ExportColumn[], data: any[]) => {
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');
  
  const rows = data.map(item => {
    return columns.map(col => {
      let value;
      if (col.render) {
        value = col.render(item);
      } else {
        value = item[col.key];
      }
      
      // Escape quotes and wrap in quotes
      const stringValue = value !== null && value !== undefined ? String(value) : '';
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports data to PDF format
 */
const exportToPDF = async (filename: string, columns: ExportColumn[], data: any[]) => {
  const doc = new jsPDF();
  
  const tableHeaders = [columns.map(col => col.header)];
  const tableData = data.map(item => 
    columns.map(col => {
      if (col.render) {
        return col.render(item);
      }
      return item[col.key] !== null && item[col.key] !== undefined ? String(item[col.key]) : '';
    })
  );

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [40, 101, 227] }, // Primary color
  });

  // Add title
  doc.setFontSize(16);
  doc.text(filename, 14, 15);

  doc.save(`${filename}.pdf`);
};

/**
 * Main export function
 */
export const exportReport = async (options: ExportOptions) => {
  const { filename, columns, data, format } = options;

  if (format === 'csv') {
    exportToCSV(filename, columns, data);
  } else if (format === 'pdf') {
    await exportToPDF(filename, columns, data);
  }
};
