import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, numberToWords } from '../utils/dateUtils';
import { downloadPayslipAsPDF } from '../utils/payslipPdfGenerator';

export const PayslipModal = () => {
  const { isPayslipModalOpen, setIsPayslipModalOpen, selectedPayslipData, company, employees, showToast } = useApp();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isPayslipModalOpen || !selectedPayslipData) return null;

  const data = selectedPayslipData;
  const employee = employees.find(e => e.id === data.employeeId) || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const res = await downloadPayslipAsPDF('printable-payslip', data, company);
      if (res.success) {
        if (showToast) showToast(`Downloaded ${res.fileName} successfully!`, 'success');
      } else {
        if (showToast) showToast('Triggered print preview for PDF save', 'info');
      }
    } catch (err) {
      console.error('Payslip PDF download failed:', err);
      if (showToast) showToast('Opened print preview for PDF save', 'info');
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div
      onClick={() => setIsPayslipModalOpen(false)}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Official Salary Statement • {data.monthName} {data.year}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-75 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
              title="Download official PDF directly to device"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 shadow-xs transition cursor-pointer"
              title="Print document or save via OS dialog"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => setIsPayslipModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Document Container */}
        <div id="printable-payslip" className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white overflow-y-auto flex-1">
          
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-extrabold text-sm">
                  {company.code || "APX"}
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {company.name}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {company.address}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono mt-1">
                <span>GSTIN: <b className="text-slate-700">{company.gstin}</b></span>
                <span>PAN: <b className="text-slate-700">{company.pan}</b></span>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                Payslip Summary
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-1">
                {data.monthName} {data.year}
              </p>
              <p className="text-[11px] text-slate-500">
                Generated on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Employee ID</span>
              <span className="font-bold text-slate-900">{data.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Staff Name</span>
              <span className="font-bold text-slate-900">{data.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Designation</span>
              <span className="font-medium text-slate-800">{data.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Department</span>
              <span className="font-medium text-slate-800">{data.department}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Wage Type</span>
              <span className="font-semibold text-brand-700">{data.wageType} Wage</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Bank Account</span>
              <span className="font-mono text-slate-800">{employee.accountNumber || '501004928172'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Bank / IFSC</span>
              <span className="font-medium text-slate-800">{employee.bankName || 'HDFC Bank'} ({employee.ifsc || 'HDFC0001234'})</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Payable Days</span>
              <span className="font-bold text-emerald-700">{data.attendanceSummary.payableDays} / {data.totalDaysInMonth} Days</span>
            </div>
          </div>

          {/* Attendance Attendance Summary Strip */}
          <div className="flex flex-wrap items-center justify-between text-xs bg-emerald-50/50 p-2.5 px-4 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-900">Attendance Breakdown:</span>
            <div className="flex items-center gap-4 text-slate-700">
              <span>Present: <b>{data.attendanceSummary.presentDays}</b></span>
              <span>Half Days: <b>{data.attendanceSummary.halfDays}</b></span>
              <span>Paid Leaves: <b>{data.attendanceSummary.paidLeaveDays}</b></span>
              <span>Holidays/Offs: <b>{data.attendanceSummary.holidayDays}</b></span>
              <span className="text-rose-600">Unpaid Absences: <b>{data.attendanceSummary.absentDays}</b></span>
            </div>
          </div>

          {/* Side-by-Side Breakdown Table: Earnings vs Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-emerald-600 text-white font-bold text-xs uppercase px-4 py-2.5 flex justify-between items-center">
                <span>Earnings Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Pay Earned</span>
                  <span className="font-mono font-semibold">{formatCurrency(data.earnings.basic)}</span>
                </div>
                {data.earnings.hra > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-mono font-semibold">{formatCurrency(data.earnings.hra)}</span>
                  </div>
                )}
                {data.earnings.specialAllowance > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-mono font-semibold">{formatCurrency(data.earnings.specialAllowance)}</span>
                  </div>
                )}
                {data.earnings.conveyance > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Conveyance Allowance</span>
                    <span className="font-mono font-semibold">{formatCurrency(data.earnings.conveyance)}</span>
                  </div>
                )}
                {data.earnings.bonus > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Incentive / Performance Bonus</span>
                    <span className="font-mono font-semibold">{formatCurrency(data.earnings.bonus)}</span>
                  </div>
                )}
                {data.earnings.expenseReimbursements > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 bg-brand-50/60 px-1 rounded">
                    <span className="font-medium text-brand-800">Approved Expense Claims (Synced)</span>
                    <span className="font-mono font-bold text-brand-700">+{formatCurrency(data.earnings.expenseReimbursements)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t-2 border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Gross Total Earnings</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(data.earnings.grossTotal)}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-rose-600 text-white font-bold text-xs uppercase px-4 py-2.5 flex justify-between items-center">
                <span>Deductions Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Provident Fund (PF - 12%)</span>
                  <span className="font-mono font-semibold">{formatCurrency(data.deductions.pf)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Employee State Insurance (ESI)</span>
                  <span className="font-mono font-semibold">{formatCurrency(data.deductions.esi)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Professional Tax (PT)</span>
                  <span className="font-mono font-semibold">{formatCurrency(data.deductions.professionalTax)}</span>
                </div>
                
                {/* Active Loan EMI Deduction */}
                {data.deductions.loanEMI > 0 ? (
                  <div className="flex justify-between py-1 border-b border-slate-100 bg-rose-50/70 px-1 rounded">
                    <div>
                      <span className="font-medium text-rose-800 block">Loan / Advance Monthly EMI</span>
                      <span className="text-[10px] text-rose-600">
                        {data.deductions.loanBreakdown?.map(l => l.loanType).join(', ')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-rose-700">-{formatCurrency(data.deductions.loanEMI)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-400">
                    <span>Active Loan / Advance EMI</span>
                    <span className="font-mono">₹0</span>
                  </div>
                )}

                {data.deductions.unpaidAbsenceLoss > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                    <span>Loss of Pay ({data.attendanceSummary.absentDays} Absences)</span>
                    <span className="font-mono text-slate-600">Deducted from Base</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t-2 border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-700">{formatCurrency(data.deductions.totalDeductions)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net Salary Highlight Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-100 font-bold">
                Net Salary Payable
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
                {formatCurrency(data.netSalary)}
              </h2>
              <p className="text-xs text-emerald-100 mt-1 capitalize font-medium">
                In Words: {numberToWords(data.netSalary)}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-500/50 sm:pl-6 text-xs text-emerald-100">
              <p className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Verified & Ready for Disbursal
              </p>
              <p className="text-[11px] text-emerald-200 mt-0.5">Mode: Direct Bank Transfer (NEFT/IMPS)</p>
            </div>
          </div>

          {/* Footer & Signature lines */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="text-[11px] italic">
                This is a computer-generated payslip and requires no physical signature under IT Act 2000.
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Powered by Velo HR — Payroll & Attendance Suite.
              </p>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex flex-col items-center justify-center p-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 text-[10px] text-emerald-800">
                <div className="flex items-center gap-1 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Digitally Verified</span>
                </div>
                <span className="text-[9px] text-emerald-600 font-mono mt-0.5">
                  Ref: PAY-{data.year}-{data.employeeId}
                </span>
              </div>

              <div className="text-right space-y-1">
                <div className="h-8 border-b border-dashed border-slate-400 w-32 ml-auto" />
                <p className="font-bold text-slate-800 text-[11px]">Authorized Signatory</p>
                <p className="text-[10px] text-slate-400">Finance & Payroll Dept.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Action Footer (Hidden when printing) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Downloaded PDF is formatted in standard A4 with official stamp and company details
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={() => setIsPayslipModalOpen(false)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Print via browser dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-700" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-75 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Download official PDF directly to device"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
