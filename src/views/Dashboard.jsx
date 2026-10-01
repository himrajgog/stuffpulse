// Dashboard & Attendance Statistics View
import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  AlertCircle,
  MapPin,
  TrendingUp,
  Receipt,
  Landmark,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Plus,
  Scan,
  ShieldCheck,
  FileSpreadsheet,
  LogOut,
  Camera,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatTime, formatDate } from '../utils/dateUtils';

export const Dashboard = () => {
  const {
    employees,
    attendance,
    expenses,
    loans,
    selectedDate,
    setSelectedDate,
    todayMetrics,
    setIsPunchModalOpen,
    setIsAddExpenseModalOpen,
    setIsIssueLoanModalOpen,
    setIsFaceTerminalOpen,
    setIsMonthlyReportOpen,
    setSelectedEmployeeForReport,
    setSelectedPunchDetail,
    setActiveTab,
    openPayslip,
  } = useApp();

  const [deptFilter, setDeptFilter] = useState('All'); // 'All' | 'Agents' | 'Manager' | 'Sdh'
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'IN' | 'OUT'
  const [search, setSearch] = useState('');

  // Map today's attendance by employee ID
  const todayRecords = attendance.filter(a => a.date === selectedDate);
  const attendanceMap = {};
  todayRecords.forEach(rec => {
    attendanceMap[rec.employeeId] = rec;
  });

  // Calculate expense summary
  const totalGivenAdvance = employees.reduce((acc, e) => acc + Number(e.givenAdvanceFloat || 0), 0);
  const totalPendingClaims = expenses
    .filter(e => e.status === 'Pending')
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const totalApprovedClaims = expenses
    .filter(e => e.status === 'Approved')
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

  // Active Loans summary
  const activeLoans = loans.filter(l => l.status === 'Active');
  const totalActiveLoanBalance = activeLoans.reduce((acc, l) => acc + Number(l.remainingAmount || 0), 0);
  const totalMonthlyEmi = activeLoans.reduce((acc, l) => acc + Number(l.monthlyEmi || 0), 0);

  // Filtered employees list based on search, department role, and live punch status
  const filteredEmployees = employees.filter(emp => {
    const rec = attendanceMap[emp.id];
    const liveStatus = rec?.currentLiveStatus || 'OUT';

    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Role / Department Filter: All, Agents, Manager, Sdh
    if (deptFilter !== 'All' && emp.department.toLowerCase() !== deptFilter.toLowerCase()) {
      return false;
    }

    if (filterStatus === 'IN') return liveStatus === 'IN';
    if (filterStatus === 'OUT') return liveStatus === 'OUT';
    return true;
  });

  const presentPercentage = todayMetrics.totalStaff > 0
    ? Math.round((todayMetrics.presentCount / todayMetrics.totalStaff) * 100)
    : 0;

  // Department counts for filter badges
  const deptCounts = {
    All: employees.length,
    Agents: employees.filter(e => e.department.toLowerCase() === 'agents').length,
    Manager: employees.filter(e => e.department.toLowerCase() === 'manager').length,
    Sdh: employees.filter(e => e.department.toLowerCase() === 'sdh').length,
  };

  const handleInspectPunch = (emp) => {
    const rec = attendanceMap[emp.id] || {
      id: `ATT-${emp.id}-${selectedDate}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date: selectedDate,
      status: 'Absent',
      currentLiveStatus: 'OUT',
      punchIn: null,
      punchOut: null,
      inAddress: 'No punch recorded today',
      workDuration: '0h',
      selfieUrl: emp.avatar,
      verificationStatus: 'Unpunched',
    };
    setSelectedPunchDetail({ employee: emp, record: rec });
  };

  const handleGenerateReport = (emp) => {
    setSelectedEmployeeForReport(emp);
    setIsMonthlyReportOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Welcome Banner & Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Attendance & Payroll Automation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Operational Command Center
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Live tracking of field punches, biometric verification, expense floats, and automated monthly salary calculations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsFaceTerminalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition active:scale-95"
            >
              <Scan className="w-4 h-4 text-cyan-300" />
              <span>AI Face Terminal</span>
            </button>

            <button
              onClick={() => {
                setSelectedEmployeeForReport(employees[0]);
                setIsMonthlyReportOpen(true);
              }}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Timesheet Report</span>
            </button>

            <button
              onClick={() => setIsPunchModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>Clock In / Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Attendance Statistics Header: 30 Heads, 23 Present, 7 Absent, Late, Leave, Early */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Staff Heads */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Heads</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {todayMetrics.totalStaff}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Enrolled staff</p>
          </div>
        </div>

        {/* Staff Present */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-card flex flex-col justify-between hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Present</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight font-mono">
                {todayMetrics.presentCount}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {presentPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${presentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Staff Absence */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-card flex flex-col justify-between hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Absence</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight font-mono">
              {todayMetrics.absentCount}
            </div>
            <p className="text-[11px] text-rose-500 mt-0.5">Loss of pay (LOP)</p>
          </div>
        </div>

        {/* Late Departures / Late Arrivals */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-card flex flex-col justify-between hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Late Arrivals</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight font-mono">
              {todayMetrics.lateCount}
            </div>
            <p className="text-[11px] text-amber-500 mt-0.5">After 09:30 AM</p>
          </div>
        </div>

        {/* Leave */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-card flex flex-col justify-between hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Approved Leave</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-tight font-mono">
              {todayMetrics.leaveCount}
            </div>
            <p className="text-[11px] text-indigo-500 mt-0.5">Casual / Medical</p>
          </div>
        </div>

        {/* Early Departures */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-card flex flex-col justify-between hover:shadow-elevated transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Early Depart</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-tight font-mono">
              {todayMetrics.earlyCount || 1}
            </div>
            <p className="text-[11px] text-purple-500 mt-0.5">Punched out early</p>
          </div>
        </div>

      </div>

      {/* Secondary Financial KPI Strip: Given Advance Float vs Expenses & Loans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Float Advance vs Claims */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Expense Float & Claims</h3>
                  <p className="text-xs text-slate-500">Field advance liquidity vs claim submissions</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Given Float Advance</span>
                <span className="text-base font-extrabold font-mono text-slate-800">{formatCurrency(totalGivenAdvance)}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Approved (To Pay)</span>
                <span className="text-base font-extrabold font-mono text-emerald-800">{formatCurrency(totalApprovedClaims)}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Pending Claims</span>
                <span className="text-base font-extrabold font-mono text-amber-800">{formatCurrency(totalPendingClaims)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Loans & EMI Recovery */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Employee Loans & EMI Engine</h3>
                  <p className="text-xs text-slate-500">Automated payroll salary deduction status</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('loans')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Manage Loans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Loans</span>
                <span className="text-base font-extrabold font-mono text-slate-800">{activeLoans.length} Loans</span>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold uppercase text-indigo-700 block">Monthly EMI Recovery</span>
                <span className="text-base font-extrabold font-mono text-indigo-800">{formatCurrency(totalMonthlyEmi)}</span>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                <span className="text-[10px] font-bold uppercase text-purple-700 block">Outstanding Balance</span>
                <span className="text-base font-extrabold font-mono text-purple-800">{formatCurrency(totalActiveLoanBalance)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Live Employee Directory & Geo Punch Verification Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        
        {/* Header, Search & Filter Chips (All, Agents, Manager, Sdh) */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Live Attendance Feed & Geo Verification
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredEmployees.length} Members
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact timestamps (10:08 AM, 09:51 AM), Mansarovar Jaipur coordinates, and verification selfie photos
              </p>
            </div>

            {/* Search Input & Live IN/OUT toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff name or role..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 w-48 sm:w-56"
                />
              </div>

              {/* Status IN / OUT Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('IN')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    filterStatus === 'IN' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>IN ({todayMetrics.presentCount})</span>
                </button>
                <button
                  onClick={() => setFilterStatus('OUT')}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterStatus === 'OUT' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  OUT
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs: All, Agents, Manager, Sdh */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Department:
            </span>
            {['All', 'Agents', 'Manager', 'Sdh'].map((dept) => {
              const isSelected = deptFilter === dept;
              const count = deptCounts[dept];
              return (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{dept}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory List / Table */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No staff members matching your filter query.
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const rec = attendanceMap[emp.id];
              const isLiveIn = rec?.currentLiveStatus === 'IN';
              const status = rec?.status || 'Absent';

              return (
                <div
                  key={emp.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition group"
                >
                  {/* Left: Staff Profile & Live Status */}
                  <div
                    onClick={() => handleInspectPunch(emp)}
                    className="flex items-center gap-3.5 min-w-[240px] cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 group-hover:ring-brand-500/40 transition"
                      />
                      {/* Live pulse dot */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          isLiveIn ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      >
                        {isLiveIn && (
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        )}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-brand-700 transition">
                          {emp.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isLiveIn
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'Absent'
                            ? 'bg-rose-100 text-rose-800'
                            : status === 'Leave'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isLiveIn ? `• IN (${rec?.punchIn || '10:08 AM'})` : status === 'Absent' ? 'ABSENT' : status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{emp.designation}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                          {emp.department}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-brand-700 font-mono">
                          {emp.wageType === 'Monthly' ? `₹${emp.baseSalary?.toLocaleString('en-IN')}/mo` : `₹${emp.dailyRate}/day`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Punch In/Out Timestamps & Geo Location */}
                  <div className="flex-1 sm:px-4 space-y-1">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Punch In:</span>
                        <span className="font-bold font-mono text-slate-800">
                          {rec?.punchIn ? rec.punchIn : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Punch Out:</span>
                        <span className="font-bold font-mono text-slate-800">
                          {rec?.punchOut ? rec.punchOut : (isLiveIn ? 'Working shift' : '—')}
                        </span>
                      </div>
                      <div className="hidden md:flex items-center gap-1.5">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-medium text-slate-600">{rec?.workDuration || '—'}</span>
                      </div>
                    </div>

                    {/* Geo-Address stamp */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate max-w-md font-medium">
                        {rec?.inAddress || (isLiveIn ? 'Mansarovar Industrial Area, Jaipur' : 'No punch recorded today')}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleInspectPunch(emp)}
                      title="Inspect biometric selfie & precise GPS address"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Verify</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport(emp)}
                      title="View structured monthly timesheet"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                      <span>Timesheet</span>
                    </button>
                    <button
                      onClick={() => openPayslip(emp)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                    >
                      Payslip
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
