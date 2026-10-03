// Loan, Advances & Monthly EMI Management View
import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  History,
  CreditCard,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';

export const LoanManager = () => {
  const { loans, employees, setIsIssueLoanModalOpen, recordLoanRepayment, userRole, activeEmployeeId } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Closed'
  const [selectedLoanForRepayment, setSelectedLoanForRepayment] = useState(null);
  const [repaymentInput, setRepaymentInput] = useState('');

  // Scope to logged in staff member if employee role
  const scopedLoans = userRole === 'employee'
    ? loans.filter(l => l.employeeId === activeEmployeeId)
    : loans;

  // Aggregates
  const totalDisbursed = scopedLoans.reduce((acc, l) => acc + Number(l.amount || 0), 0);
  const totalRecovered = scopedLoans.reduce((acc, l) => acc + Number(l.totalPaid || 0), 0);
  const totalOutstanding = scopedLoans
    .filter(l => l.status === 'Active')
    .reduce((acc, l) => acc + Number(l.remainingAmount || 0), 0);
  const totalMonthlyEmi = scopedLoans
    .filter(l => l.status === 'Active')
    .reduce((acc, l) => acc + Number(l.monthlyEmi || 0), 0);

  const filteredLoans = scopedLoans.filter(loan => {
    const matchesSearch =
      loan.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      loan.loanType.toLowerCase().includes(search.toLowerCase()) ||
      (loan.reason && loan.reason.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && loan.status !== statusFilter) return false;
    return true;
  });

  const handleManualRepaymentSubmit = (e) => {
    e.preventDefault();
    if (!repaymentInput || Number(repaymentInput) <= 0 || !selectedLoanForRepayment) return;
    recordLoanRepayment(selectedLoanForRepayment.id, Number(repaymentInput), 'Direct Office Cash/Bank Payment');
    setSelectedLoanForRepayment(null);
    setRepaymentInput('');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Employee Loans & Automated EMI System
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" />
              Payroll Auto-Recovery
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issue emergency advances, configure automated monthly EMI deductions, and track real-time recovery ledgers
          </p>
        </div>

        {userRole !== 'employee' && (
          <button
            onClick={() => setIsIssueLoanModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition active:scale-95 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Loan / Advance</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Disbursed Loans
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(totalDisbursed)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{loans.length} Total issued</span>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Total Recovered Amount
          </span>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {formatCurrency(totalRecovered)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Via salary EMIs & repayments</span>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 sm:p-5 border border-purple-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
            Outstanding Principal
          </span>
          <div className="text-2xl font-black text-purple-800 font-mono mt-1">
            {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[11px] text-purple-700 mt-0.5 block">Active company receivables</span>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100 block">
            Current Monthly EMI Recovery
          </span>
          <div className="text-2xl font-black font-mono mt-1">
            {formatCurrency(totalMonthlyEmi)}
          </div>
          <span className="text-[11px] text-indigo-100 mt-0.5 block">Auto-deducted in this cycle</span>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        
        {/* Filters Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff, loan reason..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {['ALL', 'Active', 'Closed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Loan Ledger List */}
        <div className="divide-y divide-slate-100">
          {filteredLoans.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No loans found for this filter.
            </div>
          ) : (
            filteredLoans.map((loan) => {
              const emp = employees.find(e => e.id === loan.employeeId);
              const progress = Math.round((Number(loan.totalPaid) / Math.max(1, Number(loan.amount))) * 100);

              return (
                <div key={loan.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition space-y-4">
                  
                  {/* Top Line: Staff, Category, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp?.avatar}
                        alt={loan.employeeName}
                        className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{loan.employeeName}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {loan.id}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                          {loan.loanType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Principal</span>
                        <span className="text-base font-black font-mono text-slate-900">{formatCurrency(loan.amount)}</span>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        loan.status === 'Active'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Strip & Repayment Progress */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Repayment Model</span>
                        <span className="font-bold text-slate-800">{loan.repaymentType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Monthly EMI</span>
                        <span className="font-mono font-bold text-indigo-800">{formatCurrency(loan.monthlyEmi)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Recovered</span>
                        <span className="font-mono font-bold text-emerald-700">{formatCurrency(loan.totalPaid)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Remaining Balance</span>
                        <span className="font-mono font-bold text-rose-700">{formatCurrency(loan.remainingAmount)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Recovery Progress</span>
                        <span className="font-bold font-mono text-slate-700">{progress}% Repaid</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {loan.reason && (
                      <div className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200/60">
                        Reason: {loan.reason}
                      </div>
                    )}
                  </div>

                  {/* Actions & Repayment History */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Auto-deducts <b>{formatCurrency(loan.monthlyEmi)}</b> on monthly payslip</span>
                    </div>

                    {loan.status === 'Active' && (
                      <button
                        onClick={() => setSelectedLoanForRepayment(loan)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Record Manual Payment
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Manual Repayment Modal */}
      {selectedLoanForRepayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Record Direct Payment
            </h3>
            <p className="text-xs text-slate-500">
              {selectedLoanForRepayment.employeeName} • {selectedLoanForRepayment.loanType}
            </p>

            <form onSubmit={handleManualRepaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedLoanForRepayment.remainingAmount}
                  value={repaymentInput}
                  onChange={(e) => setRepaymentInput(e.target.value)}
                  placeholder={`Max ₹${selectedLoanForRepayment.remainingAmount}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanForRepayment(null)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
