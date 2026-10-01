import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  Sparkles,
  Clock,
  Bell,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  PurpleCloudMascot,
  GreenPhoneMascot,
  YellowTriangleMascot
} from '../components/Mascots';

export const ComingSoonModule = ({ moduleKey = 'biz' }) => {
  const { switchSuiteModule, navigateTo, joinWaitlist, showToast } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Module configuration metadata
  const MODULE_CONFIGS = {
    biz: {
      name: 'Biz',
      subtitle: 'Ecommerce, Inventory & Warehouse Management',
      launchDate: 'Q1 2027 (Beta in 6 weeks)',
      colorTheme: 'from-purple-50 via-purple-100/40 to-slate-50',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      accentColor: 'text-purple-700',
      buttonBg: 'bg-purple-600 hover:bg-purple-700',
      mascot: <PurpleCloudMascot className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-xl" />,
      tagline: 'Sell online, track stock and fulfil every customer order end-to-end.',
      roadmap: [
        {
          title: 'Smart Barcode & QR Scanner',
          desc: 'Scan goods-in and goods-out using existing mobile cameras without needing expensive laser guns.',
        },
        {
          title: 'Live Stock Ledger & Low-Stock Alerts',
          desc: 'Instant notifications when SKU stock drops below reorder thresholds, preventing stock-outs.',
        },
        {
          title: 'Multi-Warehouse & Dispatch Routing',
          desc: 'Track bin locations, branch stock transfers, and automated courier consignment notes.',
        },
        {
          title: 'Omnichannel Sync (Amazon, Shopify, WhatsApp)',
          desc: 'Auto-sync catalog pricing and inventory deductions across retail stores and digital storefronts.',
        }
      ]
    },
    desk: {
      name: 'Desk',
      subtitle: 'Smart CRM, Tele-Calling Dialer & Helpdesk',
      launchDate: 'Q4 2026 (Private Alpha Open)',
      colorTheme: 'from-emerald-50 via-emerald-100/40 to-slate-50',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accentColor: 'text-emerald-700',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      mascot: <GreenPhoneMascot className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-xl" />,
      tagline: 'Track leads, auto-dial prospects, and resolve support tickets right from the app.',
      roadmap: [
        {
          title: 'In-App 1-Click Tele-Calling Dialer',
          desc: 'Call field prospects directly from CRM cards with automatic call duration logging and audio notes.',
        },
        {
          title: 'Visual Kanban Lead Pipeline',
          desc: 'Drag and drop deals through Custom Stages: New Inbound → Demo Scheduled → Quotation Sent → Won.',
        },
        {
          title: 'WhatsApp Business API Automated Follow-ups',
          desc: 'Send payment reminders, invoice PDFs, and dispatch notifications directly on WhatsApp.',
        },
        {
          title: 'Omni-channel Customer Support Tickets',
          desc: 'Unified team inbox consolidating emails, web chat, and phone queries with SLA resolution timers.',
        }
      ]
    },
    books: {
      name: 'Books',
      subtitle: 'GST Invoicing, Digital Khata & Automated Bookkeeping',
      launchDate: 'Q1 2027 (Under Development)',
      colorTheme: 'from-amber-50 via-amber-100/40 to-slate-50',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      accentColor: 'text-amber-700',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      mascot: <YellowTriangleMascot className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-xl" />,
      tagline: 'Invoices, expenses and books that stay reconciled with your bank account automatically.',
      roadmap: [
        {
          title: '1-Click GST-Ready Tax Invoicing',
          desc: 'Create e-Invoices with auto-populated HSN/SAC codes, CGST/SGST/IGST slabs and QR codes.',
        },
        {
          title: 'Digital Customer & Supplier Khata',
          desc: 'Keep track of "You\'ll Get" and "You\'ll Give" balances with automated SMS payment reminder links.',
        },
        {
          title: 'Real-time Profit & Loss and Balance Sheets',
          desc: 'Generate CA-ready financial statements, depreciation schedules, and monthly audit balance ledgers.',
        },
        {
          title: 'Automated Bank Statement Sync',
          desc: 'Direct integration with HDFC, ICICI, SBI, and Axis Bank to auto-match incoming NEFT/UPI receipts.',
        }
      ]
    }
  };

  const current = MODULE_CONFIGS[moduleKey] || MODULE_CONFIGS.biz;

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please provide a valid work email address', 'error');
      return;
    }
    joinWaitlist(emailInput, current.name);
    setIsSubmitted(true);
    showToast(`🎉 You're on the early access priority list for ${current.name}! We'll notify ${emailInput} first.`, 'success');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${current.colorTheme} text-slate-900 font-sans pb-24 selection:bg-amber-400 selection:text-black`}>
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <button
          onClick={() => switchSuiteModule('payroll')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payroll & Attendance</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-extrabold flex items-center justify-center text-xs">
            SP
          </div>
          <span className="font-extrabold text-base tracking-tight">StaffPulse</span>
        </div>

        <button
          onClick={() => switchSuiteModule('payroll')}
          className="bg-slate-950 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-xs"
        >
          Open Live HRMS
        </button>
      </div>

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12 space-y-10">
        
        {/* Module Hero Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl text-center space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold border ${current.badgeBg}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>UNDER ACTIVE DEVELOPMENT</span>
            </div>

            <div className="py-2">
              {current.mascot}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              {current.name} is coming soon.
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 max-w-xl font-medium">
              {current.tagline}
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Target Launch: <span className="font-bold text-slate-900">{current.launchDate}</span></span>
            </div>
          </div>

          {/* Waitlist Form or Success Banner */}
          <div className="max-w-md mx-auto pt-2">
            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <div className="bg-white rounded-full p-1.5 border border-slate-300 shadow-md flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                  <div className="pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your work email address"
                    className="w-full text-xs sm:text-sm bg-transparent outline-hidden font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className={`${current.buttonBg} text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow-xs`}
                  >
                    <span>Notify Me</span>
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Join 480+ Indian businesses registered for early beta access. Zero spam, unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>You're on the priority waitlist!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  We'll send your private preview invitation to <span className="font-bold">{emailInput}</span> as soon as sandbox builds are ready.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Feature Roadmap Preview Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="font-extrabold text-lg text-slate-950 tracking-tight">
              Planned Capabilities in {current.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {current.roadmap.map((item, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2 hover:shadow-md transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Return CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => switchSuiteModule('payroll')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-full shadow-md transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Payroll & Attendance Suite</span>
          </button>
        </div>

      </div>

    </div>
  );
};
