// Company Profile, Statutory Policies & Firebase Settings View
import React, { useState } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  Cloud,
  CloudOff,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Sparkles,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFirebaseActive } from '../services/firebase';

export const SettingsView = () => {
  const { company, updateCompany, resetDemoData, setIsFirebaseConfigModalOpen, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: company.name || '',
    brandName: company.brandName || '',
    address: company.address || '',
    phone: company.phone || '',
    email: company.email || '',
    gstin: company.gstin || '',
    pan: company.pan || '',
    currency: company.currency || 'INR',
    currencySymbol: company.currencySymbol || '₹',
    pfRate: company.pfRate ? (company.pfRate * 100) : 12,
    esiRate: company.esiRate ? (company.esiRate * 100) : 0.75,
    professionalTax: company.professionalTax || 200,
  });

  const isConnected = isFirebaseActive();

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCompany({
      ...formData,
      pfRate: Number(formData.pfRate) / 100,
      esiRate: Number(formData.esiRate) / 100,
      professionalTax: Number(formData.professionalTax),
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              System Settings & Company Policies
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage company branding on payslips, statutory PF/ESI rates, and Firebase Cloud storage
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reload Sample Data</span>
        </button>
      </div>

      {/* Firebase Cloud Sync Card */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-slate-200">
              Firebase Cloud Firestore & Storage
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-lg">
            {isConnected
              ? 'Connected to Firebase. All attendance records, receipt files, and payroll statements sync live.'
              : 'Running in resilient Local-First Mode with realistic demo data. Connect your Firebase project to sync cloud collections.'}
          </p>
        </div>

        <button
          onClick={() => setIsFirebaseConfigModalOpen(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition shrink-0"
        >
          {isConnected ? 'View Firebase Keys' : 'Configure Firebase'}
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        
        {/* Company Identity */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>1. Employer Details & Payslip Header</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Entity / Company Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Display Name
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Head Office Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company PAN</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Finance Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Statutory Payroll Policies */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>2. Statutory Deduction Slabs (PF, ESI, Professional Tax)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provident Fund (PF Rate %)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={formData.pfRate}
                  onChange={(e) => setFormData({ ...formData, pfRate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard 12% on Basic Pay</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ESI Employee Rate (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  value={formData.esiRate}
                  onChange={(e) => setFormData({ ...formData, esiRate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard 0.75% on Gross</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Tax (₹)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={formData.professionalTax}
                  onChange={(e) => setFormData({ ...formData, professionalTax: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">₹</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard ₹200 / month</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/25 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
