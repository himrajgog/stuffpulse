// Issue Loan / Advance Modal with Automated Monthly EMI Engine
import React, { useState } from 'react';
import { X, Landmark, Calendar, IndianRupee, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, formatCurrency } from '../utils/dateUtils';

export const IssueLoanModal = () => {
  const { isIssueLoanModalOpen, setIsIssueLoanModalOpen, employees, issueLoan } = useApp();

  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || 'EMP-001',
    loanType: 'Medical Emergency Loan',
    amount: 15000,
    repaymentType: 'Monthly EMI', // 'Monthly EMI' | 'One-Time'
    tenureMonths: 3,
    startDate: getTodayDateString(),
    endDate: '',
    reason: '',
  });

  if (!isIssueLoanModalOpen) return null;

  const calculatedEmi = formData.repaymentType === 'One-Time'
    ? Number(formData.amount)
    : Math.round(Number(formData.amount) / Math.max(1, Number(formData.tenureMonths)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    issueLoan({
      ...formData,
      amount: Number(formData.amount),
      tenureMonths: formData.repaymentType === 'One-Time' ? 1 : Number(formData.tenureMonths),
      monthlyEmi: calculatedEmi,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Issue Advance / Loan</h2>
              <p className="text-xs text-slate-400">
                Setup auto-deducted monthly EMIs synced with Payroll calculations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsIssueLoanModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Staff Member
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation} - Base: ₹{emp.baseSalary || emp.dailyRate + '/day'})
                </option>
              ))}
            </select>
          </div>

          {/* Loan Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Loan Purpose Category
              </label>
              <select
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Medical Emergency Loan">Medical Emergency Loan</option>
                <option value="Salary Advance">Salary Advance</option>
                <option value="Vehicle / Bike Repair Advance">Vehicle / Bike Repair Advance</option>
                <option value="Festival Advance">Festival Advance</option>
                <option value="Laptop & Equipment Loan">Laptop & Equipment Loan</option>
                <option value="Personal Family Loan">Personal Family Loan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Loan Principal Amount (₹)
              </label>
              <input
                type="number"
                required
                min="500"
                step="500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Repayment Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Repayment Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, repaymentType: 'Monthly EMI' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  formData.repaymentType === 'Monthly EMI'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Monthly EMI Deductions
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, repaymentType: 'One-Time' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  formData.repaymentType === 'One-Time'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                One-Time Deduction (Next Pay)
              </button>
            </div>
          </div>

          {/* Tenure & EMI Summary Box */}
          {formData.repaymentType === 'Monthly EMI' && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950">
                  Tenure: <span className="text-indigo-600">{formData.tenureMonths} Months</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 6, 10, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, tenureMonths: m })}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        formData.tenureMonths === m
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-800">
                    Calculated Monthly EMI
                  </span>
                  <p className="text-xs text-indigo-600">Deducted from monthly salary slip</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-indigo-900">
                    {formatCurrency(calculatedEmi)}
                  </span>
                  <span className="text-[10px] text-indigo-700 block">/ Month</span>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Loan Reason & Documentation
            </label>
            <textarea
              rows="2"
              required
              placeholder="e.g., Requested advance for medical prescription and hospitalization bills."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsIssueLoanModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Disburse & Activate Loan</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
