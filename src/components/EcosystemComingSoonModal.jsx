// Velo HR — Ecosystem Suite Coming Soon & Waitlist Modal
import React, { useState } from 'react';
import {
  X,
  Package,
  Headphones,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bell,
  Layers,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EcosystemComingSoonModal = ({ isOpen, onClose, suite = 'biz' }) => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const suiteDetails = {
    biz: {
      name: 'Velo Biz',
      tagline: 'Inventory, Purchase Orders & Asset Logistics',
      icon: Package,
      badge: 'B2B INVENTORY SUITE',
      gradient: 'from-amber-500 to-orange-600',
      description: 'Barcode scanning, warehouse transfer manifests, low-stock re-order thresholds, and multi-location field asset tracking natively integrated with staff assignments.',
      highlights: ['Automated reorder triggers', 'Asset handover signatures', 'Supplier bill reconciliation'],
    },
    desk: {
      name: 'Velo Desk',
      tagline: 'Field CRM, Helpdesk & Tele-Calling Dialer',
      icon: Headphones,
      badge: 'FIELD SALES & CRM SUITE',
      gradient: 'from-blue-600 to-indigo-700',
      description: 'One-click outbound dialing for field reps, customer support ticketing queues, lead pipeline stages, and GPS-tagged client visit logs synced into attendance.',
      highlights: ['In-app call recording', 'GPS client visit proof', 'SLA ticket escalation'],
    },
    books: {
      name: 'Velo Books',
      tagline: 'GST Invoicing, Vendor Hisaab & Ledger',
      icon: BookOpen,
      badge: 'ACCOUNTING & GST SUITE',
      gradient: 'from-emerald-600 to-teal-700',
      description: 'E-invoicing generation, GST-compliant e-way bills, vendor accounts payable, customer receivables ledger, and automated reconciliation with payroll disbursements.',
      highlights: ['Automated GSTR-1 & 3B reports', 'Bank reconciliation feed', 'Vendor float approvals'],
    },
  };

  const current = suiteDetails[suite] || suiteDetails.biz;
  const SuiteIcon = current.icon;

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid business email address', 'error');
      return;
    }
    setIsSubmitted(true);
    showToast(`🎉 You have been added to the priority early access list for ${current.name}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f2444]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            setIsSubmitted(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${current.gradient} flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0`}>
            <SuiteIcon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-block">
              {current.badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {current.name}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {current.tagline}
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div className="bg-[#FAF8F5] border border-amber-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Currently Under Final Security & Compliance Audit</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Features Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Upcoming Modules:
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700 font-medium">
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist Subscription */}
        {!isSubmitted ? (
          <form onSubmit={handleWaitlistSubmit} className="space-y-3 pt-2 border-t border-stone-200">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Get Priority Early Access & Launch Invite</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter work email (e.g. admin@company.com)"
                className="flex-1 bg-[#FAF8F5] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#1b3b6f] hover:bg-[#0f2444] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-emerald-900">You're on the VIP waitlist!</p>
            <p className="text-[11px] text-emerald-700">We will notify {email} the moment {current.name} is ready for deployment.</p>
          </div>
        )}

        {/* Dismiss / Return to Core */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              setIsSubmitted(false);
              onClose();
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition underline underline-offset-4 cursor-pointer"
          >
            Return to Active Payroll & Attendance Core
          </button>
        </div>

      </div>
    </div>
  );
};
