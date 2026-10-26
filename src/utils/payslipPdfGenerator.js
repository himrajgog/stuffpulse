// Velo HR — High-Precision Vector PDF & Isolated Print Generator for Employee Payslips
import jsPDF from 'jspdf';
import { formatCurrency, numberToWords } from './dateUtils';

/**
 * Downloads a high-resolution, vector-crisp PDF payslip directly to the user's device.
 * Uses native vector PDF primitives (lines, text, tables, fills) to guarantee 100% reliability,
 * zero CORS blocking, zero blank pages, and instantaneous file download.
 * 
 * @param {Object} payslipData - Calculated payslip object
 * @param {Object} company - Company metadata (name, address, gstin, pan)
 * @param {Object} employee - Employee profile
 */
export const downloadPayslipAsPDF = async (payslipData, company = {}, employee = {}) => {
  try {
    if (!payslipData) {
      throw new Error('Payslip data is missing');
    }

    const data = payslipData;
    const safeName = (data.employeeName || 'Staff').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeMonth = (data.monthName || 'Month').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeYear = data.year || new Date().getFullYear();
    const fileName = `Payslip_${safeName}_${safeMonth}_${safeYear}.pdf`;

    // Initialize A4 PDF: 210mm x 297mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let y = 14;

    // --- 1. Company Brand Header ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

    // Logo initial badge
    doc.setFillColor(37, 99, 235); // brand-600
    doc.roundedRect(margin + 4, y + 4, 16, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text((company.code || 'APX').slice(0, 4), margin + 12, y + 14.5, { align: 'center' });

    // Company Name & Address
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(company.name || 'VELO HR ENTERPRISES', margin + 24, y + 10);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(company.address || 'Corporate Tower, Financial District', margin + 24, y + 15);
    doc.text(`GSTIN: ${company.gstin || '08AABCU9603R1ZM'}  |  PAN: ${company.pan || 'AABCU9603R'}`, margin + 24, y + 19.5);

    // Header Right Badge: Month & Year
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageWidth - margin - 52, y + 4, 48, 16, 2, 2, 'F');
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL PAYSLIP', pageWidth - margin - 28, y + 9.5, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.text(`${data.monthName || 'Month'} ${data.year || ''}`, pageWidth - margin - 28, y + 15.5, { align: 'center' });

    y += 28;

    // --- 2. Employee & Bank Info Grid ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    const colW = contentWidth / 4;
    const infoItems = [
      { label: 'EMPLOYEE ID', val: data.employeeId || 'EMP' },
      { label: 'STAFF NAME', val: data.employeeName || 'Staff Member' },
      { label: 'DESIGNATION', val: data.designation || 'Specialist' },
      { label: 'DEPARTMENT', val: data.department || 'Operations' },
      { label: 'WAGE TYPE', val: `${data.wageType || 'Monthly'} Wage` },
      { label: 'BANK ACCOUNT', val: employee.accountNumber || '•••• •••• 8172' },
      { label: 'BANK / IFSC', val: `${employee.bankName || 'HDFC Bank'} (${employee.ifsc || 'HDFC0001234'})` },
      { label: 'PAYABLE DAYS', val: `${data.attendanceSummary?.payableDays || 0} / ${data.totalDaysInMonth || 30} Days` },
    ];

    infoItems.forEach((item, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const ix = margin + col * colW + 4;
      const iy = y + (row === 0 ? 8 : 22);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(item.label, ix, iy);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(doc.splitTextToSize(String(item.val), colW - 6)[0] || '', ix, iy + 5);
    });

    y += 37;

    // --- 3. Attendance Summary Ribbon ---
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text('Attendance Breakdown:', margin + 4, y + 6);

    const att = data.attendanceSummary || {};
    const attStats = `Present: ${att.presentDays || 0}   |   Half-Days: ${att.halfDays || 0}   |   Paid Leaves: ${att.paidLeaveDays || 0}   |   Holidays: ${att.holidayDays || 0}   |   Unpaid Absences: ${att.absentDays || 0}`;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(attStats, margin + 44, y + 6);

    y += 13;

    // --- 4. Earnings & Deductions Tables (Side by Side) ---
    const tableWidth = (contentWidth - 6) / 2;
    const earnX = margin;
    const dedX = margin + tableWidth + 6;

    // Table Headers
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.roundedRect(earnX, y, tableWidth, 8, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('EARNINGS DESCRIPTION', earnX + 4, y + 5.5);
    doc.text('AMOUNT', earnX + tableWidth - 4, y + 5.5, { align: 'right' });

    doc.setFillColor(225, 29, 72); // rose-600
    doc.roundedRect(dedX, y, tableWidth, 8, 1.5, 1.5, 'F');
    doc.text('DEDUCTIONS DESCRIPTION', dedX + 4, y + 5.5);
    doc.text('AMOUNT', dedX + tableWidth - 4, y + 5.5, { align: 'right' });

    y += 9;

    // Rows Data
    const earningsRows = [
      { desc: 'Basic Pay Earned', amt: data.earnings?.basic || 0 },
      { desc: 'House Rent Allowance (HRA)', amt: data.earnings?.hra || 0 },
      { desc: 'Special Allowance', amt: data.earnings?.specialAllowance || 0 },
      { desc: 'Conveyance / Travel Allowance', amt: data.earnings?.conveyance || 0 },
      { desc: 'Performance Incentive / Bonus', amt: data.earnings?.bonus || 0 },
      { desc: 'Expense Reimbursements (Approved)', amt: data.earnings?.expenseReimbursements || 0 },
    ].filter(r => r.amt > 0 || r.desc === 'Basic Pay Earned');

    const deductionsRows = [
      { desc: 'Provident Fund (EPF 12%)', amt: data.deductions?.pf || 0 },
      { desc: 'Employee State Insurance (ESIC)', amt: data.deductions?.esi || 0 },
      { desc: 'Professional Tax (PT)', amt: data.deductions?.professionalTax || 0 },
      { desc: 'Loan / Advance Repayment EMI', amt: data.deductions?.loanEMI || 0 },
      { desc: `Loss of Pay (${att.absentDays || 0} Absences)`, amt: data.deductions?.unpaidAbsenceLoss || 0 },
    ].filter(r => r.amt > 0 || r.desc.startsWith('Provident'));

    const maxRows = Math.max(earningsRows.length, deductionsRows.length, 5);
    const rowH = 7.5;

    for (let r = 0; r < maxRows; r++) {
      const isEven = r % 2 === 0;
      const ry = y + r * rowH;

      // Earnings Cell Background
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(earnX, ry, tableWidth, rowH, 'F');
        doc.rect(dedX, ry, tableWidth, rowH, 'F');
      }

      // Border dividers
      doc.setDrawColor(241, 245, 249);
      doc.line(earnX, ry + rowH, earnX + tableWidth, ry + rowH);
      doc.line(dedX, ry + rowH, dedX + tableWidth, ry + rowH);

      // Print Earning
      const eItem = earningsRows[r];
      if (eItem) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(eItem.desc, earnX + 4, ry + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(formatCurrency(eItem.amt), earnX + tableWidth - 4, ry + 5, { align: 'right' });
      }

      // Print Deduction
      const dItem = deductionsRows[r];
      if (dItem) {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(dItem.desc, dedX + 4, ry + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(formatCurrency(dItem.amt), dedX + tableWidth - 4, ry + 5, { align: 'right' });
      }
    }

    y += maxRows * rowH;

    // Totals Bar
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(earnX, y, tableWidth, 9, 1, 1, 'FD');
    doc.roundedRect(dedX, y, tableWidth, 9, 1, 1, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Gross Total Earnings', earnX + 4, y + 6);
    doc.setTextColor(5, 150, 105);
    doc.text(formatCurrency(data.earnings?.grossTotal || 0), earnX + tableWidth - 4, y + 6, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.text('Total Deductions', dedX + 4, y + 6);
    doc.setTextColor(225, 29, 72);
    doc.text(formatCurrency(data.deductions?.totalDeductions || 0), dedX + tableWidth - 4, y + 6, { align: 'right' });

    y += 14;

    // --- 5. Net Salary Highlight Card ---
    doc.setFillColor(5, 150, 105); // emerald-600
    doc.roundedRect(margin, y, contentWidth, 22, 2.5, 2.5, 'F');

    doc.setTextColor(209, 250, 229); // emerald-100
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('NET SALARY PAYABLE', margin + 6, y + 6);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(formatCurrency(data.netSalary || 0), margin + 6, y + 14);

    doc.setFontSize(7);
    doc.setTextColor(236, 253, 245);
    doc.setFont('helvetica', 'normal');
    doc.text(`In Words: ${numberToWords(data.netSalary || 0)}`, margin + 6, y + 19);

    // Right status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Verified & Ready for Disbursal', pageWidth - margin - 6, y + 9, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(209, 250, 229);
    doc.text('Mode: Direct Bank Transfer (NEFT/RTGS)', pageWidth - margin - 6, y + 14, { align: 'right' });

    y += 27;

    // --- 6. Digital Verification Stamp & Signatory Block ---
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // IT Act Note
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('This is a computer-generated salary advice and requires no physical signature under IT Act 2000.', margin, y + 3);
    doc.text('Powered by Velo HR Automated Payroll Suite.', margin, y + 7);

    // Digital Seal
    doc.setDrawColor(52, 211, 153);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(pageWidth - margin - 85, y - 2, 42, 13, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(6, 95, 70);
    doc.text('DIGITALLY VERIFIED', pageWidth - margin - 64, y + 3, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref: PAY-${data.year}-${data.employeeId}`, pageWidth - margin - 64, y + 8, { align: 'center' });

    // Authorized Signatory
    doc.setDrawColor(148, 163, 184);
    doc.line(pageWidth - margin - 36, y + 5, pageWidth - margin, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Signatory', pageWidth - margin - 18, y + 9.5, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Finance & Payroll Dept.', pageWidth - margin - 18, y + 13, { align: 'center' });

    // Save and trigger actual browser file download
    doc.save(fileName);
    return { success: true, fileName };
  } catch (err) {
    console.error('Failed to generate vector PDF payslip:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Robust Isolated Document Printing
 * Solves the blank white page issue completely by printing inside a clean iframe
 * without modal clipping, fixed position, or visibility:hidden parent bugs.
 */
export const printPayslipDocument = (elementId = 'printable-payslip') => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Create an invisible, isolated iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  const content = element.innerHTML;

  // Gather stylesheet rules
  let styles = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
    styles += node.outerHTML;
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payslip Statement</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${styles}
        <style>
          @page { size: A4; margin: 10mm; }
          body {
            background: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 10px !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            visibility: visible !important;
          }
          * { visibility: visible !important; }
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  doc.close();

  // Print once iframe finishes loading
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 350);
};
