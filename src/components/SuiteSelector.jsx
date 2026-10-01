import React from 'react';
import {
  Users,
  ShoppingBag,
  PhoneCall,
  BookOpen,
  Sparkles,
  ArrowRight,
  Shield,
  Home,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SuiteSelector = () => {
  const {
    suiteModule,
    switchSuiteModule,
    company,
    navigateTo,
    appMode,
    subscription
  } = useApp();

  const modules = [
    {
      id: 'payroll',
      name: 'Payroll & Attendance',
      shortName: 'Payroll',
      icon: Users,
      status: 'active',
      badge: 'Active / Ready',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
      activeColor: 'bg-blue-600 text-white shadow-md shadow-blue-500/20',
      description: 'Daily attendance, GPS geofencing, biometric selfie & automated salary engine',
    },
    {
      id: 'biz',
      name: 'Biz',
      shortName: 'Biz (Inventory)',
      icon: ShoppingBag,
      status: 'in-progress',
      badge: 'In Progress',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
      activeColor: 'bg-purple-600 text-white shadow-md shadow-purple-500/20',
      description: 'Barcode scanning, stock ledger & multi-channel order fulfillment',
    },
    {
      id: 'desk',
      name: 'Desk',
      shortName: 'Desk (CRM)',
      icon: PhoneCall,
      status: 'in-progress',
      badge: 'In Progress',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
      activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20',
      description: 'One-click dialer, lead management pipeline & customer ticket desk',
    },
    {
      id: 'books',
      name: 'Books',
      shortName: 'Books (Khata)',
      icon: BookOpen,
      status: 'in-progress',
      badge: 'In Progress',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
      activeColor: 'bg-amber-600 text-white shadow-md shadow-amber-500/20',
      description: 'GST invoices, digital khata, automated P&L & bank ledger reconciliation',
    },
  ];

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand Identity & Active Suite Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2 text-slate-800 hover:text-black transition group"
            title="Return to StaffPulse Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
              SP
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-extrabold text-sm tracking-tight leading-none text-slate-950 flex items-center">
                <span>StaffPulse</span>
                <span className="text-amber-500 font-black">.</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Business Suite</div>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Current Company Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[180px]">{company?.name || 'Apex Logistics'}</span>
          </div>
        </div>

        {/* Center: 4 Product Suite Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto w-full md:w-auto no-scrollbar">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = suiteModule === mod.id && appMode !== 'landing';

            return (
              <button
                key={mod.id}
                onClick={() => switchSuiteModule(mod.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? mod.activeColor
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{mod.shortName}</span>
                
                {/* Status indicator tag */}
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider border ${
                    isSelected
                      ? 'bg-white/20 text-white border-white/30'
                      : mod.badgeColor
                  }`}
                >
                  {mod.status === 'active' ? 'Ready' : 'Dev'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Super Admin & Workspace Links */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigateTo('superadmin')}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition"
            title="SaaS Platform Owner Console"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Super Admin HQ</span>
            <span className="sm:hidden">Super</span>
          </button>

          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-950 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition"
            title="Landing Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal</span>
          </button>
        </div>

      </div>
    </div>
  );
};
