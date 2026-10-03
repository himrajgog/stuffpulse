// Velo HR — Desktop / Tablet Sidebar Navigation with Dynamic Collapsible & Brand Lockup
import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  Calculator,
  Receipt,
  Landmark,
  Settings,
  Sparkles,
  ChevronRight,
  UserCheck,
  Globe,
  CheckSquare,
  QrCode,
  Scan
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    expenses,
    loans,
    employees,
    tasks = [],
    userRole,
    currentActiveEmployee,
    setIsPunchModalOpen,
    navigateTo,
  } = useApp();

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending').length;
  const activeLoansCount = loans.filter(l => l.status === 'Active').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Metrics & Live Status',
    },
    {
      id: 'attendance',
      label: 'Attendance & Calendar',
      icon: CalendarCheck2,
      desc: 'Geo-punches & monthly logs',
    },
    {
      id: 'qr_kiosk',
      label: 'AI Face & QR Kiosk',
      icon: Scan,
      desc: 'Touchless Face ID & QR',
      highlight: true,
    },
    {
      id: 'employees',
      label: 'Staff Directory',
      icon: Users,
      badge: employees.length,
      desc: 'Wages & profile config',
    },
    {
      id: 'payroll',
      label: 'Payroll Calculator',
      icon: Calculator,
      highlight: true,
      desc: 'Auto salary & payslips',
    },
    {
      id: 'expenses',
      label: 'Expense Claims',
      icon: Receipt,
      badge: pendingExpensesCount > 0 ? pendingExpensesCount : null,
      badgeColor: 'bg-amber-500 text-white',
      desc: 'Field claims & approvals',
    },
    {
      id: 'loans',
      label: 'Loans & EMIs',
      icon: Landmark,
      badge: activeLoansCount > 0 ? activeLoansCount : null,
      badgeColor: 'bg-[#1b3b6f] text-white',
      desc: 'Advances & deductions',
    },
    {
      id: 'tasks',
      label: 'Work & Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Proof photo & tracking',
    },
    {
      id: 'settings',
      label: 'Company & Policies',
      icon: Settings,
      desc: 'Shift rules & Firebase sync',
    },
  ];

  const staffNavItems = [
    {
      id: 'dashboard',
      label: 'My Portal',
      icon: LayoutDashboard,
      desc: 'My Clock & KPIs',
    },
    {
      id: 'attendance',
      label: 'My Attendance',
      icon: CalendarCheck2,
      desc: 'My monthly punch calendar',
    },
    {
      id: 'expenses',
      label: 'My Claims',
      icon: Receipt,
      desc: 'Submit reimbursement claims',
    },
    {
      id: 'loans',
      label: 'My Advances & Loans',
      icon: Landmark,
      desc: 'View active loan & advances',
    },
    {
      id: 'tasks',
      label: 'My Assigned Tasks',
      icon: CheckSquare,
      desc: 'Field tasks & photo proof',
    },
  ];

  const navItems = userRole === 'employee' ? staffNavItems : adminNavItems;

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0f2444]/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container - Smooth Collapsible Drawer on Desktop & Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-stone-200/90 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src="/iconlogo.png" alt="Velo HR" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[#1b3b6f] text-base leading-tight tracking-tight">
                  Velo<span className="text-[#f39c12]">HR</span>
                </span>
                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-300 font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[8.5px] text-slate-500 font-bold tracking-tight uppercase">
                HUMAN RESOURCES | TALENT SOLUTIONS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations & Workforce
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1b3b6f]/10 text-[#1b3b6f] shadow-xs border border-[#1b3b6f]/20 font-bold'
                    : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 text-left min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#1b3b6f] text-white shadow-xs'
                        : 'bg-stone-100 text-slate-500 group-hover:bg-stone-200 group-hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="leading-tight flex items-center gap-1.5 truncate">
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-xs ${
                      item.badgeColor || 'bg-stone-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Website Link */}
          <div className="pt-3 mt-2 border-t border-stone-100">
            <button
              onClick={() => {
                navigateTo('landing');
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-stone-50 font-medium text-xs transition cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-stone-100 text-slate-600">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>Public Landing Page</span>
            </button>
          </div>
        </div>

        {/* Current Active User / Punch Card at bottom */}
        <div className="p-3.5 border-t border-stone-200/80 bg-[#FAF8F5]">
          <div className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentActiveEmployee?.avatar || '/iconlogo.png'}
                alt={currentActiveEmployee?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#1b3b6f]/20 bg-white"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentActiveEmployee?.name || 'Administrator'}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                    {userRole === 'admin' ? 'Admin' : 'Staff'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentActiveEmployee?.designation || 'Workspace Manager'}
                </p>
              </div>
            </div>

            <div className="mt-2.5">
              <button
                onClick={() => setIsPunchModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152f58] hover:to-[#081426] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Clock In / Out Attendance</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
