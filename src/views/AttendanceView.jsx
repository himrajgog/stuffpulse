// Attendance Management & Interactive Employee Monthly Calendar View
import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarCheck2,
  Filter,
  Sparkles,
  Info,
  Edit2,
  FileSpreadsheet,
  Camera,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDaysArrayForMonth, getMonthName } from '../utils/dateUtils';

const STATUS_CONFIG = {
  Present: { label: 'Present', bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50', border: 'border-emerald-200', code: 'P' },
  'Half-Day': { label: 'Half-Day', bg: 'bg-amber-500', text: 'text-amber-700', lightBg: 'bg-amber-50', border: 'border-amber-200', code: 'HD' },
  Leave: { label: 'Leave', bg: 'bg-indigo-500', text: 'text-indigo-700', lightBg: 'bg-indigo-50', border: 'border-indigo-200', code: 'L' },
  'Paid Leave': { label: 'Paid Leave', bg: 'bg-indigo-500', text: 'text-indigo-700', lightBg: 'bg-indigo-50', border: 'border-indigo-200', code: 'PL' },
  Absent: { label: 'Absent', bg: 'bg-rose-500', text: 'text-rose-700', lightBg: 'bg-rose-50', border: 'border-rose-200', code: 'A' },
  Holiday: { label: 'Holiday', bg: 'bg-slate-400', text: 'text-slate-600', lightBg: 'bg-slate-100', border: 'border-slate-200', code: 'H' },
};

export const AttendanceView = () => {
  const {
    userRole,
    activeEmployeeId,
    employees,
    attendance,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedDate,
    setSelectedDate,
    updateAttendanceStatus,
    setIsPunchModalOpen,
    setIsMonthlyReportOpen,
    setSelectedEmployeeForReport,
    setSelectedPunchDetail,
    setIsEmployeeModalOpen,
    openReportsExport,
  } = useApp();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    userRole === 'employee' ? activeEmployeeId : (employees[0]?.id || '')
  );
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  const effectiveEmpId = userRole === 'employee' ? activeEmployeeId : selectedEmployeeId;
  const selectedEmployee = employees.find(e => e.id === effectiveEmpId) || employees[0] || null;
  const daysArray = getDaysArrayForMonth(selectedYear, selectedMonth);

  // Filter attendance for selected employee in selected month
  const empMonthAttendance = attendance.filter(a => {
    return (
      selectedEmployee &&
      a.employeeId === selectedEmployee.id &&
      a.date.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`)
    );
  });

  const attendanceMap = {};
  empMonthAttendance.forEach(rec => {
    attendanceMap[rec.date] = rec;
  });

  // Calculate monthly stats
  let presentCount = 0;
  let halfDayCount = 0;
  let leaveCount = 0;
  let absentCount = 0;
  let holidayCount = 0;

  daysArray.forEach(d => {
    const rec = attendanceMap[d.dateString];
    const status = rec?.status || (d.isWeekend ? 'Holiday' : 'Absent');
    if (status === 'Present') presentCount++;
    else if (status === 'Half-Day') halfDayCount++;
    else if (status === 'Leave' || status === 'Paid Leave') leaveCount++;
    else if (status === 'Holiday') holidayCount++;
    else absentCount++;
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDayClick = (dayObj) => {
    const rec = attendanceMap[dayObj.dateString];
    setSelectedDayDetails({
      dayObj,
      record: rec || {
        id: `ATT-${selectedEmployeeId}-${dayObj.dateString}`,
        employeeId: selectedEmployeeId,
        date: dayObj.dateString,
        status: dayObj.isWeekend ? 'Holiday' : 'Absent',
        punchIn: null,
        punchOut: null,
      }
    });
  };

  const handleStatusChange = (newStatus) => {
    if (userRole === 'employee') {
      showToast('⚠️ Permission Denied: Staff members cannot override attendance records.', 'error');
      return;
    }
    if (!selectedDayDetails) return;
    const { record } = selectedDayDetails;
    updateAttendanceStatus(record.id, newStatus);
    setSelectedDayDetails({
      ...selectedDayDetails,
      record: {
        ...record,
        status: newStatus,
      }
    });
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-card text-center space-y-4 max-w-xl mx-auto my-12 animate-in fade-in">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
          <CalendarCheck2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">No Staff Members Registered Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          To view attendance timesheets, monthly calendar records, and biometric verification, add your first employee to the workspace.
        </p>
        <button
          onClick={() => setIsEmployeeModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add First Employee</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Attendance Calendar & Logs</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Automated Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Color-coded calendar mapping, punch timestamps, and manual HR status overrides
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Selector - Only for Admin */}
          {userRole !== 'employee' ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-500">Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-3 py-1.5 text-xs font-bold text-blue-900">
              <span>My Attendance: {selectedEmployee?.name}</span>
            </div>
          )}

          {/* Month Navigator */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 min-w-[120px] text-center text-slate-800">
              {getMonthName(selectedMonth - 1)} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk Export & Compliance Statements */}
          <button
            onClick={() => openReportsExport('attendance')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            title="Download full monthly attendance register and biometric log sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Reports & Export</span>
          </button>

          {/* Monthly Timesheet Report Trigger */}
          <button
            onClick={() => {
              setSelectedEmployeeForReport(selectedEmployee);
              setIsMonthlyReportOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-200" />
            <span>Itemized Timesheet</span>
          </button>
        </div>
      </div>

      {/* Selected Employee Summary Card & Quick Monthly Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedEmployee.avatar}
              alt={selectedEmployee.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40"
            />
            <div>
              <h3 className="font-extrabold text-base">{selectedEmployee.name}</h3>
              <p className="text-xs text-slate-300">{selectedEmployee.designation}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded text-emerald-400">
                {selectedEmployee.wageType} Wage Model
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Base Wage</span>
              <span className="font-bold text-white font-mono">
                {selectedEmployee.wageType === 'Monthly'
                  ? `₹${selectedEmployee.baseSalary?.toLocaleString('en-IN')}`
                  : `₹${selectedEmployee.dailyRate}/day`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Department</span>
              <span className="font-medium text-slate-200 truncate block">{selectedEmployee.department}</span>
            </div>
          </div>
        </div>

        {/* Attendance Badges Stats */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Tally for {getMonthName(selectedMonth - 1)} {selectedYear}
            </span>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
              Payable Days: {presentCount + leaveCount + holidayCount + (halfDayCount * 0.5)} Days
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Present (P)</span>
              <div className="text-2xl font-black text-emerald-800 font-mono mt-1">{presentCount}</div>
              <span className="text-[10px] text-emerald-600">Full working days</span>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-amber-700">Half-Day (HD)</span>
              <div className="text-2xl font-black text-amber-800 font-mono mt-1">{halfDayCount}</div>
              <span className="text-[10px] text-amber-600">Counted as 0.5 day</span>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-indigo-700">Paid Leave (PL)</span>
              <div className="text-2xl font-black text-indigo-800 font-mono mt-1">{leaveCount}</div>
              <span className="text-[10px] text-indigo-600">Casual / Sick leaves</span>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-rose-700">Absent (A)</span>
              <div className="text-2xl font-black text-rose-800 font-mono mt-1">{absentCount}</div>
              <span className="text-[10px] text-rose-600">Loss of pay</span>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-slate-600">Holidays / Off (H)</span>
              <div className="text-2xl font-black text-slate-800 font-mono mt-1">{holidayCount}</div>
              <span className="text-[10px] text-slate-500">Sundays & festivals</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Monthly Calendar Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card">
        
        {/* Calendar Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 text-xs">
          <div className="font-bold text-slate-800">
            Interactive Daily Roster (Click any date to inspect / mark)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${cfg.bg}`} />
                <span className="text-slate-600 text-[11px]">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Tiles */}
        <div className="grid grid-cols-7 gap-2">
          {/* Pad leading days of month */}
          {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100" />
          ))}

          {daysArray.map((dayObj) => {
            const rec = attendanceMap[dayObj.dateString];
            const status = rec?.status || (dayObj.isWeekend ? 'Holiday' : 'Absent');
            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Absent;
            const isToday = dayObj.dateString === selectedDate;

            return (
              <button
                key={dayObj.day}
                onClick={() => handleDayClick(dayObj)}
                className={`h-20 sm:h-24 p-2 rounded-2xl border text-left flex flex-col justify-between transition-all group hover:scale-[1.02] hover:shadow-md ${
                  isToday
                    ? 'ring-2 ring-brand-500 shadow-xs'
                    : ''
                } ${cfg.lightBg} ${cfg.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold ${isToday ? 'bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-800'}`}>
                    {dayObj.day}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded text-white ${cfg.bg}`}>
                    {cfg.code}
                  </span>
                </div>

                <div className="space-y-0.5 mt-auto">
                  {rec?.punchIn && (
                    <div className="text-[10px] text-slate-700 font-mono font-semibold truncate flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      <span>{rec.punchIn}</span>
                    </div>
                  )}
                  {rec?.inAddress && (
                    <div className="text-[9px] text-slate-500 truncate hidden sm:block">
                      {rec.inAddress.split(',')[0]}
                    </div>
                  )}
                  {!rec?.punchIn && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      {status}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Day Details Modal / Drawer */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Attendance Inspector
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedEmployee.name} • {selectedDayDetails.dayObj.dateString}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Override - Admins Only */}
            {userRole !== 'employee' ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Override / Mark Status (Admin):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Half-Day', 'Leave', 'Absent', 'Holiday'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        selectedDayDetails.record?.status === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Verified Status:</span>
                <span className="font-extrabold text-slate-900 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-xs">
                  {selectedDayDetails.record?.status || 'Not Recorded'}
                </span>
              </div>
            )}

            {/* Timestamps & Geo Details */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Punch In Time:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedDayDetails.record?.punchIn || 'Not recorded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Punch Out Time:</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedDayDetails.record?.punchOut || 'Not recorded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Work Duration:</span>
                <span className="font-semibold text-emerald-700">
                  {selectedDayDetails.record?.workDuration || '0h'}
                </span>
              </div>
              {selectedDayDetails.record?.inAddress && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Geo Location:</span>
                  <span className="font-medium text-slate-800 text-[11px]">
                    {selectedDayDetails.record.inAddress}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedPunchDetail({ employee: selectedEmployee, record: selectedDayDetails.record });
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Verify Selfie & Geo</span>
              </button>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
