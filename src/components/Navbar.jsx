// Velo HR — Top Navigation Bar with Extreme Far-Left Hamburger & Official Asset Branding
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  Menu,
  Globe,
  LogOut,
  Scan
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = ({ onToggleSidebar, onToggleCollapse, isCollapsed }) => {
  const {
    company,
    currentUser,
    selectedDate,
    setSelectedDate,
    userRole,
    setUserRole,
    setIsPunchModalOpen,
    setActiveTab,
    employees,
    activeEmployeeId,
    setActiveEmployeeId,
    navigateTo,
    logoutUser,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (onToggleSidebar) onToggleSidebar();
    } else {
      if (onToggleCollapse) onToggleCollapse();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-3 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Extreme Far-Left Hamburger & Corporate Brand Header */}
        <div className="flex items-center gap-3">
          {/* Extreme Left Hamburger Toggle Button */}
          <button
            onClick={handleSidebarToggle}
            className="p-2 -ml-1 rounded-xl text-[#1b3b6f] hover:bg-stone-100 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-[#1b3b6f] transition cursor-pointer"
            aria-label="Toggle Sidebar Navigation"
            title={isCollapsed ? "Expand Sidebar (Full Navigation)" : "Collapse Sidebar (Full-Screen Workspace)"}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Mark with Local Logo */}
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
            title="Go to Velo HR Public Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition shrink-0">
              <img src="/iconlogo.png" alt="Velo HR" className="w-full h-full object-contain" />
            </div>

            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#1b3b6f] text-base leading-tight tracking-tight">
                  Velo<span className="text-[#f39c12]">HR</span>
                </span>
                <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                  {company?.name ? company.name.split(' ')[0] : 'ENTERPRISE'}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold tracking-wider uppercase truncate max-w-[240px]">
                HUMAN RESOURCES | TALENT SOLUTIONS
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Date Picker & Clock */}
        <div className="hidden md:flex items-center gap-2 bg-[#FAF8F5] rounded-2xl p-1.5 px-3 border border-stone-200 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-[#1b3b6f]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-xs text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <div className="h-4 w-px bg-stone-300 mx-1" />
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span className="font-mono">{currentTime}</span>
          </div>
        </div>

        {/* Right: Actions, Role Switcher, Quick Punch & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Face Kiosk Button */}
          <button
            onClick={() => setActiveTab('qr_kiosk')}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded-xl border border-blue-200 transition active:scale-95 cursor-pointer shadow-xs"
            title="Launch Touchless AI Face & QR Kiosk"
          >
            <Scan className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">AI Face Kiosk</span>
          </button>

          {/* Quick Punch Button */}
          <button
            onClick={() => setIsPunchModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152f58] hover:to-[#081426] text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-[#1b3b6f]/20 transition active:scale-95 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Clock In / Out</span>
          </button>

          {/* If Employee: Display dedicated Staff Identity Pill (No Admin Switcher!) */}
          {userRole === 'employee' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Staff Portal</span>
            </div>
          ) : (
            /* Admin view only: If sandbox explorer, allow role inspection */
            currentUser?.isSandbox && (
              <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-medium">
                <button
                  onClick={() => setUserRole('admin')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    userRole === 'admin'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setUserRole('employee')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    userRole === 'employee'
                      ? 'bg-white text-[#1b3b6f] font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Staff
                </button>
              </div>
            )
          )}

          {/* Website / Landing Page Link */}
          <button
            onClick={() => navigateTo('landing')}
            title="View Public Velo HR Landing Page"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-stone-100 border border-stone-200 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Website</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logoutUser}
            title="Sign Out of Workspace"
            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
