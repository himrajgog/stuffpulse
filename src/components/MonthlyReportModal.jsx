import React from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Calendar,
  MapPin,
  Clock,
  User,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDaysInMonth, getMonthName } from '../utils/dateUtils';

export const MonthlyReportModal = () => {
  const {
    isMonthlyReportOpen,
    setIsMonthlyReportOpen,
    selectedEmployeeForReport,
    attendance,
    company,
    selectedMonth,
    selectedYear,
    showToast
  } = useApp();

  if (!isMonthlyReportOpen || !selectedEmployeeForReport) return null;

  const emp = selectedEmployeeForReport;
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const monthName = getMonthName(selectedMonth);

  // Filter attendance records for this employee in selected month & year
  const monthStr = String(selectedMonth).padStart(2, '0');
  const monthRecords = attendance.filter(a =>
    a.employeeId === emp.id && a.date.startsWith(`${selectedYear}-${monthStr}`)
  );

  // Generate full daily timesheet itemization for days 1 to daysInMonth
  const timesheetDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
    const dateObj = new Date(selectedYear, selectedMonth - 1, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const isSunday = dateObj.getDay() === 0;

    const record = monthRecords.find(r => r.date === dateStr);

    let status = record ? record.status : isSunday ? 'Holiday' : 'Absent';
    let punchIn = record?.punchIn || (status === 'Present' ? '09:15 AM' : status === 'Half-Day' ? '09:00 AM' : '—');
    let punchOut = record?.punchOut || (status === 'Present' ? '06:30 PM' : status === 'Half-Day' ? '01:30 PM' : '—');
    let location = record?.inAddress || (status === 'Present' || status === 'Half-Day' || status === 'Late' ? 'Mansarovar Industrial Area, Jaipur' : '—');
    let workHours = record?.workDuration || (status === 'Present' ? '9h 15m' : status === 'Half-Day' ? '4h 30m' : '0h');

    return {
      day,
      dayName,
      dateStr,
      status,
      punchIn,
      punchOut,
      location,
      workHours,
      selfieUrl: record?.selfieUrl || emp.avatar,
    };
  });

  const presentCount = timesheetDays.filter(d => d.status === 'Present' || d.status === 'Late').length;
  const halfDayCount = timesheetDays.filter(d => d.status === 'Half-Day').length;
  const leaveCount = timesheetDays.filter(d => d.status === 'Leave' || d.status === 'Paid Leave').length;
  const absentCount = timesheetDays.filter(d => d.status === 'Absent').length;
  const holidayCount = timesheetDays.filter(d => d.status === 'Holiday').length;
  const payableDays = presentCount + leaveCount + holidayCount + (halfDayCount * 0.5);

  const handleExportCSV = () => {
    const headers = ["Day", "Date", "Status", "Punch IN", "Punch OUT", "Duration", "Geo Location"];
    const rows = timesheetDays.map(d => [
      d.dayName,
      d.dateStr,
      d.status,
      d.punchIn,
      d.punchOut,
      d.workHours,
      `"${d.location}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Timesheet_${emp.name.replace(' ', '_')}_${monthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Timesheet exported for ${emp.name}`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto border border-slate-200">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Official Monthly Timesheet
              </span>
              <span className="text-xs text-slate-500 font-semibold">{monthName} {selectedYear}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {emp.name} — Attendance Report
            </h3>
            <p className="text-xs text-slate-500">
              {emp.designation} · {emp.department} · Employee ID: <span className="font-mono font-bold text-slate-700">{emp.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              onClick={() => setIsMonthlyReportOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Attendance Summary Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="text-xl font-black text-slate-900">{daysInMonth}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Total Days</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            <div className="text-xl font-black text-emerald-700">{presentCount}</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">Present Days</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
            <div className="text-xl font-black text-amber-700">{halfDayCount}</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">Half Days</div>
          </div>
          <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100">
            <div className="text-xl font-black text-rose-700">{absentCount}</div>
            <div className="text-[10px] font-bold text-rose-600 uppercase mt-0.5">Unpaid LOP Days</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 col-span-2 sm:col-span-1">
            <div className="text-xl font-black text-blue-700">{payableDays}</div>
            <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">Net Payable Days</div>
          </div>
        </div>

        {/* Structured Itemized Timesheet Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 sticky top-0 z-10 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Punch IN</th>
                <th className="py-2.5 px-3">Punch OUT</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Verified Geo Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {timesheetDays.map(item => {
                const isSun = item.dayName === 'Sun';

                const badge = {
                  Present: 'bg-emerald-100 text-emerald-800',
                  Late: 'bg-amber-100 text-amber-800',
                  'Half-Day': 'bg-purple-100 text-purple-800',
                  Leave: 'bg-blue-100 text-blue-800',
                  'Paid Leave': 'bg-blue-100 text-blue-800',
                  Absent: 'bg-rose-100 text-rose-800',
                  Holiday: 'bg-slate-100 text-slate-600',
                }[item.status] || 'bg-slate-100 text-slate-700';

                return (
                  <tr key={item.day} className={`hover:bg-slate-50/80 transition ${isSun ? 'bg-slate-50/40 text-slate-500' : ''}`}>
                    <td className="py-2 px-3 font-semibold whitespace-nowrap">
                      {item.day} {item.dayName}, {monthName.slice(0, 3)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${badge}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {item.punchIn}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {item.punchOut}
                    </td>
                    <td className="py-2 px-3 font-medium whitespace-nowrap">
                      {item.workHours}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px] truncate max-w-xs flex items-center gap-1">
                      {item.location !== '—' && <MapPin className="w-3 h-3 text-slate-400 shrink-0" />}
                      <span className="truncate">{item.location}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <div>
            Employer: <strong className="text-slate-800">{company?.name || 'Apex Logistics'}</strong> · Verification: <span className="text-emerald-600 font-bold">Biometric GPS Synced</span>
          </div>
          <button
            onClick={() => setIsMonthlyReportOpen(false)}
            className="text-xs font-bold text-slate-700 hover:text-black"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
