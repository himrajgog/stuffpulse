// Premium Modern B2B SaaS Landing Page - Blue & Ivory / Off-White Theme
import React, { useState } from 'react';
import {
  MapPin,
  Shield,
  ShieldCheck,
  Check,
  Star,
  Users,
  Building2,
  CreditCard,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Phone,
  Laptop,
  DollarSign,
  Clock,
  Calculator,
  Receipt,
  Landmark,
  X,
  ExternalLink,
  HelpCircle,
  Activity,
  Play,
  Zap,
  Crown,
  BarChart3,
  AlertCircle,
  Radio,
  FileSpreadsheet,
  Lock,
  Smile,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/dateUtils';

export const LandingPage = () => {
  const { navigateTo, company, employees, showToast } = useApp();

  // State
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [activeFaq, setActiveFaq] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    phone: '',
    company: '',
    staffCount: '25-50',
  });
  const [interactivePunchStatus, setInteractivePunchStatus] = useState('Punched In');

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoFormData.phone || demoFormData.phone.length < 10) {
      showToast('Please provide a valid 10-digit mobile number', 'error');
      return;
    }
    showToast(`🎉 Demo scheduled! Our onboarding team will call ${demoFormData.phone} within 15 minutes.`, 'success');
    setIsDemoModalOpen(false);
  };

  const faqs = [
    {
      q: 'How does GPS and geofencing prevent attendance fraud?',
      a: 'StaffPulse establishes a tamper-proof virtual perimeter (customizable down to 50 meters) around your office, warehouse, or client site. When employees punch in via mobile, the app performs real-time coordinate validation, IP verification, and anti-spoofing mock location detection to guarantee physical presence.',
    },
    {
      q: 'Does StaffPulse automatically calculate Indian PF, ESI, and Professional Tax?',
      a: 'Yes, 100%! StaffPulse includes a built-in Indian statutory engine that automatically deducts Employee Provident Fund (12% of basic up to statutory ceiling), ESIC (0.75% for eligible wages), and state-specific Professional Tax (PT). You can generate compliant payslips in 1-click.',
    },
    {
      q: 'Can we support both daily-wage and monthly-salaried workers in one company?',
      a: 'Absolutely. StaffPulse was specifically engineered for hybrid workforces. You can designate workers as Monthly Salaried or Daily Wage. For daily-wage workers, pay is computed dynamically: (Daily Rate × Present Days Worked) + Overtime.',
    },
    {
      q: 'How do field expense claims and loan EMIs sync into payroll?',
      a: 'When field agents submit fuel or travel claims with bill photos, admins can review and approve them in 1-click. Approved claims automatically add into the monthly payroll run. Similarly, company loans and emergency advances automatically deduct scheduled EMIs until the balance is zero.',
    },
    {
      q: 'Is our company data isolated from other organizations?',
      a: 'Yes. StaffPulse runs on a strict multi-tenant architecture. Every employee record, punch log, expense voucher, and salary slip is partitioned by companyId in live Firebase Firestore. Organization data is strictly private and isolated.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <aside aria-label="Announcement" className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border-b border-blue-100/80 px-4 py-2 text-center text-xs font-medium text-slate-700 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-xs">
            Multi-Tenant 2.0 Live
          </span>
          <span className="text-slate-600">
            Enterprise Firestore data isolation, geofenced GPS biometric punches, & automated PF/ESI payslips.
          </span>
          <button
            onClick={() => navigateTo('payroll_onboarding')}
            className="text-blue-700 hover:text-indigo-800 font-bold underline underline-offset-2 inline-flex items-center gap-1 ml-1 cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* 2. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-stone-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigateTo('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Staff<span className="text-blue-600">Pulse</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 hidden sm:inline">
                    PRO SaaS
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 -mt-0.5 hidden sm:block">
                  Workforce & Payroll OS
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition">Features</a>
              <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
              <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
              <a href="#compliance" className="hover:text-blue-600 transition">Statutory Compliance</a>
              <a href="#faqs" className="hover:text-blue-600 transition">FAQs</a>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Super Admin Quick Portal Access */}
            <button
              onClick={() => navigateTo('superadmin')}
              title="Super Admin HQ"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span>Super Admin</span>
            </button>

            {/* Login Button */}
            <button
              onClick={() => navigateTo('login')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-stone-200/50 transition cursor-pointer"
            >
              Sign In
            </button>

            {/* Get Started CTA */}
            <button
              onClick={() => navigateTo('payroll_onboarding')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition active:scale-95 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#F8F5EE] to-[#FDFBF7]">
        {/* Subtle ambient light glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Header Content */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Generation Workforce & Payroll OS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Precision GPS Attendance. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                1-Click Payroll.
              </span> <br />
              Zero Headaches.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The modern HR & payroll operating system engineered for blue-collar, logistics, and field teams. Enforce tamper-proof geofencing, automate complex Indian PF/ESI compliance, approve expenses, and disburse payslips in seconds.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black text-sm px-7 py-4 rounded-2xl shadow-xl shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateTo('app')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-slate-900 font-bold text-sm px-6 py-4 rounded-2xl border border-stone-300 transition active:scale-95 cursor-pointer shadow-sm hover:shadow"
              >
                <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                <span>Launch Live App Demo</span>
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>Schedule a 10-Min Demo</span>
              </button>
            </div>

            {/* Trust Badges Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium border-t border-stone-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Indian Labor Law & EPF Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Multi-Tenant Firestore Isolation</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Preview Cards Showcase */}
          <div className="mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            
            {/* 1. Telemetry Preview Card: GPS Geofencing */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-elevated transition flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">GPS Geofence</h4>
                      <p className="text-[10px] text-slate-500">Anti-Spoofing Radar</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
                    <span>In Perimeter (42m)</span>
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                        SR
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Sunil Rawat</div>
                        <div className="text-[10px] text-slate-500">Jaipur Hub Logistics</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {interactivePunchStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/80">
                      <span className="text-slate-400 block text-[10px] font-semibold">Punch Time</span>
                      <span className="font-mono font-bold text-slate-900">09:14:22 AM</span>
                    </div>
                    <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-200/80">
                      <span className="text-slate-400 block text-[10px] font-semibold">Face Biometric</span>
                      <span className="font-bold text-emerald-600">99.2% Match</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Simulate mobile punch:</span>
                <button
                  onClick={() => {
                    setInteractivePunchStatus(prev => prev === 'Punched In' ? 'Punched Out' : 'Punched In');
                    showToast('Interactive Punch Simulator toggled live!', 'success');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                >
                  Toggle Punch State
                </button>
              </div>
            </div>

            {/* 2. Instant Payroll Engine Preview Card */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-elevated transition flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Salary Calculator</h4>
                      <p className="text-[10px] text-slate-500">Statutory Deductions</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Auto-Computed
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium">Base Gross Salary</span>
                    <span className="font-mono font-bold text-slate-900">₹38,500</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 text-[11px]">
                    <span>EPF (12% basic)</span>
                    <span className="font-mono font-semibold">-₹2,160</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 text-[11px]">
                    <span>ESIC (0.75% gross)</span>
                    <span className="font-mono font-semibold">-₹288</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 text-[11px]">
                    <span>Approved Field Expenses</span>
                    <span className="font-mono font-semibold">+₹1,450</span>
                  </div>
                  <div className="flex justify-between items-center text-indigo-600 text-[11px]">
                    <span>Active Loan EMI Deduct</span>
                    <span className="font-mono font-semibold">-₹2,000</span>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 flex justify-between items-center mt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Net Take-Home Pay</span>
                      <span className="text-base font-black font-mono text-emerald-600">₹35,502</span>
                    </div>
                    <button
                      onClick={() => navigateTo('app')}
                      className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                      View Slip
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Printable PDF with QR Code</span>
                <span className="text-emerald-600 font-bold">100% Audit Ready</span>
              </div>
            </div>

            {/* 3. Field Claims & Loan EMI Card */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-elevated transition flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Claims & Advances</h4>
                      <p className="text-[10px] text-slate-500">Field Fuel & EMIs</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Live Ledger
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Fuel & Petrol Voucher</span>
                      <span className="text-xs font-mono font-bold text-amber-600">₹850</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Client site survey • Receipt Verified</p>
                    <span className="inline-block text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      Approved • In Payroll
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Festival Salary Advance</span>
                      <span className="text-xs font-mono font-bold text-indigo-600">₹15,000</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-2/3" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>EMI: ₹2,500/mo</span>
                      <span>₹10,000 Paid (67%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Zero manual entry</span>
                <span className="text-blue-600 font-bold">Auto-Deducted</span>
              </div>
            </div>

          </div>

          {/* Social Proof Numbers Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 text-center shadow-card">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">100%</div>
              <p className="text-xs text-slate-500 mt-1">Geofence Fraud Prevention</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">₹0</div>
              <p className="text-xs text-slate-500 mt-1">Payroll Overpayment Risk</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">18ms</div>
              <p className="text-xs text-slate-500 mt-1">Real-time Firestore Sync</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">50+</div>
              <p className="text-xs text-slate-500 mt-1">Supported Statutory Rules</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FEATURE GRID (4 PILLARS) */}
      <section id="features" className="py-20 bg-white border-t border-stone-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Engineered for Modern Operations
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Four unified modules working seamlessly together. No separate subscriptions, no messy spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Feature 1: GPS & Geofencing Attendance */}
            <div className="bg-[#FDFBF7] border border-stone-200 rounded-3xl p-7 sm:p-8 hover:border-blue-400 hover:shadow-card transition group relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>

              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Module 01</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                GPS & Geofencing Attendance
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Eliminate buddy punching and time theft with pinpoint location tracking. Require field staff and factory workers to be physically inside your authorized perimeter before recording punch-in.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Customizable meter radius geofencing per branch or warehouse</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>On-device camera biometric selfie capture with timestamp verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Anti-spoofing algorithm detects mock GPS apps and coordinate tampering</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Offline punch caching with automatic Firestore cloud synchronization</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Automated Salary & Payslip Engine */}
            <div className="bg-[#FDFBF7] border border-stone-200 rounded-3xl p-7 sm:p-8 hover:border-indigo-400 hover:shadow-card transition group relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-xs">
                <Calculator className="w-6 h-6" />
              </div>

              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Module 02</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                Automated Salary & Payslip Engine
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Turn hours of monthly Excel calculations into a 10-second automated run. Compute basic pay, HRA, statutory deductions, and allowances with 100% compliance.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dual compensation models: Daily-wage tracking and monthly salaried contracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>EPF (12%) and ESIC (0.75%) automated statutory compliance calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1-Click printable payslips with company GSTIN, PAN, and security watermark</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct CSV export formatted for ICICI, HDFC, and SBI corporate bank payouts</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Field Expense Claims & Approvals */}
            <div className="bg-[#FDFBF7] border border-stone-200 rounded-3xl p-7 sm:p-8 hover:border-amber-400 hover:shadow-card transition group relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-xs">
                <Receipt className="w-6 h-6" />
              </div>

              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Module 03</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                Field Expense Claims & Approvals
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Enable field salesmen and delivery drivers to upload petrol bills and food receipts from the road. Managers approve claims in 1-tap, instantly rolling into salary.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Camera receipt photo capture with high-resolution cloud storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1-Tap Admin Approval or Rejection with audit reason notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero double-entry: Approved reimbursements merge automatically into monthly pay</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Float and petty cash ledger per field executive</span>
                </li>
              </ul>
            </div>

            {/* Feature 4: Loan & Automated EMI Deductions */}
            <div className="bg-[#FDFBF7] border border-stone-200 rounded-3xl p-7 sm:p-8 hover:border-purple-400 hover:shadow-card transition group relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-xs">
                <Landmark className="w-6 h-6" />
              </div>

              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Module 04</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">
                Loan & Automated EMI Deductions
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Issue emergency staff loans and advances without bookkeeping nightmares. The system automatically computes monthly EMI deductions until the balance reaches zero.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast issuance with customized repayment duration and zero-interest options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated EMI deduction directly from payroll run without manual calculations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live recovery tracking ledger with real-time outstanding balance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Emergency advance settlement with final salary slip</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 5. PRICING TABLE SECTION */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-[#FDFBF7] via-[#F8F5EE] to-[#FDFBF7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Invest in Scalability, Not In Headcount
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Pick the tier that matches your business today. Upgrade or downgrade at any time.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 rounded-full bg-stone-300 p-0.5 relative transition cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-full bg-blue-600 transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
                  Annual Billing
                </span>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* TIER 1: BASIC / STARTER */}
            <div className="bg-white border border-stone-200 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:shadow-card transition shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Starter Free</h3>
                  <span className="text-[10px] font-bold uppercase text-slate-500 bg-stone-100 px-2 py-0.5 rounded">
                    Small Teams
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Essential attendance tracking for small shops, boutiques, and micro-teams.
                </p>

                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 font-mono">₹0</span>
                    <span className="text-xs text-slate-500 font-medium">/ month forever</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Up to 10 staff members</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Core GPS Clock In / Clock Out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time Monthly Attendance Calendar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Basic Daily Salary Summary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Local Browser-Encrypted Storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 shrink-0" />
                    <span className="line-through">Automated PF/ESI Statutory Deductions</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 shrink-0" />
                    <span className="line-through">Field Expense Receipt Approvals</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="mt-8 w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-900 font-bold text-xs transition cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* TIER 2: PRO TIER (RECOMMENDED / MOST POPULAR) */}
            <div className="bg-white border-2 border-indigo-600 rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative shadow-xl shadow-indigo-600/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md tracking-wider">
                Most Popular • Recommended
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Pro Growth</h3>
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Field & Logistics
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Complete workforce automation with statutory PF/ESI, geofencing & claims.
                </p>

                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 font-mono">
                      {billingCycle === 'monthly' ? '₹499' : '₹399'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1">Up to 100 staff members included</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Precision Radius Geofencing (50m - 500m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Automated PF (12%) & ESI (0.75%) Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Field Expense Camera Receipts & 1-Tap Approvals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Loan Management & Automated EMI Payroll Deductions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1-Click Printable Payslips with QR Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Real-time Firebase Firestore Sync Across Devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Biometric Face Recognition Kiosk Terminal</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* TIER 3: ENTERPRISE CUSTOM */}
            <div className="bg-white border border-stone-200 rounded-3xl p-7 sm:p-8 flex flex-col justify-between hover:shadow-card transition shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Enterprise Custom</h3>
                  <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Scale & Branches
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  For multi-branch corporations, manufacturing plants, and franchised retail chains.
                </p>

                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 font-mono">
                      {billingCycle === 'monthly' ? '₹1,999' : '₹1,599'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-purple-700 font-semibold mt-1">Unlimited staff & multiple companies</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Multi-Tenant Company & Branch Partitioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Super Admin Diagnostic Command Center & Impersonation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom Overtime & Night-Shift Rotation Rules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Compliance Auditor Role Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>24/7 Dedicated Account Manager & VIP WhatsApp Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>99.99% Guaranteed Cloud SLA Uptime</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="mt-8 w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. STATUTORY COMPLIANCE & HOW IT WORKS */}
      <section id="compliance" className="py-20 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                100% Indian Labor Law Compliant
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Statutory deductions automated to the last rupee.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Avoid labor penalties, EPFO notices, and audit stress. StaffPulse maintains state-by-state wage rules, automated rounding, and pre-formatted ECR and ESIC return files.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>EPF (12%) Compliant</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-capped at statutory wage ceiling (₹15,000) or computed on actual basic salary.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>ESIC (0.75%) Engine</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluates monthly gross eligibility threshold (₹21,000) and computes exact employee share.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>State Professional Tax</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pre-configured slabs for Maharashtra, Karnataka, Gujarat, Rajasthan, and Delhi.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Bank Payout CSVs</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pre-formatted batch upload sheets compatible with major corporate banking portals.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    QR
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Digital Verified Payslip</h4>
                    <p className="text-[10px] text-slate-500">Authenticity Hash: #8F39A1C</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  Audit Cleared
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-500">Employee</span>
                  <span className="text-slate-900 font-bold">Ajay Sharma (EMP-004)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-500">Designation</span>
                  <span className="text-slate-900 font-medium">Field Logistics Lead</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-500">Total Worked Days</span>
                  <span className="text-slate-900 font-mono font-bold">26 Days (100% Present)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-500">Gross Earnings</span>
                  <span className="text-emerald-700 font-mono font-bold">₹32,500</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-500">Total Deductions (PF+ESI+PT)</span>
                  <span className="text-rose-600 font-mono font-bold">-₹2,243</span>
                </div>
                <div className="flex justify-between py-2 bg-white px-3 rounded-xl border border-stone-200">
                  <span className="text-slate-900 font-extrabold">Net Disbursed Take-Home</span>
                  <span className="text-blue-600 font-mono font-black text-sm">₹30,257</span>
                </div>
              </div>

              <button
                onClick={() => navigateTo('app')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Simulate Live Payslip Generator
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="py-20 bg-[#FDFBF7] border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Answers & Clarifications
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about setting up StaffPulse in your business.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition shadow-xs"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50"
                  >
                    <span className="font-bold text-sm text-slate-900">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 8. HIGH-CONVERTING BOTTOM CTA */}
      <section className="py-20 bg-gradient-to-b from-white via-blue-50/50 to-[#FDFBF7] border-t border-stone-200 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Ready in under 2 minutes</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Stop losing thousands to attendance fraud and payroll errors.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Join hundreds of forward-thinking operations managers and business owners who switched to StaffPulse. Free 14-day trial, zero setup fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigateTo('payroll_onboarding')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black text-sm shadow-xl shadow-indigo-600/25 transition active:scale-95 cursor-pointer"
            >
              Start Free 14-Day Trial Now
            </button>

            <button
              onClick={() => navigateTo('login')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-stone-50 text-slate-900 font-bold text-sm border border-stone-300 transition active:scale-95 cursor-pointer shadow-xs"
            >
              Sign In to Your Workspace
            </button>
          </div>
        </div>
      </section>

      {/* 9. PROFESSIONAL FOOTER */}
      <footer className="bg-[#FAF8F5] border-t border-stone-200 pt-16 pb-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-stone-200">
            
            {/* Col 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xl font-black text-slate-900">Staff<span className="text-blue-600">Pulse</span></span>
              </div>
              <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
                The high-velocity workforce attendance and automated statutory payroll platform for multi-location enterprises, warehouses, and field teams.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>All Systems Operational (99.98% Cloud Uptime)</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-blue-600 transition">GPS Geofencing</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition">Salary Calculator</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition">Expense Claims</a></li>
                <li><a href="#features" className="hover:text-blue-600 transition">Loan & EMI Engine</a></li>
                <li><button onClick={() => navigateTo('app')} className="hover:text-blue-600 transition text-left cursor-pointer">Live Demo Portal</button></li>
              </ul>
            </div>

            {/* Col 3: SaaS Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Architecture</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-500">Multi-Tenant Firestore</span></li>
                <li><span className="text-slate-500">Local-First Persistence</span></li>
                <li><span className="text-slate-500">Face Biometrics Liveness</span></li>
                <li><button onClick={() => navigateTo('superadmin')} className="text-purple-700 hover:text-purple-900 font-bold transition flex items-center gap-1 cursor-pointer"><Crown className="w-3 h-3 text-purple-600" /> Super Admin HQ</button></li>
              </ul>
            </div>

            {/* Col 4: Compliance & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legal & Trust</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="hover:text-blue-600 cursor-pointer transition">EPFO & ESIC Compliance</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer transition">Privacy Policy</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer transition">Terms of Service</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer transition">Data Security & Encryption</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 StaffPulse Technologies Inc. All rights reserved. Precision Payroll & Attendance Architecture.
            </div>
            <div className="flex items-center gap-4">
              <span>Made for Indian Businesses</span>
              <span>•</span>
              <span>256-Bit Bank Grade Security</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 10. QUICK DEMO SCHEDULER MODAL */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-on-1 Product Demo</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Schedule a 15-Minute Tour</h3>
              <p className="text-xs text-slate-500">
                See how StaffPulse completely automates attendance and payroll for your business.
              </p>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Verma"
                  value={demoFormData.name}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Mobile Number (WhatsApp)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={demoFormData.phone}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Company / Business Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics Jaipur"
                  value={demoFormData.company}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Total Staff Count
                </label>
                <select
                  value={demoFormData.staffCount}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, staffCount: e.target.value }))}
                  className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="1-15">1 - 15 Employees</option>
                  <option value="16-50">16 - 50 Employees</option>
                  <option value="51-200">51 - 200 Employees</option>
                  <option value="200+">200+ Enterprise</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer mt-2"
              >
                Confirm Callback Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
