// Velo HR — Employee Self-Service (ESS) Personal Dashboard
import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarCheck2,
  Receipt,
  Landmark,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Plus,
  ShieldCheck,
  Camera,
  MapPin,
  TrendingUp,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';

export const EmployeeDashboard = () => {
  const {
    employees,
    activeEmployeeId,
    attendance,
    expenses,
    loans,
    company,
    selectedDate,
    setIsPunchModalOpen,
    setIsAddExpenseModalOpen,
    openPayslip,
    setActiveTab,
    selectedMonth,
    selectedYear,
  } = useApp();

  const currentEmployee = employees.find(e => e.id === activeEmployeeId) || {
    id: activeEmployeeId || 'EMP-001',
    name: 'Staff Member',
    designation: 'Field Officer',
    department: 'Operations',
    baseSalary: 35000,
    wageType: 'Monthly',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '',
    email: '',
  };

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter personal attendance for this month
  const currentMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const myMonthlyAttendance = attendance.filter(a => 
    a.employeeId === currentEmployee.id && 
    (a.date || '').startsWith(currentMonthPrefix)
  );

  const daysPresent = myMonthlyAttendance.filter(a => a.status === 'Present' || a.currentLiveStatus === 'IN').length;
  const daysHalfDay = myMonthlyAttendance.filter(a => a.status === 'Half-Day').length;
  const lateCount = myMonthlyAttendance.filter(a => a.isLate).length;

  // Today's punch record
  const todayRecord = attendance.find(a => 
    a.employeeId === currentEmployee.id && 
    a.date === selectedDate
  );
  const isClockedIn = todayRecord?.currentLiveStatus === 'IN' || (todayRecord?.punchIn && !todayRecord?.punchOut);

  // Filter personal expenses
  const myExpenses = expenses.filter(e => e.employeeId === currentEmployee.id);
  const pendingClaimsTotal = myExpenses.filter(e => e.status === 'Pending').reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const approvedClaimsTotal = myExpenses.filter(e => e.status === 'Approved').reduce((acc, e) => acc + Number(e.amount || 0), 0);

  // Filter personal loans
  const myLoans = loans.filter(l => l.employeeId === currentEmployee.id && l.status === 'Active');
  const activeLoanBalance = myLoans.reduce((acc, l) => acc + Number(l.remainingAmount || 0), 0);
  const monthlyEmi = myLoans.reduce((acc, l) => acc + Number(l.monthlyEmi || 0), 0);

  // Estimated salary earned so far this month
  const workingDaysInMonth = 26;
  const effectiveDays = daysPresent + daysHalfDay * 0.5;
  const dailyRate = currentEmployee.wageType === 'Daily'
    ? (currentEmployee.dailyRate || 1000)
    : (currentEmployee.baseSalary || 30000) / workingDaysInMonth;
  const estimatedEarned = Math.round(effectiveDays * dailyRate);

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-in fade-in">
      
      {/* 1. Personal Header & Welcome Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-[#1b3b6f]/10 shadow-md"
            />
            {currentEmployee.faceEnrolled && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white" title="Face ID Registered">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {currentEmployee.name}!
              </h2>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {currentEmployee.id}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {currentEmployee.designation} • {currentEmployee.department}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {company?.name || 'Velo HR Workspace'}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-500">
                Shift: {company?.shiftStartTime || '09:00 AM'} – {company?.shiftEndTime || '06:00 PM'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Clock & Action */}
        <div className="flex items-center gap-3 z-10 self-start md:self-auto">
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-2.5 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Current Time</span>
            <div className="font-mono font-black text-base text-[#1b3b6f]">
              {currentTime}
            </div>
          </div>

          <button
            onClick={() => setIsPunchModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152f58] hover:to-[#081426] text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-[#1b3b6f]/20 transition active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{isClockedIn ? 'Clock Out' : 'Clock In Now'}</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Live Attendance Status Banner */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isClockedIn
          ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
          : 'bg-amber-50/80 border-amber-200/90 text-amber-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isClockedIn ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">
                  {isClockedIn ? 'You are currently Clocked IN' : 'You are currently Clocked OUT'}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isClockedIn ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                }`}>
                  {isClockedIn ? 'Live Active Shift' : 'Shift Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isClockedIn
                  ? `Clocked in at ${todayRecord?.punchIn || '09:00 AM'}${todayRecord?.address ? ` from ${todayRecord.address}` : ''}.`
                  : 'Start your shift by tapping "Clock In Now" with webcam selfie and live GPS.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('attendance')}
            className="text-xs font-bold text-[#1b3b6f] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Monthly Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Personal Monthly Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Days Present */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Days Worked (This Month)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {daysPresent}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ {workingDaysInMonth} days</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Attendance Status: Good</span>
          </div>
        </div>

        {/* Estimated Earned Salary */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Earned Salary (Estimate)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#1b3b6f] font-mono">
              ₹{estimatedEarned.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Base: ₹{(currentEmployee.baseSalary || 30000).toLocaleString('en-IN')} / mo
          </span>
        </div>

        {/* Late Check-ins */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Late Arrivals
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black font-mono ${lateCount > 2 ? 'text-rose-600' : 'text-slate-900'}`}>
              {lateCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">times</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Grace: {company?.shiftGracePeriodMins || 15} mins allowed
          </span>
        </div>

        {/* Active Loan / Advance Balance */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-card space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Advance / Loan Balance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              ₹{activeLoanBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Monthly EMI: ₹{monthlyEmi.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* 4. Quick Action Cards: Payslips & Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Latest Payslip Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-card space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">My Monthly Payslip</h4>
                <p className="text-xs text-slate-500">Official digital salary statement with tax & deductions</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Available
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Cycle:</span>
              <span className="font-bold text-slate-800">{new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Bank Account:</span>
              <span className="font-mono font-bold text-slate-700">{currentEmployee.bankName || 'HDFC Bank'} •••• {currentEmployee.accountNumber?.slice(-4) || '1234'}</span>
            </div>
          </div>

          <button
            onClick={() => openPayslip(currentEmployee)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>View & Download My Payslip</span>
          </button>
        </div>

        {/* Expense Reimbursement Claims */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-card space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Expense Reimbursements</h4>
                <p className="text-xs text-slate-500">Submit fuel, travel & field claims for approval</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {myExpenses.length} Claims
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Pending Claims:</span>
              <span className="font-mono font-bold text-amber-600">₹{pendingClaimsTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Approved & Paid:</span>
              <span className="font-mono font-bold text-emerald-600">₹{approvedClaimsTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="flex-1 py-2.5 rounded-xl bg-[#1b3b6f] hover:bg-[#152f58] text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Submit New Claim</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              History
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
