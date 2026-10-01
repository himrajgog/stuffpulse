// Top Navigation Bar
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Bell,
  UserCheck,
  ShieldAlert,
  Cloud,
  CloudOff,
  PlusCircle,
  Menu,
  ChevronDown,
  Sparkles,
  Globe,
  LogOut,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFirebaseActive } from '../services/firebase';

export const Navbar = ({ onToggleSidebar }) => {
  const {
    company,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    userRole,
    setUserRole,
    setIsPunchModalOpen,
    setIsFirebaseConfigModalOpen,
    employees,
    activeEmployeeId,
    setActiveEmployeeId,
    currentActiveEmployee,
    navigateTo,
    logoutUser,
    currentUser,
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

  const isConnected = isFirebaseActive();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2.5 text-left group"
            title="Go to Public Landing Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
              <span className="font-extrabold text-lg tracking-wider">APX</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight group-hover:text-brand-600 transition">
                  {company.brandName || "StaffPulse"}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">
                  MVP PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[200px]">
                Attendance & Payroll Engine
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Date Picker & Clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/90 rounded-2xl p-1.5 px-3 border border-slate-200/80 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-xs text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span className="font-mono">{currentTime}</span>
          </div>
        </div>

        {/* Right: Actions, Role Switcher, Quick Punch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Punch Button */}
          <button
            onClick={() => setIsPunchModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-brand-500/25 transition active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>Clock In / Out</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setUserRole('admin')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                userRole === 'admin'
                  ? 'bg-white text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => setUserRole('employee')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                userRole === 'employee'
                  ? 'bg-white text-brand-700 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Staff View
            </button>
          </div>

          {/* If Employee View: Quick switch active staff */}
          {userRole === 'employee' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
              <span className="text-slate-400">As:</span>
              <select
                value={activeEmployeeId}
                onChange={(e) => setActiveEmployeeId(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Firebase Connection Status */}
          <button
            onClick={() => setIsFirebaseConfigModalOpen(true)}
            title={isConnected ? 'Firebase Connected' : 'Local-First Mode (Click to connect Firebase)'}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isConnected ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span className="hidden xl:inline">{isConnected ? 'Cloud Synced' : 'Demo Local'}</span>
          </button>

          {/* Super Admin HQ Switcher */}
          <button
            onClick={() => navigateTo('superadmin')}
            title="Open Platform Owner & Super Admin Console"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-900 to-indigo-900 text-amber-300 border border-purple-700/80 hover:from-purple-800 hover:to-indigo-800 transition shadow-xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Super Admin</span>
          </button>

          {/* Website / Landing Page Switcher */}
          <button
            onClick={() => navigateTo('landing')}
            title="View Public Landing Page"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Website</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logoutUser}
            title="Sign Out of Portal"
            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
