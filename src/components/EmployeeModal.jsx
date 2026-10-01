// Add / Edit Employee Profile Modal
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Building, Phone, Mail, IndianRupee, CreditCard, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmployeeModal = () => {
  const { isEmployeeModalOpen, setIsEmployeeModalOpen, editingEmployee, saveEmployee, employees } = useApp();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    loginPin: '1234',
    role: 'employee',
    designation: '',
    department: 'Sales & Field Ops',
    wageType: 'Monthly',
    baseSalary: 40000,
    dailyRate: 1000,
    joiningDate: new Date().toISOString().split('T')[0],
    isPFEligible: true,
    isESIEligible: false,
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifsc: 'HDFC0001234',
    givenAdvanceFloat: 0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    allowances: {
      special: 2000,
      conveyance: 1500,
    },
    bonus: 0,
    status: 'Active',
  });

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        ...editingEmployee,
        loginPin: editingEmployee.loginPin || '1234',
        role: editingEmployee.role || 'employee',
        allowances: {
          special: editingEmployee.allowances?.special || 0,
          conveyance: editingEmployee.allowances?.conveyance || 0,
        }
      });
    } else {
      const nextId = `EMP-${String((employees?.length || 0) + 1).padStart(3, '0')}`;
      setFormData({
        id: nextId,
        name: '',
        email: '',
        phone: '',
        loginPin: '1234',
        role: 'employee',
        designation: '',
        department: 'Sales & Field Ops',
        wageType: 'Monthly',
        baseSalary: 35000,
        dailyRate: 1000,
        joiningDate: new Date().toISOString().split('T')[0],
        isPFEligible: true,
        isESIEligible: false,
        bankName: 'HDFC Bank',
        accountNumber: '',
        ifsc: 'HDFC0001234',
        givenAdvanceFloat: 0,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        allowances: {
          special: 2000,
          conveyance: 1000,
        },
        bonus: 0,
        status: 'Active',
      });
    }
  }, [editingEmployee, isEmployeeModalOpen, employees]);

  if (!isEmployeeModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEmployee({
      ...formData,
      baseSalary: Number(formData.baseSalary),
      dailyRate: Number(formData.dailyRate),
      givenAdvanceFloat: Number(formData.givenAdvanceFloat),
      bonus: Number(formData.bonus),
      allowances: {
        special: Number(formData.allowances?.special || 0),
        conveyance: Number(formData.allowances?.conveyance || 0),
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingEmployee ? `Edit Profile: ${editingEmployee.name}` : 'Register New Employee'}
              </h2>
              <p className="text-xs text-slate-400">
                Setup wage configuration, bank details, and statutory eligibility
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEmployeeModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rohit Verma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., rohit.v@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar / Photo URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Designation & Department
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Senior Field Officer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Sales & Field Ops">Sales & Field Ops</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Login Credentials & Access */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Mobile App Login ID & PIN</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                Staff Authentication
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID / Staff Code</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                  placeholder="e.g., EMP-031"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-mono font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Login PIN / Password</label>
                <input
                  type="text"
                  required
                  value={formData.loginPin}
                  onChange={(e) => setFormData({ ...formData, loginPin: e.target.value })}
                  placeholder="e.g., 1234"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Access Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Staff (Field & Punch Terminal)</option>
                  <option value="manager">Manager (Approve Claims & Tasks)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-blue-800/80 leading-snug">
              Give this <strong>Employee ID</strong> and <strong>PIN</strong> to your team member so they can log in directly on their mobile phones.
            </p>
          </div>

          {/* Wage & Salary Configuration */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. Wage Structure & Additions
            </h3>
            
            <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-100 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Wage Model</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, wageType: 'Monthly' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      formData.wageType === 'Monthly'
                        ? 'bg-brand-600 text-white border-brand-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Monthly Fixed Salary
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, wageType: 'Daily' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      formData.wageType === 'Daily'
                        ? 'bg-brand-600 text-white border-brand-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Daily Wage Rate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.wageType === 'Monthly' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Base Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daily Wage Rate (₹ / Day worked)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.dailyRate}
                      onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Allowance (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.allowances.special}
                    onChange={(e) => setFormData({
                      ...formData,
                      allowances: { ...formData.allowances, special: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conveyance Allowance (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.allowances.conveyance}
                    onChange={(e) => setFormData({
                      ...formData,
                      allowances: { ...formData.allowances, conveyance: e.target.value }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Given Advance Float (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.givenAdvanceFloat}
                    onChange={(e) => setFormData({ ...formData, givenAdvanceFloat: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Statutory Toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-brand-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPFEligible}
                    onChange={(e) => setFormData({ ...formData, isPFEligible: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>PF Eligible (12% Deduction)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isESIEligible}
                    onChange={(e) => setFormData({ ...formData, isESIEligible: e.target.checked })}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span>ESI Eligible (0.75% Deduction)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. Bank Account for Salary Disbursal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., HDFC Bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="e.g., 50100492817291"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                  placeholder="e.g., HDFC0001234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEmployeeModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Employee Profile</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
