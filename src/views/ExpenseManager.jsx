// Field Expense Management & Admin Approvals Module
import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Filter,
  Search,
  Calendar,
  AlertCircle,
  TrendingDown,
  Sparkles,
  CreditCard,
  Building,
  Check,
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';

export const ExpenseManager = () => {
  const {
    expenses,
    employees,
    approveExpense,
    rejectExpense,
    deleteExpense,
    setIsAddExpenseModalOpen,
    setReceiptPreviewUrl,
    userRole,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Approved' | 'Rejected'
  const [search, setSearch] = useState('');
  const [reviewNote, setReviewNote] = useState({});

  // Summary Metrics
  const totalGivenAdvance = employees.reduce((sum, e) => sum + Number(e.givenAdvanceFloat || 0), 0);
  const totalApproved = expenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalPending = expenses
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalClaims = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Filtered expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      exp.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase()) ||
      exp.remarks.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && exp.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = (expId) => {
    const note = reviewNote[expId] || 'Approved by Management';
    approveExpense(expId, note);
  };

  const handleReject = (expId) => {
    const note = reviewNote[expId] || 'Claim rejected: receipts or policy non-compliant';
    rejectExpense(expId, note);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Field Expense Management & Approvals
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              Payroll Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track field petrol & client expenses, review attached bills, and automatically sync approved payouts to monthly salaries
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/25 transition active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Expense</span>
        </button>
      </div>

      {/* Float vs Claims Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Given Advance Float */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Given Advance Float (Cash Float)
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(totalGivenAdvance)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Working capital issued to field staff
          </span>
        </div>

        {/* Pending Claims */}
        <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Pending Admin Review
          </span>
          <div className="text-2xl font-black text-amber-800 font-mono mt-1">
            {formatCurrency(totalPending)}
          </div>
          <span className="text-[11px] text-amber-700 mt-0.5 block">
            {expenses.filter(e => e.status === 'Pending').length} Claims awaiting action
          </span>
        </div>

        {/* Approved to Sync */}
        <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-card">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Approved (Synced to Payroll)
          </span>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {formatCurrency(totalApproved)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">
            Added to monthly employee payslips
          </span>
        </div>

        {/* Net Outstanding Float */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
            Net Float Balance Remaining
          </span>
          <div className="text-2xl font-black font-mono mt-1">
            {formatCurrency(Math.max(0, totalGivenAdvance - totalApproved))}
          </div>
          <span className="text-[11px] text-slate-300 mt-0.5 block">
            Given Float minus verified expenses
          </span>
        </div>

      </div>

      {/* Staff Given Float Breakdown Quick Drawer */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Employee Float Advance Ledger ("Given Amount" vs. "Claimed")
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.filter(e => e.givenAdvanceFloat > 0).map(emp => {
            const empApprovedExpenses = expenses
              .filter(e => e.employeeId === emp.id && e.status === 'Approved')
              .reduce((s, e) => s + e.amount, 0);
            const remainingFloat = Math.max(0, emp.givenAdvanceFloat - empApprovedExpenses);

            return (
              <div key={emp.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" />
                  <div>
                    <div className="font-bold text-slate-800">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.designation}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Given Float: <b className="text-slate-700">{formatCurrency(emp.givenAdvanceFloat)}</b></div>
                  <div className="text-[11px] font-bold text-emerald-700 font-mono">
                    Bal: {formatCurrency(remainingFloat)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Table & Approvals Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff, category, purpose..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {['ALL', 'Pending', 'Approved', 'Rejected'].map(st => (
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

        {/* Expenses List */}
        <div className="divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No expense claims found matching your filter.
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const emp = employees.find(e => e.id === expense.employeeId);

              return (
                <div
                  key={expense.id}
                  className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  {/* Left: Staff & Category */}
                  <div className="flex items-start gap-3.5 min-w-[240px]">
                    {/* Bill Receipt Thumbnail */}
                    <div
                      onClick={() => setReceiptPreviewUrl(expense.receiptUrl)}
                      className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group shadow-xs"
                      title="Click to view full receipt"
                    >
                      <img
                        src={expense.receiptUrl}
                        alt="Receipt"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{expense.employeeName}</span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {formatDate(expense.date, 'short')}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-amber-700 mt-0.5">
                        {expense.category}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-md line-clamp-2">
                        {expense.remarks}
                      </p>
                    </div>
                  </div>

                  {/* Center: Amount & Status Badge */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-slate-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        expense.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : expense.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {expense.status}
                      </span>
                    </div>

                    {expense.syncedToPayroll && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Payroll</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Admin Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    {expense.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(expense.id)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Claim</span>
                        </button>
                        <button
                          onClick={() => handleReject(expense.id)}
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-rose-200 transition active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-xs text-slate-500 italic max-w-xs text-right">
                        {expense.adminNotes || (expense.status === 'Approved' ? 'Approved & Synced' : 'Rejected')}
                      </div>
                    )}

                    <button
                      onClick={() => setReceiptPreviewUrl(expense.receiptUrl)}
                      className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200"
                      title="Inspect Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
