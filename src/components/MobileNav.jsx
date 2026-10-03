// Mobile Bottom Navigation Bar
import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Calculator,
  Receipt,
  Landmark,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileNav = () => {
  const { activeTab, setActiveTab, expenses, loans, userRole, activeEmployeeId } = useApp();

  const userExpenses = userRole === 'employee'
    ? expenses.filter(e => e.employeeId === activeEmployeeId)
    : expenses;
  const userLoans = userRole === 'employee'
    ? loans.filter(l => l.employeeId === activeEmployeeId)
    : loans;

  const pendingExpenses = userExpenses.filter(e => e.status === 'Pending').length;
  const activeLoans = userLoans.filter(l => l.status === 'Active').length;

  const adminTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'payroll', label: 'Payroll', icon: Calculator },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: pendingExpenses },
    { id: 'loans', label: 'Loans', icon: Landmark, badge: activeLoans },
  ];

  const staffTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'expenses', label: 'Claims', icon: Receipt, badge: pendingExpenses },
    { id: 'loans', label: 'Advances', icon: Landmark, badge: activeLoans },
  ];

  const tabs = userRole === 'employee' ? staffTabs : adminTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 lg:hidden shadow-lg safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-1 bg-brand-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
