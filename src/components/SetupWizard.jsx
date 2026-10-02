// Velo HR — First-Time Company Setup Checklist & Onboarding Wizard
import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Building,
  Clock,
  Users,
  Calculator,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SetupWizard = () => {
  const { company, employees, setActiveTab, setIsEmployeeModalOpen } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check completion states
  const hasProfile = Boolean(company?.gstin && company?.address);
  const hasShiftRules = Boolean(company?.shiftGracePeriodMins && company?.shiftStartTime);
  const hasEmployees = employees.length >= 3;
  const hasPayrollTest = Boolean(company?.payrollTested);

  const steps = [
    {
      id: 'profile',
      title: 'Company Legal & Tax Profile',
      desc: 'Configure GSTIN, PAN, and official office address',
      completed: hasProfile,
      actionText: 'Update Profile',
      action: () => setActiveTab('settings'),
      icon: Building,
    },
    {
      id: 'shifts',
      title: 'Shift Rules & Grace Periods',
      desc: 'Set 15-min arrival grace and 4.5h half-day thresholds',
      completed: hasShiftRules,
      actionText: 'Configure Shifts',
      action: () => setActiveTab('settings'),
      icon: Clock,
    },
    {
      id: 'employees',
      title: 'Add First 3 Team Members',
      desc: `${employees.length} of 3 employees enrolled in workspace`,
      completed: hasEmployees,
      actionText: '+ Add Employee',
      action: () => setIsEmployeeModalOpen(true),
      icon: Users,
    },
    {
      id: 'payroll',
      title: 'Run Sample 1-Click Salary Calculation',
      desc: 'Verify statutory PF (12%) and ESI deductions',
      completed: hasPayrollTest,
      actionText: 'Open Calculator',
      action: () => setActiveTab('payroll'),
      icon: Calculator,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (isDismissed || progressPercent === 100) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-xl relative overflow-hidden transition-all animate-in fade-in">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1b3b6f] to-amber-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                Welcome to Velo HR! Quick Setup Checklist
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {completedCount}/4 Completed ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete these 4 foundation steps to activate automated attendance & salary generation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title={isCollapsed ? "Expand Checklist" : "Minimize Checklist"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Dismiss Wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-3">
        <div
          className="bg-gradient-to-r from-[#1b3b6f] via-blue-600 to-amber-500 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Expanded Checklist Steps */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-stone-100">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  step.completed
                    ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                    : 'bg-[#FAF8F5] border-stone-200/80 hover:border-amber-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-white shadow-xs">
                      <StepIcon className={`w-4 h-4 ${step.completed ? 'text-emerald-600' : 'text-[#1b3b6f]'}`} />
                    </div>
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/50">
                  <button
                    onClick={step.action}
                    className={`w-full py-1.5 px-2.5 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer ${
                      step.completed
                        ? 'bg-white text-emerald-700 hover:bg-emerald-100'
                        : 'bg-[#1b3b6f] hover:bg-[#0f2444] text-white shadow-xs'
                    }`}
                  >
                    <span>{step.completed ? 'Review' : step.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
