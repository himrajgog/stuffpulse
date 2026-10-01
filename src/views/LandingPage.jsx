import React, { useState } from 'react';
import {
  ChevronDown,
  ArrowRight,
  Phone,
  Check,
  Star,
  Shield,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  Laptop,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  PurpleCloudMascot,
  OrangePinMascot,
  GreenPhoneMascot,
  BlueFaceMascot,
  OrangeStarMascot,
  YellowTriangleMascot,
  GreenLockMascot,
  FieldBikeMascot,
  IndianSkylineSketch
} from '../components/Mascots';

export const LandingPage = () => {
  const { navigateTo, company, employees, showToast, switchSuiteModule, quickDemoBypass } = useApp();

  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: '',
    phone: '',
    company: '',
    employeesCount: '10-50',
  });

  const handleBookDemoSubmit = (e) => {
    e.preventDefault();
    showToast(`🎉 Demo request confirmed for ${demoFormData.name || 'your company'}! Our solutions team will call ${demoFormData.phone || phoneNumber || '+91-9876543210'} within 15 minutes.`, 'success');
    setIsDemoModalOpen(false);
  };

  const handleQuickLeadSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 5) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setDemoFormData(prev => ({ ...prev, phone: phoneNumber }));
    showToast(`📱 Callback scheduled for +91 ${phoneNumber}! Accessing live app demo now...`, 'success');
    setTimeout(() => {
      navigateTo('app');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] text-[#18181B] font-sans selection:bg-amber-400 selection:text-black">
      
      {/* 1. Top Announcement Banner */}
      <aside aria-label="Announcement" className="bg-gradient-to-r from-[#EBF3FE] via-[#E4EFFE] to-[#EBF3FE] border-b border-blue-100/80 px-4 py-2 text-center text-xs sm:text-sm font-medium text-slate-700 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-900">New:</span>
          <span>On-device Face recognition attendance is now live.</span>
          <button
            onClick={() => {
              const el = document.getElementById('face-attendance');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 ml-1 inline-flex items-center gap-0.5"
          >
            <span>Install the update</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* 2. Primary Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FBFAF7]/90 backdrop-blur-md border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo: StaffPulse. */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigateTo('landing')}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black flex items-center focus:outline-hidden"
            >
              <span>StaffPulse</span>
              <span className="text-amber-500 font-black text-3xl">.</span>
            </button>

            {/* Left Nav Menu Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              {/* Products Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProductsMenuOpen(prev => !prev)}
                  onMouseEnter={() => setIsProductsMenuOpen(true)}
                  className="flex items-center gap-1 py-2 hover:text-black transition font-semibold"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsMenuOpen ? 'rotate-180 text-black' : 'text-slate-400'}`} />
                </button>

                {/* Mega Menu Dropdown */}
                {isProductsMenuOpen && (
                  <div
                    onMouseLeave={() => setIsProductsMenuOpen(false)}
                    className="absolute top-full left-0 mt-1 w-96 sm:w-[480px] bg-white rounded-3xl p-4 shadow-2xl border border-slate-100 grid grid-cols-2 gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {/* 1. Payroll */}
                    <button
                      onClick={() => {
                        setIsProductsMenuOpen(false);
                        switchSuiteModule('payroll');
                      }}
                      className="text-left p-3 rounded-2xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition group flex flex-col justify-between"
                    >
                      <div className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-extrabold text-sm tracking-wide shadow-xs mb-2">
                        Payroll & Attendance
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                          <span>Attendance & Payroll</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Biometric GPS & salary automation</div>
                      </div>
                    </button>

                    {/* 2. Desk (CRM) */}
                    <button
                      onClick={() => {
                        setIsProductsMenuOpen(false);
                        switchSuiteModule('desk');
                      }}
                      className="text-left p-3 rounded-2xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition group flex flex-col justify-between"
                    >
                      <div className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-sm tracking-wide shadow-xs mb-2">
                        Desk (Preview)
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 flex items-center justify-between">
                          <span>Desk</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">SOON</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">CRM & smart customer dialer</div>
                      </div>
                    </button>

                    {/* 3. Books */}
                    <button
                      onClick={() => {
                        setIsProductsMenuOpen(false);
                        switchSuiteModule('books');
                      }}
                      className="text-left p-3 rounded-2xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition group flex flex-col justify-between"
                    >
                      <div className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-sm tracking-wide shadow-xs mb-2">
                        Books (Preview)
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-600 flex items-center justify-between">
                          <span>Books</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">SOON</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Khata bookkeeping & GST e-invoices</div>
                      </div>
                    </button>

                    {/* 4. Biz */}
                    <button
                      onClick={() => {
                        setIsProductsMenuOpen(false);
                        switchSuiteModule('biz');
                      }}
                      className="text-left p-3 rounded-2xl hover:bg-purple-50/70 border border-transparent hover:border-purple-100 transition group flex flex-col justify-between"
                    >
                      <div className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-white font-extrabold text-sm tracking-wide shadow-xs mb-2">
                        Biz (Preview)
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-600 flex items-center justify-between">
                          <span>Biz</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">SOON</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Inventory & warehouse tracking</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="hover:text-black transition"
              >
                Pricing
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('footer');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-black transition"
              >
                Legal
              </button>

              <button
                onClick={() => {
                  showToast('Documentation & Setup Guide: All modules configured for immediate deployment.', 'info');
                }}
                className="hover:text-black transition"
              >
                Docs
              </button>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Quick Demo Bypass Button */}
            <button
              onClick={quickDemoBypass}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black px-3.5 py-2 rounded-full shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1.5"
              title="Instant bypass straight to workspace"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Instant</span>
              <span>Demo Pass</span>
            </button>

            {/* Super Admin Quick Link */}
            <button
              onClick={() => navigateTo('superadmin')}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-full transition"
              title="Platform Owner Super Admin HQ"
            >
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>Super Admin</span>
            </button>

            {/* Client Portal Sign In */}
            <button
              onClick={() => navigateTo('login')}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-black px-3 py-2 rounded-full transition"
            >
              Sign In
            </button>

            {/* Book a Demo CTA Pill */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-[#18181B] hover:bg-black text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
            >
              Book a Demo
            </button>
          </div>

        </div>
      </header>

      {/* 3. Hero Section with Floating Mascots */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Floating Mascots Surrounding Headline */}
        
        {/* Top-Left Mascot: Purple Cloud with Box */}
        <div className="absolute left-2 sm:left-12 lg:left-24 top-6 sm:top-10 pointer-events-none hidden md:block">
          <PurpleCloudMascot className="w-24 h-24 lg:w-32 lg:h-32 drop-shadow-md" />
        </div>

        {/* Mid-Left Mascot: Orange Location Pin */}
        <div className="absolute left-6 sm:left-20 lg:left-36 top-1/2 -translate-y-8 pointer-events-none hidden md:block">
          <OrangePinMascot className="w-20 h-24 lg:w-24 lg:h-28 drop-shadow-md" />
        </div>

        {/* Bottom-Left Mascot: Green Phone Block Character */}
        <div className="absolute left-4 sm:left-14 lg:left-28 bottom-4 sm:bottom-8 pointer-events-none hidden md:block">
          <GreenPhoneMascot className="w-24 h-24 lg:w-28 lg:h-28 drop-shadow-md" />
        </div>

        {/* Top-Right Mascot: Blue Face Recognition Head */}
        <div className="absolute right-2 sm:right-12 lg:right-24 top-6 sm:top-10 pointer-events-none hidden md:block">
          <BlueFaceMascot className="w-24 h-24 lg:w-32 lg:h-32 drop-shadow-md" />
        </div>

        {/* Mid-Right Mascot: Orange Star Character with POS */}
        <div className="absolute right-6 sm:right-20 lg:right-36 top-1/2 -translate-y-8 pointer-events-none hidden md:block">
          <OrangeStarMascot className="w-24 h-24 lg:w-28 lg:h-28 drop-shadow-md" />
        </div>

        {/* Bottom-Right Mascot: Yellow Triangle Khata Character */}
        <div className="absolute right-4 sm:right-14 lg:right-28 bottom-4 sm:bottom-8 pointer-events-none hidden md:block">
          <YellowTriangleMascot className="w-24 h-24 lg:w-28 lg:h-28 drop-shadow-md" />
        </div>

        {/* Hero Center Headline */}
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
            <span>Your </span>
            <span className="relative inline-block">
              <span>favourite</span>
              {/* Hand-drawn sky blue underline highlight */}
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-[#38BDF8]"
                viewBox="0 0 240 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 10C55 3.5 155 2.5 237 7.5"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            <span>management</span>
            <br />
            <span>software.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed pt-2">
            Attendance, Payroll, CRM, Accounting and Inventory. Run your whole business from one beautifully simple suite.
          </p>

          {/* Quick Lead / Demo Bar (Indian phone input + Book a Demo button) */}
          <div className="pt-4 max-w-md mx-auto">
            <form
              onSubmit={handleQuickLeadSubmit}
              className="bg-white rounded-full p-1.5 sm:p-2 border border-slate-200 shadow-md flex items-center gap-2 transition focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400"
            >
              {/* Country Code Prefix */}
              <div className="flex items-center gap-1 pl-3 pr-2 text-slate-700 font-semibold text-xs sm:text-sm shrink-0 border-r border-slate-200">
                <span>🇮🇳</span>
                <span>+91</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Mobile Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="98765 43210"
                className="w-full text-xs sm:text-sm bg-transparent outline-hidden font-medium text-slate-900 placeholder:text-slate-400"
              />

              {/* Book a Demo submit button */}
              <button
                type="submit"
                className="bg-[#18181B] hover:bg-black text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <span>Book a Demo</span>
                <Phone className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </section>

      {/* 4. Social Proof / Trusted Performance Bar */}
      <section className="border-t border-b border-slate-200/60 bg-white/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Rating Summary */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
              TRUSTED PLATFORM
            </span>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">4.9/5 · 500+ Indian Businesses</span>
          </div>

          {/* Enterprise Growth Metrics Strip */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto w-full md:w-auto py-2 no-scrollbar text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>500+ Active Enterprises</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>99.8% Geo-Punch Accuracy</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>₹45Cr+ Processed Payroll</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>100% PF & ESI Compliant</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Touchless Face Kiosks</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Core Feature Cards (Bento 2x2 Grid) */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
            We've done the hard part,<br />now you run the business.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            From payroll to inventory, every tool is built to work together.
          </p>
        </div>

        {/* 2x2 Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* CARD 1: Attendance & Payroll (Light Blue Pastel #EEF5FC) */}
          <div className="bg-[#EEF5FC] border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition hover:shadow-lg">
            
            <div className="space-y-3 z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Attendance & Payroll
              </h3>
              <p className="text-sm sm:text-base text-slate-600 max-w-md">
                Mark attendance, manage leaves and run payroll in one place.
              </p>
              <button
                onClick={() => navigateTo('app')}
                className="text-blue-600 hover:text-blue-800 font-bold text-sm inline-flex items-center gap-1.5 transition pt-1"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mascot label at bottom left */}
            <div className="flex items-center gap-3 pt-6 z-10">
              <BlueFaceMascot className="w-14 h-14 shrink-0" />
              <p className="text-xs font-semibold text-slate-700 max-w-[160px] leading-snug">
                Face recognition based attendance system
              </p>
            </div>

            {/* Live Mobile Screen Mockup (Right / Center overlap) */}
            <div className="mt-6 md:absolute md:right-4 md:bottom-0 w-full md:w-64 bg-slate-900 text-white rounded-t-3xl md:rounded-b-none border-4 border-slate-800 shadow-2xl p-3 space-y-2.5 font-sans overflow-hidden">
              {/* iPhone Notch Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pt-1">
                <span>9:10</span>
                <div className="w-14 h-3 bg-black rounded-full" />
                <span>5G 91%</span>
              </div>

              {/* In-app header */}
              <div className="px-2 pt-1">
                <span className="text-xs text-slate-400">Good evening.</span>
                <div className="text-sm font-bold text-white">Attendance Statistics</div>
              </div>

              {/* Stats pills */}
              <div className="grid grid-cols-3 gap-1 px-1">
                <div className="bg-slate-800/80 p-1.5 rounded-lg text-center">
                  <div className="text-xs font-extrabold text-blue-400">{employees.length}</div>
                  <div className="text-[9px] text-slate-400">Total Staff</div>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded-lg text-center">
                  <div className="text-xs font-extrabold text-emerald-400">Present</div>
                  <div className="text-[9px] text-slate-400">Geo Live</div>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded-lg text-center">
                  <div className="text-xs font-extrabold text-amber-400">Auto</div>
                  <div className="text-[9px] text-slate-400">Payroll</div>
                </div>
              </div>

              {/* Employee row sample */}
              <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/50 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">Ajay Singh rajpoot</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">IN 9:42 AM</span>
                </div>
                <div className="text-[10px] text-slate-400">Sales Executive · GPS Verified</div>
              </div>

              {/* In-app CTA */}
              <button
                onClick={() => navigateTo('app')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 rounded-xl text-xs transition"
              >
                Open Attendance Ledger
              </button>
            </div>

          </div>

          {/* CARD 2: CRM & Dialer (Light Mint Green Pastel #EAF5ED) */}
          <div className="bg-[#EAF5ED] border border-emerald-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition hover:shadow-lg">
            
            <div className="space-y-3 z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                CRM & Dialer
              </h3>
              <p className="text-sm sm:text-base text-slate-600 max-w-md">
                Track leads, manage customers and dial right from the app.
              </p>
              <button
                onClick={() => navigateTo('app')}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-sm inline-flex items-center gap-1.5 transition pt-1"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mascot in Center / Right */}
            <div className="flex items-center justify-center py-6 sm:py-8 z-10">
              <GreenPhoneMascot className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-md" />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 bg-white/70 backdrop-blur-xs p-3 rounded-2xl border border-emerald-200/60 z-10">
              <span>Automatic call logging & customer lead timelines</span>
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Built-in</span>
            </div>

          </div>

          {/* CARD 3: Ecommerce & Inventory (Light Purple Pastel #F3EFFF) */}
          <div className="bg-[#F3EFFF] border border-purple-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition hover:shadow-lg">
            
            <div className="space-y-3 z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Ecommerce & Inventory
              </h3>
              <p className="text-sm sm:text-base text-slate-600 max-w-md">
                Sell online, track stock and fulfil every order end to end.
              </p>
              <button
                onClick={() => navigateTo('app')}
                className="text-purple-700 hover:text-purple-900 font-bold text-sm inline-flex items-center gap-1.5 transition pt-1"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mascot Center */}
            <div className="flex items-center justify-center py-6 sm:py-8 z-10">
              <PurpleCloudMascot className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-md" />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-purple-900 bg-white/70 backdrop-blur-xs p-3 rounded-2xl border border-purple-200/60 z-10">
              <span>Low-stock warnings, barcode scanner & catalog manager</span>
              <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Live</span>
            </div>

          </div>

          {/* CARD 4: Accounting (Light Cream Yellow Pastel #FBF5EB) */}
          <div className="bg-[#FBF5EB] border border-amber-100 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition hover:shadow-lg">
            
            <div className="space-y-3 z-10">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Accounting
              </h3>
              <p className="text-sm sm:text-base text-slate-600 max-w-md">
                Invoices, expenses and books that stay reconciled for you.
              </p>
              <button
                onClick={() => navigateTo('app')}
                className="text-amber-800 hover:text-amber-950 font-bold text-sm inline-flex items-center gap-1.5 transition pt-1"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mascot label at bottom left */}
            <div className="flex items-center gap-3 pt-6 z-10">
              <YellowTriangleMascot className="w-16 h-16 shrink-0" />
              <p className="text-xs font-semibold text-slate-700 max-w-[170px] leading-snug">
                Digital khata with every bill and payment tracked
              </p>
            </div>

            {/* Live Mobile Screen Mockup (Right / Center overlap) */}
            <div className="mt-6 md:absolute md:right-4 md:bottom-0 w-full md:w-64 bg-white text-slate-900 rounded-t-3xl md:rounded-b-none border-4 border-slate-200 shadow-2xl p-3 space-y-2 font-sans overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="font-bold text-slate-900">Sharma General Store</span>
                <span>12:07</span>
              </div>

              {/* You'll Get vs You'll Give banner */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">You'll Get</div>
                  <div className="text-xs font-extrabold text-emerald-600">₹1,99,500</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">You'll Give</div>
                  <div className="text-xs font-extrabold text-rose-600">₹1,37,505</div>
                </div>
              </div>

              {/* Ledger Entries */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-800">Prajakta Supplier</div>
                  <div className="font-bold text-emerald-600">₹87,600</div>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-800">Mukesh Bhai</div>
                  <div className="font-bold text-rose-600">₹1,00,000</div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('app')}
                className="w-full bg-[#18181B] text-white font-bold py-1.5 rounded-xl text-xs transition"
              >
                Inspect Loan & Expense Ledger
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* 6. Section: Privacy & Security (Rolling Green Hills Landscape) */}
      <section className="bg-gradient-to-b from-[#DCEFE3] to-[#C5E6D0] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Mascot: Green Padlock with Sunglasses, Badge and Baton */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <GreenLockMascot className="w-48 h-60 sm:w-56 sm:h-72 drop-shadow-xl" />
          </div>

          {/* Copy Right */}
          <div className="w-full md:w-1/2 space-y-4 text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Your privacy is our<br />priority.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Your business data sits behind layers of protection. It is encrypted in transit and at rest, guarded by strict role-based access and processed on-device wherever it counts. Nobody gets to your numbers but you.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs sm:text-sm font-semibold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>End-to-End Encryption</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Zero Third-Party Tracking</span>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Section: Live Geofencing & Field Tracking (Golden Field Landscape) */}
      <section className="bg-gradient-to-b from-[#FAEED6] to-[#F5DFB3] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          
          {/* Mascot: Field Bike Rider with Geofence Ring */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <FieldBikeMascot className="w-72 h-56 sm:w-80 sm:h-64 drop-shadow-lg" />
          </div>

          {/* Copy Right */}
          <div className="w-full md:w-1/2 space-y-4 text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Know where your team is,<br />live.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Track field staff in real time on the map, even offline. Routes, kilometres and last-seen location are captured automatically, so attendance always reflects what actually happened on the ground.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('app')}
                className="bg-[#18181B] hover:bg-black text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition shadow-sm inline-flex items-center gap-2"
              >
                <span>Try Live GPS Punching</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 8. Section: Biometric Face Recognition Attendance (Blue Wavy Sea) */}
      <section id="face-attendance" className="bg-gradient-to-b from-[#E8F1FC] via-[#D0E5FC] to-[#B9D8FA] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Mascot: Blue Face Recognition with brackets and checkmark */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <BlueFaceMascot className="w-52 h-56 sm:w-64 sm:h-72 drop-shadow-xl" />
          </div>

          {/* Copy Right */}
          <div className="w-full md:w-1/2 space-y-4 text-left">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Attendance that cannot<br />be faked.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              On-device face recognition marks attendance in a second, with no buddy punching and no hardware to buy. It runs on the phones your team already carries, so you are live from day one.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigateTo('app')}
                className="text-blue-700 hover:text-blue-900 font-extrabold text-sm sm:text-base inline-flex items-center gap-1.5 transition underline underline-offset-4"
              >
                <span>Learn more</span>
                <span className="text-lg">↵</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Section: Transparent Pricing Plans */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Pricing Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            <span>Affordable plans </span>
            <br className="sm:hidden" />
            <span>for your </span>
            <span className="relative inline-block">
              <span>business.</span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#38BDF8]"
                viewBox="0 0 200 12"
                fill="none"
              >
                <path d="M2 8C50 2 150 2 198 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Two ways to pay, whatever your size — buy seats one at a time, or put your whole team on a fixed yearly plan. Every price includes GST.
          </p>
        </div>

        {/* Per-seat plans header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950">Per-seat plans</h3>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              PAY AS YOU GROW
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Add Basic or Pro seats one at a time as your team grows. Pay once per seat — no yearly lock-in.
          </p>

          {/* Cards: Basic vs Pro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Basic</h4>
                  <p className="text-xs text-slate-500 mt-1">Attendance, payroll & payslips for your core team.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-950">₹800</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    PER SEAT · INCL. GST
                  </div>
                  <div className="text-[10px] text-slate-400">₹678 + 18% GST · pay once per seat</div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 transition"
              >
                Get started
              </button>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">WHAT'S INCLUDED</span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Attendance tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Payroll & payslips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Task Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Daily Reports</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan (Most Chosen) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600 shadow-md space-y-6 flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                    MOST CHOSEN
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Pro</h4>
                  <p className="text-xs text-slate-500 mt-1">Everything in Basic, plus offline live GPS tracking.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-950">₹2,400</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    PER SEAT · INCL. GST
                  </div>
                  <div className="text-[10px] text-slate-400">₹2,034 + 18% GST · pay once per seat</div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-[#18181B] hover:bg-black text-white transition shadow-sm"
              >
                Get started
              </button>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">WHAT'S INCLUDED</span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Offline live GPS tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Attendance tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Payroll & payslips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Task Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Daily Reports</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Annual plans header */}
        <div className="space-y-6 pt-10 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950">Annual plans</h3>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              BEST VALUE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            A fixed yearly price for your whole team, by headcount. Every annual plan includes the full toolkit.
          </p>

          {/* 3 Annual Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Annual (up to 100 staff) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Annual</h4>
                  <p className="text-xs text-slate-500 mt-1">A fixed yearly plan for up to 100 employees.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-950">₹11,800</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    PER YEAR · INCL. GST
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 transition"
              >
                Get started
              </button>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">WHAT'S INCLUDED</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Up to 100 employees</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Unlimited departments & roles</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>A.I. Selfie + GPS attendance</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Automated payroll & payslips</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Advances, loans & reports</span></div>
                </div>
              </div>
            </div>

            {/* 2. Annual Plus (up to 500 staff - Most Popular) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-600 shadow-md space-y-6 flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Annual Plus</h4>
                  <p className="text-xs text-slate-500 mt-1">A fixed yearly plan for up to 500 employees.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-950">₹16,520</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    PER YEAR · INCL. GST
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-[#18181B] hover:bg-black text-white transition shadow-sm"
              >
                Get started
              </button>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">WHAT'S INCLUDED</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Up to 500 employees</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Unlimited departments & roles</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>A.I. Selfie + GPS attendance</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Automated payroll & payslips</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /><span>Advances, loans & reports</span></div>
                </div>
              </div>
            </div>

            {/* 3. Annual Max (500+ Enterprise) */}
            <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 flex flex-col justify-between">
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
                  <h4 className="text-xl font-bold text-white">Annual Max</h4>
                  <p className="text-xs text-slate-400 mt-1">A fixed yearly plan for 500+ employees.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">₹24,780</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    PER YEAR · INCL. GST
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('payroll_onboarding')}
                className="w-full py-2.5 rounded-full font-bold text-xs sm:text-sm bg-white hover:bg-slate-100 text-slate-950 transition shadow-sm"
              >
                Get started
              </button>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">WHAT'S INCLUDED</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>500+ employees</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Dedicated account manager</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Custom API integrations</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Multi-branch management</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /><span>Full Super Admin diagnostics</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 10. Footer Section with Indian Architectural Skyline */}
      <footer id="footer" className="bg-[#FBFAF7] border-t border-slate-200/80 pt-16 pb-12 relative overflow-hidden">
        
        {/* Indian Monuments Architectural Sketch */}
        <div className="w-full mb-10 overflow-hidden pointer-events-none opacity-80">
          <IndianSkylineSketch className="w-full h-28 sm:h-36" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="text-3xl font-extrabold tracking-tight text-black flex items-center">
                <span>StaffPulse</span>
                <span className="text-amber-500 font-black text-3xl">.</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Smart attendance, biometric verification and automated payroll for modern teams.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigateTo('app')}
                  className="bg-[#18181B] text-white hover:bg-black font-semibold text-xs px-4 py-2 rounded-full transition shadow-xs"
                >
                  Open Live Workspace
                </button>
              </div>
            </div>

            {/* Products column */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">Products</div>
              <ul className="space-y-2 text-slate-600">
                <li><button onClick={() => switchSuiteModule('payroll')} className="hover:text-black transition">Attendance & Payroll</button></li>
                <li><button onClick={() => switchSuiteModule('desk')} className="hover:text-black transition">Desk (CRM & Dialer)</button></li>
                <li><button onClick={() => switchSuiteModule('books')} className="hover:text-black transition">Books (Khata & Invoicing)</button></li>
                <li><button onClick={() => switchSuiteModule('biz')} className="hover:text-black transition">Biz (Inventory & Store)</button></li>
              </ul>
            </div>

            {/* Links column */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">Links</div>
              <ul className="space-y-2 text-slate-600">
                <li><button onClick={() => navigateTo('login')} className="hover:text-black transition font-semibold text-slate-900">Sign In Portal</button></li>
                <li><button onClick={() => navigateTo('superadmin')} className="hover:text-purple-700 transition font-semibold text-purple-900">Super Admin HQ</button></li>
                <li><button onClick={() => setIsDemoModalOpen(true)} className="hover:text-black transition">Book a demo</button></li>
                <li><button onClick={() => navigateTo('payroll_onboarding')} className="hover:text-black transition">Pricing Plans</button></li>
                <li><span className="hover:text-black transition cursor-pointer">Terms & Privacy</span></li>
              </ul>
            </div>

            {/* Get in touch column */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 tracking-wider uppercase text-[11px]">Get in touch</div>
              <p className="text-slate-600 leading-relaxed text-xs">
                4/212, near Suman Blood Bank, SFS Mansarovar, RIICO Industrial Area, Mansarovar, Jaipur, Rajasthan 302020
              </p>
              <div className="text-xs text-slate-700 space-y-1 pt-1">
                <div><span className="font-semibold">Email: </span><a href="mailto:contact@staffpulse.io" className="text-blue-600 hover:underline">contact@staffpulse.io</a></div>
                <div><span className="font-semibold">Phone: </span><span>(+91) 8696-770077</span></div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright and Social Links */}
          <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 StaffPulse. Made with <span className="text-red-500">❤️</span> in India.
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <span className="text-[11px] font-medium text-slate-400">Follow us:</span>
              <span className="hover:text-black cursor-pointer font-bold">Instagram</span>
              <span className="hover:text-black cursor-pointer font-bold">𝕏</span>
              <span className="hover:text-black cursor-pointer font-bold">LinkedIn</span>
              <span className="hover:text-black cursor-pointer font-bold">YouTube</span>
            </div>
          </div>

        </div>

      </footer>

      {/* 11. Interactive Book a Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative border border-slate-100">
            
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Walkthrough</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Schedule a Demo
              </h3>
              <p className="text-xs text-slate-500">
                Experience face attendance, automated payroll slips & expense float management.
              </p>
            </div>

            <form onSubmit={handleBookDemoSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={demoFormData.name}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Vikramaditya Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-2.5 bg-white">
                  <span className="text-slate-500 font-semibold pr-2 border-r border-slate-200">🇮🇳 +91</span>
                  <input
                    type="tel"
                    required
                    value={demoFormData.phone || phoneNumber}
                    onChange={(e) => setDemoFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="98765 43210"
                    className="w-full p-2.5 outline-hidden font-medium text-slate-800 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={demoFormData.company}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Headcount</label>
                <select
                  value={demoFormData.employeesCount}
                  onChange={(e) => setDemoFormData(prev => ({ ...prev, employeesCount: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500 font-medium text-slate-800 bg-white"
                >
                  <option value="1-10">1 to 10 staff</option>
                  <option value="10-50">10 to 50 staff</option>
                  <option value="50-200">50 to 200 staff</option>
                  <option value="200-500">200 to 500 staff</option>
                  <option value="500+">500+ staff (Enterprise)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#18181B] hover:bg-black text-white font-bold py-2.5 rounded-xl transition shadow-md"
                >
                  Confirm Callback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    navigateTo('app');
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                >
                  Try App Now
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
