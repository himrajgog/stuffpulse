// Log Field Expense Claim Modal
import React, { useState } from 'react';
import { X, Receipt, UploadCloud, IndianRupee, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/dateUtils';

const SAMPLE_RECEIPTS = [
  { name: 'Fuel Petrol Pump Bill', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80' },
  { name: 'Restaurant Food Invoice', url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&auto=format&fit=crop&q=80' },
  { name: 'Hardware & Tools Receipt', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80' },
];

export const AddExpenseModal = () => {
  const {
    isAddExpenseModalOpen,
    setIsAddExpenseModalOpen,
    employees,
    activeEmployeeId,
    userRole,
    addExpense,
  } = useApp();

  const [formData, setFormData] = useState({
    employeeId: activeEmployeeId || 'EMP-001',
    category: 'Petrol / Fuel',
    amount: '',
    date: getTodayDateString(),
    remarks: '',
    receiptUrl: SAMPLE_RECEIPTS[0].url,
  });

  const [customReceiptUploaded, setCustomReceiptUploaded] = useState(false);

  if (!isAddExpenseModalOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, receiptUrl: reader.result });
        setCustomReceiptUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    addExpense({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Submit Field Expense Claim</h2>
              <p className="text-xs text-slate-400">
                Logged expenses will be reviewed by Admin & synced to monthly payout
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddExpenseModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Employee */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Employee Claiming Reimbursement
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              disabled={userRole === 'employee'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Expense Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="Petrol / Fuel">Petrol / Fuel</option>
                <option value="Client Food & Meeting">Client Food & Meeting</option>
                <option value="Travel / Transit">Travel / Transit</option>
                <option value="Tools & Equipment">Tools & Equipment</option>
                <option value="Stay & Lodging">Stay & Lodging</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Claim Amount (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Date of Expense
            </label>
            <input
              type="date"
              required
              max={getTodayDateString()}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Purpose & Remarks
            </label>
            <textarea
              rows="2"
              required
              placeholder="e.g., Petrol bill for visiting clients in Okhla & Noida Sector 62."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Receipt Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Bill / Receipt Proof
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={formData.receiptUrl}
                  alt="Receipt Preview"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    {customReceiptUploaded ? "Uploaded Custom Receipt" : "Sample Demo Receipt Attached"}
                  </p>
                  <label className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Your Bill</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {!customReceiptUploaded && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-400">Presets:</span>
                  {SAMPLE_RECEIPTS.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, receiptUrl: r.url })}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        formData.receiptUrl === r.url ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {r.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Expense Claim</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
