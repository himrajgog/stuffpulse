// Automated Payroll & Salary Calculation Engine View
import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Receipt,
  Landmark,
  FileSpreadsheet,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAllPayrolls } from '../utils/payrollEngine';
import { formatCurrency, getMonthName } from '../utils/dateUtils';
import { SubscriptionPaywall } from '../components/SubscriptionPaywall';

export const PayrollCalculator = () => {
  const {
    employees,
    attendance,
    expenses,
    loans,
    company,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    openPayslip,
    showToast,
    openReportsExport,
    isSubscriptionActive,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterWageType, setFilterWageType] = useState('ALL'); // 'ALL' | 'Monthly' | 'Daily'

  // Calculate batch payrolls
  const payrollRecords = useMemo(() => {
    return calculateAllPayrolls({
      employees,
      allAttendance: attendance,
      allExpenses: expenses,
      allLoans: loans,
      month: selectedMonth,
      year: selectedYear,
      policySettings: {
        pfRate: company.pfRate || 0.12,
        esiRate: company.esiRate || 0.0075,
        professionalTax: company.professionalTax || 200,
        ptThreshold: 15000,
      }
    });
  }, [employees, attendance, expenses, loans, company, selectedMonth, selectedYear]);

  // Aggregate Totals
  const totals = useMemo(() => {
    let grossTotal = 0;
    let netTotal = 0;
    let pfTotal = 0;
    let esiTotal = 0;
    let loanEmiTotal = 0;
    let reimbursementsTotal = 0;

    payrollRecords.forEach(p => {
      grossTotal += p.earnings.grossTotal;
      netTotal += p.netSalary;
      pfTotal += p.deductions.pf;
      esiTotal += p.deductions.esi;
      loanEmiTotal += p.deductions.loanEMI;
      reimbursementsTotal += p.earnings.expenseReimbursements;
    });

    return {
      grossTotal,
      netTotal,
      pfTotal,
      esiTotal,
      loanEmiTotal,
      reimbursementsTotal,
      statutoryTotal: pfTotal + esiTotal,
    };
  }, [payrollRecords]);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Filtered rows
  const filteredRecords = payrollRecords.filter(p => {
    const matchesSearch =
      p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      p.designation.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterWageType !== 'ALL' && p.wageType !== filterWageType) return false;
    return true;
  });

  // Export payroll summary to CSV
  const handleExportCSV = () => {
    const headers = [
      'Emp ID', 'Staff Name', 'Wage Type', 'Total Days', 'Payable Days',
      'Absent Days', 'Basic Earned', 'HRA', 'Allowances', 'Expense Reimbursements',
      'Gross Total', 'PF Deduction', 'ESI Deduction', 'PT', 'Loan EMI', 'Total Deductions', 'Net Salary'
    ];

    const rows = filteredRecords.map(p => [
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

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Summary_${getMonthName(selectedMonth - 1)}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported payroll spreadsheet summary to CSV!', 'success');
  };

  // WhatsApp Payslip Dispatch
  const handleWhatsAppPayslip = (emp, record) => {
    const rawPhone = emp?.phone || '';
    const phone = rawPhone.replace(/\D/g, '');
    const monthName = getMonthName(selectedMonth - 1);
    const summaryText = 
      `*VELO HR — Monthly Payslip Advice*\n` +
      `Dear ${record.employeeName},\n` +
      `Your automated payroll statement for *${monthName} ${selectedYear}* is generated:\n\n` +
      `• Gross Earnings: ${formatCurrency(record.earnings.grossTotal)}\n` +
      `• PF & ESI Deductions: -${formatCurrency(record.deductions.pf + record.deductions.esi + record.deductions.professionalTax)}\n` +
      `• Loan EMI Repayment: -${formatCurrency(record.deductions.loanEMI)}\n` +
      `• *Net Disbursed Pay: ${formatCurrency(record.netSalary)}*\n` +
      `• Days Payable: ${record.attendanceSummary.payableDays} / ${record.totalDaysInMonth}\n\n` +
      `View and download your official PDF payslip on the Velo HR portal.`;

    const encodedText = encodeURIComponent(summaryText);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
    window.open(waUrl, '_blank');
    showToast(`Launched WhatsApp payslip dispatch for ${record.employeeName}!`, 'success');
  };

  // Subscription Paywall Engine Gate
  if (!isSubscriptionActive()) {
    return (
      <div className="space-y-6 pb-20 lg:pb-10">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Automated Payroll & Salary Calculation Engine
              </h2>
              <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                Subscription Inactive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calculates payable days, deducts unpaid absences, includes active loan EMIs & approved expense reimbursements
            </p>
          </div>
        </div>

        <SubscriptionPaywall />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Top Banner & Month Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Automated Payroll & Salary Calculation Engine
            </h2>
            <span className="text-xs bg-brand-100 text-brand-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Formula Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculates payable days, deducts unpaid absences, includes active loan EMIs & approved expense reimbursements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 min-w-[120px] text-center text-slate-800">
              {getMonthName(selectedMonth - 1)} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk Reports & Export Modal Trigger */}
          <button
            onClick={() => openReportsExport('payroll')}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
            title="Download payroll summary, bank disbursement statement, or EPF/ESIC statutory files"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Reports & Export</span>
          </button>

          {/* Quick Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Quick CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Payroll KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Gross Wages</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(totals.grossTotal)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Includes Base + Allowances</span>
        </div>

        <div className="bg-gradient-to-br from-brand-600 to-emerald-700 text-white rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-100 block">Net Payout to Disburse</span>
          <div className="text-2xl font-black font-mono mt-1">
            {formatCurrency(totals.netTotal)}
          </div>
          <span className="text-[11px] text-brand-100 mt-0.5 block">After all deductions & EMIs</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">PF + ESI + PT Total</span>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {formatCurrency(totals.statutoryTotal)}
          </div>
          <span className="text-[11px] text-rose-500 mt-0.5 block">Statutory compliance deposit</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Loan EMIs Recovered</span>
          <div className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {formatCurrency(totals.loanEmiTotal)}
          </div>
          <span className="text-[11px] text-indigo-500 mt-0.5 block">Auto-deducted from salaries</span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        
        {/* Table Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee in payroll..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 w-56"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Model:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
              {['ALL', 'Monthly', 'Daily'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterWageType(type)}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterWageType === type ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Wage Model</th>
                <th className="py-3 px-3 text-center">Payable / Total Days</th>
                <th className="py-3 px-3 text-right">Earned Basic & HRA</th>
                <th className="py-3 px-3 text-right">Allowances & Bonus</th>
                <th className="py-3 px-3 text-right">Reimbursements</th>
                <th className="py-3 px-3 text-right">Gross Total</th>
                <th className="py-3 px-3 text-right">PF & ESI</th>
                <th className="py-3 px-3 text-right">Loan EMI</th>
                <th className="py-3 px-4 text-right">Net Payable Pay</th>
                <th className="py-3 px-4 text-center">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <Calculator className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-sm text-slate-800">
                        {employees.length === 0 ? 'No Employees in Workspace Yet' : 'No staff match the current payroll filter'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {employees.length === 0
                          ? 'Add staff members in the Directory to calculate automated monthly payroll, PF/ESI deductions, and printable payslips.'
                          : 'Try selecting a different wage model or search query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const empObj = employees.find(e => e.id === record.employeeId);
                  const allowancesSum = record.earnings.specialAllowance + record.earnings.conveyance + record.earnings.bonus;

                  return (
                    <tr key={record.employeeId} className="hover:bg-slate-50/70 transition">
                      {/* Staff Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={empObj?.avatar}
                            alt={record.employeeName}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{record.employeeName}</div>
                            <div className="text-[11px] text-slate-400">{record.designation}</div>
                          </div>
                        </div>
                      </td>

                      {/* Wage Model */}
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          record.wageType === 'Monthly'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {record.wageType}
                        </span>
                      </td>

                      {/* Payable Days */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-800 font-mono">
                          {record.attendanceSummary.payableDays} / {record.totalDaysInMonth}
                        </div>
                        {record.attendanceSummary.absentDays > 0 ? (
                          <div className="text-[10px] text-rose-500 font-semibold">
                            -{record.attendanceSummary.absentDays} Absences
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-semibold">100% Attendance</div>
                        )}
                      </td>

                      {/* Basic & HRA */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(record.earnings.basic + record.earnings.hra)}
                        </span>
                      </td>

                      {/* Allowances */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        +{formatCurrency(allowancesSum)}
                      </td>

                      {/* Approved Expense Reimbursements */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        {record.earnings.expenseReimbursements > 0 ? (
                          <span className="text-brand-700 font-bold bg-brand-50 px-1.5 py-0.5 rounded">
                            +{formatCurrency(record.earnings.expenseReimbursements)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Gross Total */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(record.earnings.grossTotal)}
                      </td>

                      {/* PF & ESI */}
                      <td className="py-3.5 px-3 text-right font-mono text-rose-600">
                        -{formatCurrency(record.deductions.pf + record.deductions.esi + record.deductions.professionalTax)}
                      </td>

                      {/* Active Loan EMI */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        {record.deductions.loanEMI > 0 ? (
                          <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                            -{formatCurrency(record.deductions.loanEMI)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Net Payable Pay */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl">
                          {formatCurrency(record.netSalary)}
                        </span>
                      </td>

                      {/* Generate Payslip & WhatsApp Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openPayslip(empObj, selectedMonth, selectedYear)}
                            title="View & Print PDF Payslip"
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-emerald-400" />
                            <span>Payslip</span>
                          </button>

                          <button
                            onClick={() => handleWhatsAppPayslip(empObj, record)}
                            title={`Send payslip summary via WhatsApp to ${empObj?.phone || 'staff'}`}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 text-white" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
