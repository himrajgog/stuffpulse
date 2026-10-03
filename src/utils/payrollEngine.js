// Automated Payroll & Salary Calculation Engine
import { getDaysInMonth } from './dateUtils';

/**
 * Calculates detailed payroll metrics for a single employee for a given month and year.
 * 
 * @param {Object} employee - Employee object with wageType, baseSalary/dailyRate, allowances, deductions
 * @param {Array} attendanceRecords - List of attendance records for this employee in the month
 * @param {Array} approvedExpenses - List of approved expense claims for this employee in the month
 * @param {Array} activeLoans - Active loans with monthly EMI deductions for this employee
 * @param {number} month - 1-indexed month (1-12)
 * @param {number} year - Full year e.g. 2026
 * @param {Object} policySettings - Global policy settings for PF, ESI, PT
 */
export const calculateEmployeePayroll = ({
  employee,
  attendanceRecords = [],
  approvedExpenses = [],
  activeLoans = [],
  month,
  year,
  policySettings = {
    pfRate: 0.12, // 12% of basic
    esiRate: 0.0075, // 0.75% of gross
    professionalTax: 200,
    ptThreshold: 15000,
  }
}) => {
  const totalDaysInMonth = getDaysInMonth(year, month);
  
  // 1. Tally Attendance Days
  let presentDays = 0;
  let lateArrivalDays = 0;
  let halfDays = 0;
  let paidLeaveDays = 0;
  let absentDays = 0;
  let holidayDays = 0;

  // Map attendance by date string for lookup
  const attendanceMap = {};
  attendanceRecords.forEach(rec => {
    attendanceMap[rec.date] = rec.status;
  });

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const isSunday = dateObj.getDay() === 0;

    const status = attendanceMap[dateStr];

    if (status === 'Present' || status === 'Late') {
      presentDays++;
      if (status === 'Late') lateArrivalDays++;
    } else if (status === 'Half-Day') {
      halfDays++;
    } else if (status === 'Leave' || status === 'Paid Leave') {
      paidLeaveDays++;
    } else if (status === 'Absent') {
      absentDays++;
    } else if (status === 'Holiday') {
      holidayDays++;
    } else if (isSunday) {
      // Default treat Sunday as paid weekly off if not marked absent
      holidayDays++;
    } else {
      // Unrecorded working day: default to Present for historic demo, or Absent
      // If date is in the future, don't count as absent
      const today = new Date();
      if (dateObj > today) {
        // future day, assume scheduled working day
        presentDays++;
      } else {
        absentDays++;
      }
    }
  }

  // Effective Payable Days: Present + Paid Leaves + Holidays + (Half-days * 0.5)
  const payableDays = Math.min(
    totalDaysInMonth,
    presentDays + paidLeaveDays + holidayDays + (halfDays * 0.5)
  );

  const isDailyWage = employee.wageType === 'Daily';
  const baseSalary = Number(employee.baseSalary || 0);
  const dailyRate = Number(employee.dailyRate || 0);

  // Daily rate for monthly employees
  const derivedDailyRate = isDailyWage ? dailyRate : (baseSalary / totalDaysInMonth);

  // 2. Earnings Calculations
  let basicSalaryEarned = 0;
  let hraEarned = 0;
  let specialAllowance = Number(employee.allowances?.special || 0);
  let conveyanceAllowance = Number(employee.allowances?.conveyance || 0);
  let performanceBonus = Number(employee.bonus || 0);

  // Unpaid absence deduction
  let unpaidAbsenceDeduction = 0;

  if (isDailyWage) {
    basicSalaryEarned = Math.round(dailyRate * payableDays);
    hraEarned = 0;
    unpaidAbsenceDeduction = Math.round(dailyRate * absentDays);
  } else {
    // Monthly wage: Standard basic + HRA
    const fullBasic = baseSalary * 0.50; // 50% Basic
    const fullHRA = baseSalary * 0.30;   // 30% HRA
    const otherFixed = baseSalary * 0.20; // 20% Special/Other

    // Proportionate earned based on payable days
    basicSalaryEarned = Math.round((fullBasic / totalDaysInMonth) * payableDays);
    hraEarned = Math.round((fullHRA / totalDaysInMonth) * payableDays);
    specialAllowance = Math.round((otherFixed / totalDaysInMonth) * payableDays) + Number(employee.allowances?.special || 0);

    // Explicit loss of pay calculation for absent days
    unpaidAbsenceDeduction = Math.round((baseSalary / totalDaysInMonth) * absentDays);
  }

  // Expense Reimbursements (approved claims added to this month's payout)
  const approvedExpenseTotal = approvedExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0), 0
  );

  const grossEarnings = Math.round(
    basicSalaryEarned +
    hraEarned +
    specialAllowance +
    conveyanceAllowance +
    performanceBonus +
    approvedExpenseTotal
  );

  // 3. Statutory & Custom Deductions
  // PF: Typically 12% of basic earned (if eligible)
  const isPFEligible = employee.isPFEligible ?? true;
  const pfDeduction = isPFEligible
    ? Math.round(basicSalaryEarned * (policySettings.pfRate || 0.12))
    : 0;

  // ESI: Typically 0.75% of gross earnings (if gross <= 21000 and eligible)
  const isESIEligible = employee.isESIEligible ?? (grossEarnings <= 21000);
  const esiDeduction = isESIEligible
    ? Math.round(grossEarnings * (policySettings.esiRate || 0.0075))
    : 0;

  // Professional Tax (standard slab)
  let professionalTax = 0;
  if (grossEarnings >= (policySettings.ptThreshold || 15000)) {
    professionalTax = policySettings.professionalTax || 200;
  }

  // Active Loan EMI Deductions
  let totalLoanEMIDeduction = 0;
  const applicableLoanDeductions = [];

  activeLoans.forEach(loan => {
    // Check if loan is active and within repayment dates or has remaining balance
    if (loan.status === 'Active' && loan.remainingAmount > 0) {
      let emiToDeduct = 0;
      if (loan.repaymentType === 'One-Time') {
        emiToDeduct = Math.min(loan.remainingAmount, loan.amount);
      } else {
        emiToDeduct = Math.min(loan.remainingAmount, Number(loan.monthlyEmi || 0));
      }
      
      if (emiToDeduct > 0) {
        totalLoanEMIDeduction += emiToDeduct;
        applicableLoanDeductions.push({
          loanId: loan.id,
          loanType: loan.loanType || 'Employee Loan',
          emiAmount: emiToDeduct,
          remainingBefore: loan.remainingAmount,
          remainingAfter: loan.remainingAmount - emiToDeduct,
        });
      }
    }
  });

  const otherDeductions = Number(employee.deductions?.other || 0);

  const totalDeductions = Math.round(
    pfDeduction +
    esiDeduction +
    professionalTax +
    totalLoanEMIDeduction +
    otherDeductions
  );

  // 4. Net Payable Salary
  const netSalary = Math.max(0, grossEarnings - totalDeductions);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    designation: employee.designation,
    department: employee.department,
    wageType: employee.wageType,
    baseSalary,
    dailyRate: derivedDailyRate,
    month,
    year,
    monthName: new Date(year, month - 1).toLocaleString('en-US', { month: 'long' }),
    totalDaysInMonth,
    attendanceSummary: {
      presentDays,
      lateArrivalDays,
      halfDays,
      paidLeaveDays,
      holidayDays,
      absentDays,
      payableDays: Number(payableDays.toFixed(1)),
    },
    earnings: {
      basic: basicSalaryEarned,
      hra: hraEarned,
      specialAllowance,
      conveyance: conveyanceAllowance,
      bonus: performanceBonus,
      expenseReimbursements: approvedExpenseTotal,
      grossTotal: grossEarnings,
    },
    deductions: {
      pf: pfDeduction,
      esi: esiDeduction,
      professionalTax,
      loanEMI: totalLoanEMIDeduction,
      loanBreakdown: applicableLoanDeductions,
      unpaidAbsenceLoss: unpaidAbsenceDeduction,
      other: otherDeductions,
      totalDeductions,
    },
    netSalary,
    calculatedAt: new Date().toISOString(),
  };
};

/**
 * Calculates payroll for all employees in batch.
 */
export const calculateAllPayrolls = ({
  employees = [],
  allAttendance = [],
  allExpenses = [],
  allLoans = [],
  month,
  year,
  policySettings,
}) => {
  return employees.map(emp => {
    const empAttendance = allAttendance.filter(a => a.employeeId === emp.id);
    const empExpenses = allExpenses.filter(e => 
      e.employeeId === emp.id && 
      e.status === 'Approved' && 
      e.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)
    );
    const empLoans = allLoans.filter(l => l.employeeId === emp.id && l.status === 'Active');

    return calculateEmployeePayroll({
      employee: emp,
      attendanceRecords: empAttendance,
      approvedExpenses: empExpenses,
      activeLoans: empLoans,
      month,
      year,
      policySettings,
    });
  });
};
