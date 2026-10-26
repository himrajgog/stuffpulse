// Reports & Export Modal for Velo HR
import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  X,
  CreditCard,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMonthName } from '../utils/dateUtils';
import {
  downloadMonthlyAttendanceCSV,
  downloadPayrollSummaryCSV,
  downloadBankDisbursementCSV,
  downloadStatutoryComplianceCSV
} from '../utils/exportUtils';
import { calculateAllPayrolls } from '../utils/payrollEngine';

export const ReportsExportModal = ({ isOpen, onClose, defaultReport = 'payroll' }) => {
  const {
    employees,
    attendance,
    expenses,
    loans,
    company,
    selectedMonth,
    selectedYear,
    showToast,
    openPayslip
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState(defaultReport); // 'payroll' | 'attendance' | 'bank' | 'statutory' | 'payslip'
  const [reportMonth, setReportMonth] = useState(selectedMonth);
  const [reportYear, setReportYear] = useState(selectedYear);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');

  if (!isOpen) return null;

  const handleExport = () => {
    const monthName = getMonthName(reportMonth - 1);

    if (selectedReportType === 'payslip') {
      const emp = employees.find(e => e.id === selectedEmployeeId) || employees[0];
      if (emp) {
        openPayslip(emp, reportMonth, reportYear);
        showToast(`Loaded ${emp.name}'s payslip ready for PDF download!`, 'success');
      }
      onClose();
      return;
    }

    if (selectedReportType === 'attendance') {
      downloadMonthlyAttendanceCSV({
        employees,
        attendance,
        month: reportMonth,
        year: reportYear,
        companyName: company.brandName || 'Velo HR',
      });
      showToast(`Exported Monthly Attendance Register for ${monthName} ${reportYear}!`, 'success');
    } else {
      const payrollRecords = calculateAllPayrolls({
        employees,
        allAttendance: attendance,
        allExpenses: expenses,
        allLoans: loans,
        month: reportMonth,
        year: reportYear,
        policySettings: {
          pfRate: company.pfRate || 0.12,
          esiRate: company.esiRate || 0.0075,
          professionalTax: company.professionalTax || 200,
          ptThreshold: 15000,
        }
      });

      if (selectedReportType === 'payroll') {
        downloadPayrollSummaryCSV({
          payrollRecords,
          month: reportMonth,
          year: reportYear,
          companyName: company.brandName || 'Velo HR',
        });
        showToast(`Exported Payroll Summary Statement for ${monthName} ${reportYear}!`, 'success');
      } else if (selectedReportType === 'bank') {
        downloadBankDisbursementCSV({
          payrollRecords,
          employees,
          month: reportMonth,
          year: reportYear,
          companyName: company.brandName || 'Velo HR',
        });
        showToast(`Exported Bank Disbursement Batch for ${monthName} ${reportYear}!`, 'success');
      } else if (selectedReportType === 'statutory') {
        downloadStatutoryComplianceCSV({
          payrollRecords,
          employees,
          month: reportMonth,
          year: reportYear,
          companyName: company.brandName || 'Velo HR',
        });
        showToast(`Exported EPF & ESIC Compliance Statement for ${monthName} ${reportYear}!`, 'success');
      }
    }

    onClose();
  };

  const reportOptions = [
    {
      id: 'payroll',
      title: 'Full Monthly Payroll Statement',
      desc: 'All staff wages, basic, HRA, field allowances, statutory deductions, loan EMIs, and net payable salaries.',
      icon: FileSpreadsheet,
      badge: 'Most Popular',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'payslip',
      title: 'Individual Employee Payslip (PDF)',
      desc: 'Official monthly payslip with earnings, deductions, bank transfer advice, and digital verification seal.',
      icon: FileText,
      badge: 'Official PDF',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'attendance',
      title: 'Monthly Attendance Register',
      desc: 'Day-by-day punch statuses (Present, Half-Day, Leaves, Absences) and punch timestamps for every employee.',
      icon: Calendar,
      badge: 'Audit Sheet',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'bank',
      title: 'Corporate Bank Salary Batch Upload',
      desc: 'Pre-formatted NEFT/RTGS CSV compatible with HDFC, ICICI, SBI corporate banking bulk salary disbursement.',
      icon: CreditCard,
      badge: 'Bank Ready',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'statutory',
      title: 'EPF & ESIC Statutory Compliance Report',
      desc: 'Employee & employer contribution breakdown formatted for EPFO ECR returns and ESIC monthly filings.',
      icon: ShieldCheck,
      badge: 'Labor Law 2026',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Reports & Compliance Exports</h3>
              <p className="text-xs text-slate-500">Download formatted payroll statements and attendance ledgers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month & Year Filter Selection */}
        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Period:</span>
          <div className="flex items-center gap-2">
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m - 1)}
                </option>
              ))}
            </select>

            <select
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Member Selector (Shown if Payslip is selected) */}
        {selectedReportType === 'payslip' && (
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Staff Member:
            </span>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer sm:w-64"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation || 'Staff'} - {emp.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Report Type Selector List */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Statement Format
          </label>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {reportOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedReportType === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedReportType(opt.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{opt.title}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-slate-600">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-stone-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-slate-600 font-bold text-xs hover:bg-stone-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer ${
              selectedReportType === 'payslip'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-indigo-600/20'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{selectedReportType === 'payslip' ? 'View & Download Payslip PDF' : 'Download CSV Statement'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
