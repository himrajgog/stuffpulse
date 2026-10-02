// Bulk Data Exports & Compliance Reports Utility for Velo HR
import { getMonthName, getDaysArrayForMonth } from './dateUtils';

// Helper to trigger browser CSV download
const triggerDownload = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 1. Full Monthly Attendance Register Sheet (CSV)
 * Daily attendance, status, punches, total present/absent days
 */
export const downloadMonthlyAttendanceCSV = ({ employees = [], attendance = [], month, year, companyName = 'Velo HR' }) => {
  const days = getDaysArrayForMonth(year, month);
  const monthName = getMonthName(month - 1);

  // Headers: Emp ID, Staff Name, Designation, Department, [Day 1, Day 2, ...], Total Present, Half-Day, Leaves, Absences
  const dayHeaders = days.map(d => `${d.dayNumber} (${d.dayName})`);
  const headers = [
    'Employee ID',
    'Employee Name',
    'Designation',
    'Department',
    ...dayHeaders,
    'Total Present',
    'Half Days',
    'Paid Leaves',
    'Absences',
  ];

  const rows = employees.map(emp => {
    let present = 0;
    let half = 0;
    let leave = 0;
    let absent = 0;

    const dayCells = days.map(d => {
      const rec = attendance.find(a => a.employeeId === emp.id && a.date === d.dateString);
      if (!rec) {
        if (d.isWeekend) return 'WO'; // Weekly Off
        absent++;
        return 'A';
      }
      const st = rec.status;
      if (st === 'Present') {
        present++;
        return rec.punchIn ? `P (${rec.punchIn})` : 'P';
      }
      if (st === 'Half-Day') {
        half++;
        return 'HD';
      }
      if (st === 'Leave' || st === 'Paid Leave') {
        leave++;
        return 'L';
      }
      if (st === 'Holiday') {
        return 'H';
      }
      absent++;
      return 'A';
    });

    return [
      emp.id,
      `"${emp.name}"`,
      `"${emp.designation || 'Staff'}"`,
      `"${emp.department || 'General'}"`,
      ...dayCells,
      present,
      half,
      leave,
      absent,
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(`VeloHR_Attendance_${monthName}_${year}.csv`, csv);
};

/**
 * 2. Complete Monthly Payroll Summary Statement (CSV)
 * All wage earnings, statutory PF/ESI, PT, Loan EMIs, and Net Salary
 */
export const downloadPayrollSummaryCSV = ({ payrollRecords = [], month, year, companyName = 'Velo HR' }) => {
  const monthName = getMonthName(month - 1);

  const headers = [
    'Employee ID',
    'Employee Name',
    'Wage Model',
    'Days in Month',
    'Payable Days',
    'Absent Days',
    'Basic Salary',
    'HRA',
    'Allowances & Bonus',
    'Field Reimbursements',
    'Gross Earnings',
    'EPF (12%)',
    'ESIC (0.75%)',
    'Professional Tax',
    'Loan EMI Deduction',
    'Total Deductions',
    'Net Payable Salary'
  ];

  const rows = payrollRecords.map(p => [
    p.employeeId,
    `"${p.employeeName}"`,
    p.wageType,
    p.totalDaysInMonth,
    p.attendanceSummary.payableDays,
    p.attendanceSummary.absentDays,
    p.earnings.basic,
    p.earnings.hra,
    p.earnings.specialAllowance + p.earnings.conveyance + p.earnings.bonus,
    p.earnings.expenseReimbursements,
    p.earnings.grossTotal,
    p.deductions.pf,
    p.deductions.esi,
    p.deductions.professionalTax,
    p.deductions.loanEMI,
    p.deductions.totalDeductions,
    p.netSalary,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(`VeloHR_Payroll_Summary_${monthName}_${year}.csv`, csv);
};

/**
 * 3. Corporate Bank Salary Disbursement Batch File (CSV)
 * Pre-formatted for ICICI / HDFC / SBI Corporate Banking bulk upload
 */
export const downloadBankDisbursementCSV = ({ payrollRecords = [], employees = [], month, year, companyName = 'Velo HR' }) => {
  const monthName = getMonthName(month - 1);

  const headers = [
    'Beneficiary Name',
    'Account Number',
    'IFSC Code',
    'Bank Name',
    'Payout Amount',
    'Remarks / Narration',
    'Payment Mode',
  ];

  const rows = payrollRecords.map(p => {
    const emp = employees.find(e => e.id === p.employeeId);
    return [
      `"${p.employeeName}"`,
      `"${emp?.accountNumber || 'NOT-SET'}"`,
      `"${emp?.ifsc || 'HDFC0001234'}"`,
      `"${emp?.bankName || 'Bank'}"`,
      p.netSalary,
      `"Salary for ${monthName} ${year}"`,
      'NEFT/IMPS',
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(`VeloHR_Bank_Disbursement_${monthName}_${year}.csv`, csv);
};

/**
 * 4. Statutory EPF & ESIC Compliance Statement (CSV)
 * Formatted for Indian Labor Department and EPFO return filing
 */
export const downloadStatutoryComplianceCSV = ({ payrollRecords = [], employees = [], month, year, companyName = 'Velo HR' }) => {
  const monthName = getMonthName(month - 1);

  const headers = [
    'UAN Number',
    'Employee Name',
    'Gross Wages',
    'EPF Wages',
    'EE Share (12%)',
    'ER Share (3.67%)',
    'EPS Share (8.33%)',
    'IP Number (ESIC)',
    'ESIC Employee Share (0.75%)',
    'ESIC Employer Share (3.25%)',
  ];

  const rows = payrollRecords.map(p => {
    const emp = employees.find(e => e.id === p.employeeId);
    const basic = p.earnings.basic;
    const epfWages = Math.min(15000, basic);
    const eeShare = p.deductions.pf;
    const erShare = Math.round(epfWages * 0.0367);
    const epsShare = Math.round(epfWages * 0.0833);
    const esiGross = p.earnings.grossTotal;
    const esiEE = p.deductions.esi;
    const esiER = Math.round(esiGross * 0.0325);

    return [
      `"${emp?.uan || '101234567890'}"`,
      `"${p.employeeName}"`,
      p.earnings.grossTotal,
      epfWages,
      eeShare,
      erShare,
      epsShare,
      `"${emp?.esiNumber || '3123456789'}"`,
      esiEE,
      esiER,
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(`VeloHR_Statutory_Compliance_EPF_ESIC_${monthName}_${year}.csv`, csv);
};
