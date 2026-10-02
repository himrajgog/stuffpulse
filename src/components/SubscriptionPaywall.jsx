// Subscription Renewal & Paywall Engine for Velo HR
import React from 'react';
import {
  Lock,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SubscriptionPaywall = ({ title = "Payroll Calculation Locked", message = null }) => {
  const { company, updateCompany, showToast, navigateTo } = useApp();

  const handleRenewTrial = () => {
    updateCompany({
      ...company,
      subscriptionStatus: 'active',
      planTier: 'pro',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    showToast('🎉 Subscription renewed successfully! Payroll calculations unlocked.', 'success');
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-amber-300 shadow-xl max-w-2xl mx-auto my-8 text-center space-y-6 animate-in fade-in relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Account Billing Status: Expired</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {message || `${company.name || 'Your organization'}'s subscription billing period has expired. Automated salary calculations and PDF payslip generation are locked until your subscription is renewed.`}
        </p>
      </div>

      {/* Plan highlight & renewal actions */}
      <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 text-left max-w-md mx-auto space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-stone-200">
          <span className="text-xs font-bold text-slate-700">Company ID:</span>
          <span className="font-mono text-xs font-bold text-slate-900">{company.id || 'comp-001'}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-stone-200">
          <span className="text-xs font-bold text-slate-700">Renewal Plan:</span>
          <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Pro Growth Tier (₹499/mo)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Instant unlock of automated payroll calculations & payslips</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleRenewTrial}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Renew Subscription Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigateTo('settings')}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-slate-700 font-bold text-xs hover:bg-stone-50 transition"
        >
          View Billing Settings
        </button>
      </div>

      <p className="text-[11px] text-slate-400">
        Need assistance or customized enterprise invoicing? Contact billing@velohr.com
      </p>
    </div>
  );
};
