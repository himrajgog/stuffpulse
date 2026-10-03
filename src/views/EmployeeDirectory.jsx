import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  CreditCard,
  Edit2,
  Trash2,
  Sparkles,
  Printer,
  Landmark,
  ShieldCheck,
  CalendarCheck2,
  Scan,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import { FaceEnrollmentModal } from '../components/FaceEnrollmentModal';

export const EmployeeDirectory = () => {
  const {
    employees,
    setIsEmployeeModalOpen,
    setEditingEmployee,
    deleteEmployee,
    openPayslip,
    setIsIssueLoanModalOpen,
    setActiveTab,
  } = useApp();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const departments = ['ALL', 'Sales & Field Ops', 'Engineering', 'Field Operations', 'Logistics', 'Finance & Accounts', 'Human Resources'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone.includes(search);

    if (!matchesSearch) return false;
    if (departmentFilter !== 'ALL' && emp.department !== departmentFilter) return false;
    return true;
  });

  const [enrollingEmployee, setEnrollingEmployee] = useState(null);
  const [isFaceEnrollOpen, setIsFaceEnrollOpen] = useState(false);

  const handleOpenFaceEnrollment = (emp) => {
    setEnrollingEmployee(emp);
    setIsFaceEnrollOpen(true);
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Staff & Employee Directory</h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {employees.length} Registered Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic Monthly / Daily wage structures, statutory PF/ESI eligibility, and bank accounts
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/25 transition active:scale-95 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, designation, phone, email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Dept:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-card text-center space-y-4 max-w-lg mx-auto my-6 animate-in fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {employees.length === 0 ? 'No Staff Members Registered Yet' : 'No staff found matching search'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {employees.length === 0
              ? 'Add your first employee to set up their wage structure (Daily / Monthly), PF/ESI eligibility, and direct bank details.'
              : 'Try changing your search terms or department filters to locate staff.'}
          </p>
          {employees.length === 0 && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Employee</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            return (
              <div
                key={emp.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-elevated transition flex flex-col justify-between space-y-4"
              >
                {/* Header: Avatar, Name, Role */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-sm">{emp.name}</h3>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1 rounded">
                          {emp.id}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">{emp.designation}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {emp.department}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.status}
                    </span>

                    {emp.faceEnrolled ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>Face ID</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                        No Face ID
                      </span>
                    )}
                  </div>
                </div>

                {/* Wage Structure Pill */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold text-[11px] uppercase">Wage Model:</span>
                    <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px]">
                      {emp.wageType} Wage
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Base Compensation:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">
                      {emp.wageType === 'Monthly'
                        ? `₹${emp.baseSalary?.toLocaleString('en-IN')} / month`
                        : `₹${emp.dailyRate} / day worked`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>Given Advance Float:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatCurrency(emp.givenAdvanceFloat || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[10px] font-semibold">
                    <span className={`px-1.5 py-0.5 rounded ${emp.isPFEligible ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-500'}`}>
                      PF (12%)
                    </span>
                    <span className={`px-1.5 py-0.5 rounded ${emp.isESIEligible ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>
                      ESI (0.75%)
                    </span>
                  </div>
                </div>

                {/* Contact & Bank Details */}
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{emp.bankName} - {emp.accountNumber || 'Acc: Not set'}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                      title="Edit Employee Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${emp.name}?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                      title="Remove Employee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenFaceEnrollment(emp)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        emp.faceEnrolled
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                      }`}
                      title={emp.faceEnrolled ? "Update Face ID Biometrics" : "Enroll Face ID Biometrics"}
                    >
                      <Scan className="w-3.5 h-3.5 text-amber-500" />
                      <span>{emp.faceEnrolled ? 'Face ID' : 'Enroll Face'}</span>
                    </button>

                    <button
                      onClick={() => openPayslip(emp)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <Printer className="w-3 h-3 text-emerald-400" />
                      <span>Payslip</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Face ID Biometric Enrollment Modal */}
      <FaceEnrollmentModal
        isOpen={isFaceEnrollOpen}
        onClose={() => setIsFaceEnrollOpen(false)}
        employee={enrollingEmployee}
      />

    </div>
  );
};
