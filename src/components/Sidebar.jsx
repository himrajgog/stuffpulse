// Desktop / Tablet Sidebar Navigation
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
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Globe,
  Crown,
  CheckSquare
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
    currentUser,
    setIsPunchModalOpen,
    navigateTo,
  } = useApp();

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending').length;
  const activeLoansCount = loans.filter(l => l.status === 'Active').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

  const navItems = [
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
      badgeColor: 'bg-indigo-600 text-white',
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
      label: 'Company & Cloud',
      icon: Settings,
      desc: 'Policies & Firebase sync',
    },
  ];

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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container - Smooth Collapsible Drawer on Desktop & Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                Velo HR
                <span className="text-[9px] bg-brand-50 text-brand-700 border border-brand-200/60 font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Payroll & Attendance Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
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
                    ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight flex items-center gap-1.5">
                      {item.label}
                      {item.highlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-xs ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Super Admin (Restricted) & Landing Links */}
          <div className="pt-3 mt-2 border-t border-slate-100 space-y-1">
            {currentUser?.role === 'superadmin' && (
              <button
                onClick={() => {
                  navigateTo('superadmin');
                  if (onClose) onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs transition border border-purple-200/60 shadow-xs cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-purple-600 text-amber-300">
                  <Crown className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">Super Admin HQ</div>
                  <div className="text-[10px] text-purple-600 font-normal">Platform Owner Console</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                navigateTo('landing');
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium text-xs transition cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>Public Landing Page</span>
            </button>
          </div>
        </div>

        {/* Current Active User / Punch Card at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentActiveEmployee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentActiveEmployee?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
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

            <div className="mt-3">
              <button
                onClick={() => setIsPunchModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Clock In / Out Attendance</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
