import React, { useState } from 'react';
import {
  Check,
  Zap,
  ArrowRight,
  Shield,
  Sparkles,
  Building,
  Mail,
  User,
  Phone,
  Lock,
  ArrowLeft,
  Crown,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PayrollOnboarding = () => {
  const {
    navigateTo,
    onboardCompany,
    showToast,
    company
  } = useApp();

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlan, setSelectedPlan] = useState('pro'); // 'starter' | 'pro' | 'enterprise'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: company?.name || 'Velo Logistics & Services',
    adminName: 'Operations Director',
    email: 'admin@company.com',
    phone: '9876543210',
    password: 'password123',
    staffCount: '30',
  });

  const handleOpenSignup = (planKey) => {
    setSelectedPlan(planKey);
    setIsModalOpen(true);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    onboardCompany({
      companyName: formData.companyName,
      adminName: formData.adminName,
      email: formData.email,
      phone: formData.phone,
      planTier: selectedPlan,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] text-slate-900 font-sans pb-24 selection:bg-blue-500 selection:text-white">
      
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-black transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <img src="/iconlogo.png" alt="Velo HR" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-base tracking-tight text-[#1b3b6f]">Velo HR</span>
        </div>

        <button
          onClick={() => navigateTo('login')}
          className="flex items-center gap-1.5 text-slate-700 hover:text-amber-600 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition cursor-pointer hover:bg-stone-200/50"
        >
          <span>Existing Client? Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero Announcement */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-8 pb-12 space-y-4">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#1b3b6f] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Payroll & Attendance Gateway</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
          Select a subscription tier to<br />launch your workforce suite.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Every plan includes selfie biometric attendance, GPS geofencing, dynamic statutory tax slabs, and field float management.
        </p>

        {/* Monthly / Yearly Switcher */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-slate-200/80 p-1 rounded-full flex items-center text-xs font-bold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-black">
                Save 20%
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* 3 Billing Tiers Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Tier 1: Starter Free */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Starter Free</h3>
              <p className="text-xs text-slate-500 mt-1">Essential attendance & salary ledger for small startups.</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-950">₹0</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                FREE FOREVER · UP TO 10 STAFF
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-b border-slate-100 my-6 space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Up to 10 staff profiles</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Mobile punch in & punch out</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Basic absence deduction calculations</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Monthly timesheet export</span></div>
          </div>

          <button
            onClick={() => handleOpenSignup('starter')}
            className="w-full py-3 rounded-full font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 transition"
          >
            Start Free Plan
          </button>
        </div>

        {/* Tier 2: Pro Growth (Most Popular) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600 shadow-xl flex flex-col justify-between relative hover:shadow-2xl transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Crown className="w-5 h-5" />
              </div>
              <span className="bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                MOST CHOSEN
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Pro Growth</h3>
              <p className="text-xs text-slate-500 mt-1">Complete automated HRMS, statutory compliance & GPS tracking.</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-950">
                {billingCycle === 'monthly' ? '₹499' : '₹399'}
                <span className="text-sm font-semibold text-slate-500"> /mo</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                {billingCycle === 'monthly' ? 'BILLED MONTHLY' : '₹4,788 BILLED ANNUALLY'}
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-b border-slate-100 my-6 space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span className="font-semibold text-slate-900">Up to 100 staff headcount</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Real-time GPS geofencing & map verification</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Biometric face scan terminal check-in</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Statutory PF (12%), ESI (1.25%) & PT (₹200)</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Loan EMI auto-deductions & expense approvals</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>1-Click A4 PDF Payslips in words & numbers</span></div>
          </div>

          <button
            onClick={() => handleOpenSignup('pro')}
            className="w-full py-3 rounded-full font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white transition shadow-md shadow-blue-500/25 active:scale-95"
          >
            Start 14-Day Free Trial
          </button>
        </div>

        {/* Tier 3: Enterprise */}
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between hover:shadow-2xl transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                ENTERPRISE
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
              <p className="text-xs text-slate-400 mt-1">Multi-branch franchises, custom shifts & root diagnostics.</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white">
                {billingCycle === 'monthly' ? '₹1,999' : '₹1,599'}
                <span className="text-sm font-semibold text-slate-400"> /mo</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                ALL INCLUSIVE · UNLIMITED USERS
              </div>
            </div>
          </div>

          <div className="py-6 border-t border-b border-slate-800 my-6 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span className="font-semibold text-white">Unlimited staff & branch locations</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Dedicated account manager & 24/7 phone hotline</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Custom API integrations with SAP / Tally</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Multi-tenant Super Admin root diagnostics</span></div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Priority SLA & daily automated cloud backups</span></div>
          </div>

          <button
            onClick={() => handleOpenSignup('enterprise')}
            className="w-full py-3 rounded-full font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-950 transition active:scale-95 shadow-sm"
          >
            Deploy Enterprise Suite
          </button>
        </div>

      </div>

      {/* Interactive Signup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative border border-slate-100">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {selectedPlan === 'pro' ? 'Pro Growth (14-Day Free Trial)' : selectedPlan === 'enterprise' ? 'Enterprise Tier' : 'Starter Free'}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Setup Company Account
              </h3>
              <p className="text-xs text-slate-500">
                You're 60 seconds away from running automated attendance & salary slips.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-2.5 bg-slate-50/50">
                  <Building className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. Apex Logistics Pvt. Ltd."
                    className="w-full py-2.5 outline-hidden font-medium text-slate-900 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrator Full Name</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-2.5 bg-slate-50/50">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    placeholder="e.g. Sidhee Singh"
                    className="w-full py-2.5 outline-hidden font-medium text-slate-900 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-2.5 bg-slate-50/50">
                    <Mail className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@apex.in"
                      className="w-full py-2.5 outline-hidden font-medium text-slate-900 bg-transparent text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-2.5 bg-slate-50/50">
                    <Phone className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="9876543210"
                      className="w-full py-2.5 outline-hidden font-medium text-slate-900 bg-transparent text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Create Admin Password</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-2.5 bg-slate-50/50">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full py-2.5 outline-hidden font-medium text-slate-900 bg-transparent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1b3b6f] hover:bg-[#0f2444] text-white font-extrabold py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
                >
                  Activate & Enter Suite
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
