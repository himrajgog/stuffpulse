import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { getTodayDateString } from '../utils/dateUtils';
import { calculateEmployeePayroll, calculateAllPayrolls } from '../utils/payrollEngine';
import { firebaseAuthService } from '../services/firebase';
import { INITIAL_TENANTS, INITIAL_SUPPORT_TICKETS } from '../services/superAdminData';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & View Mode: 'landing' | 'login' | 'app' | 'superadmin' | 'payroll_onboarding' | 'coming_soon'
  const [appMode, setAppMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#login') return 'login';
      if (hash === '#app' || hash === '#workspace') return 'app';
      if (hash === '#superadmin') return 'superadmin';
      if (hash === '#onboarding' || hash === '#pricing') return 'payroll_onboarding';
      if (hash.startsWith('#coming-soon')) return 'coming_soon';
      if (hash && (hash.includes('features') || hash.includes('demo') || hash.includes('testimonials') || hash.includes('landing'))) {
        return 'landing';
      }
      const saved = localStorage.getItem('staffpulse_app_mode');
      return saved || 'landing';
    }
    return 'landing';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#login') {
        setAppMode('login');
      } else if (hash === '#app' || hash === '#workspace') {
        setAppMode('app');
      } else if (hash === '#superadmin') {
        setAppMode('superadmin');
      } else if (hash === '#onboarding') {
        setAppMode('payroll_onboarding');
      } else if (hash.startsWith('#coming-soon')) {
        setAppMode('coming_soon');
      } else if (hash === '#landing' || hash === '' || hash.includes('features') || hash.includes('demo') || hash.includes('testimonials')) {
        setAppMode('landing');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Super Admin Multi-Tenant State
  const [tenants, setTenants] = useState(() => {
    try {
      const saved = localStorage.getItem('staffpulse_tenants');
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [supportTickets, setSupportTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('staffpulse_support_tickets');
      return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
    } catch {
      return INITIAL_SUPPORT_TICKETS;
    }
  });

  const [impersonatedTenant, setImpersonatedTenant] = useState(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('staffpulse_auth_user');
      return saved ? JSON.parse(saved) : {
        email: 'admin@apexcorp.com',
        role: 'admin',
        name: 'HR Administrator',
      };
    } catch {
      return { email: 'admin@apexcorp.com', role: 'admin', name: 'HR Administrator' };
    }
  });

  // Core Entities State
  const [company, setCompany] = useState(() => storageService.getCompany());
  const [employees, setEmployees] = useState(() => storageService.getEmployees());
  const [attendance, setAttendance] = useState(() => storageService.getAttendance());
  const [expenses, setExpenses] = useState(() => storageService.getExpenses());
  const [loans, setLoans] = useState(() => storageService.getLoans());
  const [tasks, setTasks] = useState(() => storageService.getTasks());

  // Suite Module State: 'payroll' | 'biz' | 'desk' | 'books'
  const [suiteModule, setSuiteModule] = useState(() => {
    return localStorage.getItem('staffpulse_suite_module') || 'payroll';
  });

  // Subscription Gateway State
  const [subscription, setSubscription] = useState(() => {
    try {
      const saved = localStorage.getItem('staffpulse_subscription');
      return saved ? JSON.parse(saved) : { active: true, tier: 'pro', planName: 'Pro Growth' };
    } catch {
      return { active: true, tier: 'pro', planName: 'Pro Growth' };
    }
  });

  // Navigation & Filter State
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Role switcher: Admin vs Employee Self-Service
  const [userRole, setUserRole] = useState(() => currentUser?.role || 'admin');
  const [activeEmployeeId, setActiveEmployeeId] = useState(() => currentUser?.employeeId || 'EMP-001');

  // Modals state
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslipData, setSelectedPayslipData] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isIssueLoanModalOpen, setIsIssueLoanModalOpen] = useState(false);
  const [isFirebaseConfigModalOpen, setIsFirebaseConfigModalOpen] = useState(false);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);

  // New Feature Modals & Inspectors
  const [isFaceTerminalOpen, setIsFaceTerminalOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [selectedEmployeeForReport, setSelectedEmployeeForReport] = useState(null);
  const [selectedPunchDetail, setSelectedPunchDetail] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Trigger celebration confetti
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  // --- Attendance Actions ---
  const punchIn = ({ employeeId, address, selfieUrl, notes, timeStr }) => {
    const emp = employees.find(e => e.id === employeeId);
    const nowTime = timeStr || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const { updatedAttendance, record } = storageService.punchIn({
      employeeId,
      employeeName: emp ? emp.name : 'Employee',
      address,
      selfieUrl,
      notes,
      dateStr: selectedDate,
      timeStr: nowTime,
    });

    setAttendance(updatedAttendance);
    triggerCelebration();
    showToast(`Punch In recorded for ${emp?.name || 'staff'} at ${nowTime}!`, 'success');
    return record;
  };

  const punchOut = ({ employeeId, address, timeStr }) => {
    const emp = employees.find(e => e.id === employeeId);
    const nowTime = timeStr || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
      const { updatedAttendance, record } = storageService.punchOut({
        employeeId,
        address,
        dateStr: selectedDate,
        timeStr: nowTime,
      });

      setAttendance(updatedAttendance);
      showToast(`Punch Out recorded for ${emp?.name || 'staff'} at ${nowTime}.`, 'info');
      return record;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  const updateAttendanceStatus = (recordId, newStatus) => {
    const updated = attendance.map(a => {
      if (a.id === recordId) {
        return {
          ...a,
          status: newStatus,
          currentLiveStatus: newStatus === 'Present' || newStatus === 'Late' ? 'IN' : 'OUT',
        };
      }
      return a;
    });
    setAttendance(updated);
    storageService.saveAttendanceRecord(updated.find(a => a.id === recordId));
    showToast(`Attendance marked as ${newStatus}`, 'success');
  };

  // --- Employee Actions ---
  const saveEmployee = (employeeData) => {
    const isNew = !employeeData.id;
    const finalData = {
      ...employeeData,
      id: employeeData.id || `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      status: employeeData.status || 'Active',
    };
    const updated = storageService.saveEmployee(finalData);
    setEmployees(updated);
    showToast(isNew ? `Added employee ${finalData.name}` : `Updated employee ${finalData.name}`, 'success');
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const deleteEmployee = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    const updated = storageService.deleteEmployee(employeeId);
    setEmployees(updated);
    showToast(`Removed employee ${emp?.name || employeeId}`, 'info');
  };

  // --- Expense Actions ---
  const addExpense = (expenseData) => {
    const emp = employees.find(e => e.id === expenseData.employeeId);
    const newExpense = {
      ...expenseData,
      id: `EXP-${Date.now().toString().slice(-4)}`,
      employeeName: emp ? emp.name : 'Employee',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      syncedToPayroll: false,
    };
    const updated = storageService.saveExpense(newExpense);
    setExpenses(updated);
    showToast(`Expense claim ₹${newExpense.amount} submitted for approval`, 'success');
    setIsAddExpenseModalOpen(false);
  };

  const approveExpense = (expenseId, adminNotes = '') => {
    const exp = expenses.find(e => e.id === expenseId);
    const updated = storageService.updateExpenseStatus(expenseId, 'Approved', adminNotes);
    setExpenses(updated);
    showToast(`Approved expense ₹${exp?.amount} for ${exp?.employeeName}. Synced to Payroll!`, 'success');
  };

  const rejectExpense = (expenseId, adminNotes = '') => {
    const exp = expenses.find(e => e.id === expenseId);
    const updated = storageService.updateExpenseStatus(expenseId, 'Rejected', adminNotes);
    setExpenses(updated);
    showToast(`Rejected expense for ${exp?.employeeName}`, 'warning');
  };

  const deleteExpense = (expenseId) => {
    const updated = storageService.deleteExpense(expenseId);
    setExpenses(updated);
    showToast('Expense claim deleted', 'info');
  };

  // --- Loan Actions ---
  const issueLoan = (loanData) => {
    const emp = employees.find(e => e.id === loanData.employeeId);
    const amount = Number(loanData.amount);
    const monthlyEmi = loanData.repaymentType === 'One-Time' ? amount : Number(loanData.monthlyEmi || (amount / (loanData.tenureMonths || 1)));

    const newLoan = {
      ...loanData,
      id: `LOAN-${Date.now().toString().slice(-4)}`,
      employeeName: emp ? emp.name : 'Employee',
      amount,
      monthlyEmi: Math.round(monthlyEmi),
      totalPaid: 0,
      remainingAmount: amount,
      status: 'Active',
      disbursedDate: loanData.disbursedDate || todayStr,
      repaymentHistory: [],
    };

    const updated = storageService.saveLoan(newLoan);
    setLoans(updated);
    showToast(`Issued ${newLoan.loanType} of ₹${amount} to ${emp?.name}`, 'success');
    setIsIssueLoanModalOpen(false);
  };

  const recordLoanRepayment = (loanId, amount, note) => {
    const updated = storageService.recordLoanPayment(loanId, amount, note);
    setLoans(updated);
    showToast(`Recorded repayment of ₹${amount}`, 'success');
  };

  // --- Company Settings ---
  const updateCompany = (newCompanyData) => {
    const updated = storageService.saveCompany(newCompanyData);
    setCompany(updated);
    showToast('Company profile & payroll settings updated', 'success');
  };

  // --- Payslip Generator Trigger ---
  const openPayslip = (employee, month = selectedMonth, year = selectedYear) => {
    const empAttendance = attendance.filter(a => a.employeeId === employee.id);
    const empExpenses = expenses.filter(e => 
      e.employeeId === employee.id && 
      e.status === 'Approved' && 
      e.date.startsWith(`${year}-${String(month).padStart(2, '0')}`)
    );
    const empLoans = loans.filter(l => l.employeeId === employee.id && l.status === 'Active');

    const payslip = calculateEmployeePayroll({
      employee,
      attendanceRecords: empAttendance,
      approvedExpenses: empExpenses,
      activeLoans: empLoans,
      month,
      year,
      policySettings: {
        pfRate: company.pfRate || 0.12,
        esiRate: company.esiRate || 0.0075,
        professionalTax: company.professionalTax || 200,
      }
    });

    setSelectedPayslipData(payslip);
    setIsPayslipModalOpen(true);
  };

  // --- Work & Task Management Actions ---
  const saveTask = (taskData) => {
    const isNew = !taskData.id;
    const finalData = {
      ...taskData,
      id: taskData.id || `TSK-${Date.now().toString().slice(-4)}`,
      status: taskData.status || 'Pending',
      createdAt: taskData.createdAt || new Date().toISOString(),
    };
    const updated = storageService.saveTask(finalData);
    setTasks(updated);
    showToast(isNew ? `Task created: "${finalData.title}"` : `Task updated`, 'success');
  };

  const completeTaskWithProof = (taskId, { proofPhoto, completionNotes }) => {
    const updated = storageService.completeTaskWithProof(taskId, { proofPhoto, completionNotes });
    setTasks(updated);
    triggerCelebration();
    showToast('Task marked Completed with photo proof verification!', 'success');
  };

  // --- Reset to Demo Data ---
  const resetDemoData = () => {
    const data = storageService.resetToDemo();
    setCompany(data.company);
    setEmployees(data.employees);
    setAttendance(data.attendance);
    setExpenses(data.expenses);
    setLoans(data.loans);
    setTasks(data.tasks);
    showToast('Reset to original sample data successfully!', 'info');
  };

  // --- Suite Switcher & Onboarding Actions ---
  const switchSuiteModule = (moduleKey) => {
    setSuiteModule(moduleKey);
    localStorage.setItem('staffpulse_suite_module', moduleKey);
    if (moduleKey === 'payroll') {
      if (!subscription?.active && !currentUser) {
        navigateTo('payroll_onboarding');
      } else {
        navigateTo('app');
      }
    } else {
      navigateTo('coming_soon');
    }
  };

  const quickDemoBypass = () => {
    const demoSub = {
      active: true,
      tier: 'pro',
      planName: 'Pro Growth (Demo Pass)',
      bypass: true,
      activatedAt: new Date().toISOString()
    };
    setSubscription(demoSub);
    localStorage.setItem('staffpulse_subscription', JSON.stringify(demoSub));
    
    const bypassUser = {
      email: 'demo.admin@staffpulse.io',
      role: 'admin',
      name: 'Operations Lead (Demo)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setCurrentUser(bypassUser);
    setUserRole('admin');
    localStorage.setItem('staffpulse_auth_user', JSON.stringify(bypassUser));

    triggerCelebration();
    showToast('⚡ Instant Demo Access Granted! Welcome to StaffPulse.', 'success');
    navigateTo('app');
  };

  const onboardCompany = ({ companyName, adminName, email, phone, tier = 'pro' }) => {
    const planNames = { starter: 'Starter Free', pro: 'Pro Growth', enterprise: 'Enterprise Scale' };
    const newSub = {
      active: true,
      tier,
      planName: planNames[tier] || 'Pro Growth',
      onboardedAt: new Date().toISOString(),
      companyName,
    };
    setSubscription(newSub);
    localStorage.setItem('staffpulse_subscription', JSON.stringify(newSub));

    if (companyName) {
      updateCompany({
        ...company,
        name: companyName,
        brandName: companyName,
        email: email || company.email,
        phone: phone || company.phone,
      });
    }

    const newUser = {
      email: email || 'admin@staffpulse.io',
      role: 'admin',
      name: adminName || 'Admin Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setCurrentUser(newUser);
    setUserRole('admin');
    localStorage.setItem('staffpulse_auth_user', JSON.stringify(newUser));

    triggerCelebration();
    showToast(`🎉 Welcome aboard! Activated ${planNames[tier]} for ${companyName || 'your company'}.`, 'success');
    navigateTo('app');
  };

  const joinWaitlist = (email, moduleName) => {
    try {
      const waitlist = JSON.parse(localStorage.getItem('staffpulse_waitlist') || '[]');
      waitlist.push({ email, module: moduleName, date: new Date().toISOString() });
      localStorage.setItem('staffpulse_waitlist', JSON.stringify(waitlist));
      showToast(`⭐ Priority waitlist confirmed for StaffPulse ${moduleName.toUpperCase()}!`, 'success');
    } catch {
      showToast(`⭐ Priority waitlist confirmed!`, 'success');
    }
  };

  // --- Navigation & Auth Actions ---
  const navigateTo = (mode) => {
    setAppMode(mode);
    localStorage.setItem('staffpulse_app_mode', mode);
    if (typeof window !== 'undefined') {
      window.location.hash = '#' + mode;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginUser = async ({ email, password, role = 'admin', employeeId = null, name = null }) => {
    let authResult = { success: true };
    if (password) {
      authResult = await firebaseAuthService.login(email, password);
    }
    
    const emp = employees.find(e => e.id === employeeId || e.email === email);
    const finalUser = {
      email,
      role,
      name: name || (role === 'admin' ? 'HR Administrator' : emp?.name || 'Staff Member'),
      employeeId: employeeId || emp?.id || 'EMP-001',
      avatar: emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    setCurrentUser(finalUser);
    setUserRole(role);
    if (finalUser.employeeId) {
      setActiveEmployeeId(finalUser.employeeId);
    }
    localStorage.setItem('staffpulse_auth_user', JSON.stringify(finalUser));
    navigateTo('app');
    return finalUser;
  };

  const logoutUser = async () => {
    await firebaseAuthService.logout();
    setCurrentUser(null);
    setImpersonatedTenant(null);
    localStorage.removeItem('staffpulse_auth_user');
    showToast('Signed out successfully', 'info');
    navigateTo('landing');
  };

  // --- Super Admin Multi-Tenant Actions ---
  const impersonateTenant = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    setImpersonatedTenant(tenant);
    setCompany(prev => ({
      ...prev,
      name: tenant.name,
      brandName: tenant.brandName,
      code: tenant.code,
      email: tenant.adminEmail,
      phone: tenant.adminPhone,
    }));
    setUserRole('admin');
    setAppMode('app');
    showToast(`👑 Entered workspace of "${tenant.name}" as Super Admin. You can now audit and fix their issues directly!`, 'success');
  };

  const exitImpersonation = () => {
    const defaultComp = storageService.getCompany();
    setImpersonatedTenant(null);
    setCompany(defaultComp);
    setAppMode('superadmin');
    showToast('Exited tenant workspace. Returned to Super Admin Command Center.', 'info');
  };

  const resolveTicket = (ticketId, note) => {
    const updated = supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'Resolved',
          adminResolutionNotes: note,
          resolvedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setSupportTickets(updated);
    localStorage.setItem('staffpulse_support_tickets', JSON.stringify(updated));
    showToast(`Ticket ${ticketId} resolved & fix documented!`, 'success');
  };

  const addTenant = (tenantData) => {
    const updated = [tenantData, ...tenants];
    setTenants(updated);
    localStorage.setItem('staffpulse_tenants', JSON.stringify(updated));
    showToast(`Onboarded new company: ${tenantData.name}`, 'success');
  };

  const updateTenantStatus = (tenantId, newStatus) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem('staffpulse_tenants', JSON.stringify(updated));
    showToast(`Updated account status to ${newStatus}`, 'info');
  };

  // Derived: Current user employee object if in employee mode
  const currentActiveEmployee = useMemo(() => {
    return employees.find(e => e.id === activeEmployeeId) || employees[0];
  }, [employees, activeEmployeeId]);

  // Derived: Today's attendance summary metrics
  const todayMetrics = useMemo(() => {
    const records = attendance.filter(a => a.date === selectedDate);
    const totalStaff = employees.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    let halfDayCount = 0;
    let earlyCount = 0;

    employees.forEach(emp => {
      const rec = records.find(r => r.employeeId === emp.id);
      if (!rec) {
        absentCount++;
      } else if (rec.status === 'Present') {
        presentCount++;
        if (rec.isEarlyDeparture || rec.verificationStatus?.toLowerCase().includes('early')) {
          earlyCount++;
        }
      } else if (rec.status === 'Late') {
        lateCount++;
        presentCount++; // Late counts as present head
      } else if (rec.status === 'Half-Day') {
        halfDayCount++;
        presentCount++;
        if (rec.isEarlyDeparture || rec.verificationStatus?.toLowerCase().includes('early')) {
          earlyCount++;
        }
      } else if (rec.status === 'Leave' || rec.status === 'Paid Leave') {
        leaveCount++;
        absentCount++;
      } else if (rec.status === 'Absent') {
        absentCount++;
      }
    });

    return {
      totalStaff,
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
      halfDayCount,
      earlyCount,
    };
  }, [employees, attendance, selectedDate]);

  return (
    <AppContext.Provider
      value={{
        company,
        employees,
        attendance,
        expenses,
        loans,
        tasks,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        // Suite & Multi-Product Navigation
        suiteModule,
        setSuiteModule,
        switchSuiteModule,
        subscription,
        setSubscription,
        quickDemoBypass,
        onboardCompany,
        joinWaitlist,
        // App View & Auth State
        appMode,
        setAppMode,
        currentUser,
        navigateTo,
        loginUser,
        logoutUser,
        // Super Admin & Multi-Tenancy
        tenants,
        setTenants,
        supportTickets,
        setSupportTickets,
        impersonatedTenant,
        impersonateTenant,
        exitImpersonation,
        resolveTicket,
        addTenant,
        updateTenantStatus,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        userRole,
        setUserRole,
        activeEmployeeId,
        setActiveEmployeeId,
        currentActiveEmployee,
        todayMetrics,
        // Modals & Inspectors
        isPunchModalOpen,
        setIsPunchModalOpen,
        isPayslipModalOpen,
        setIsPayslipModalOpen,
        selectedPayslipData,
        setSelectedPayslipData,
        isEmployeeModalOpen,
        setIsEmployeeModalOpen,
        editingEmployee,
        setEditingEmployee,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
        isIssueLoanModalOpen,
        setIsIssueLoanModalOpen,
        isFirebaseConfigModalOpen,
        setIsFirebaseConfigModalOpen,
        receiptPreviewUrl,
        setReceiptPreviewUrl,
        isFaceTerminalOpen,
        setIsFaceTerminalOpen,
        isMonthlyReportOpen,
        setIsMonthlyReportOpen,
        selectedEmployeeForReport,
        setSelectedEmployeeForReport,
        selectedPunchDetail,
        setSelectedPunchDetail,
        // Actions
        punchIn,
        punchOut,
        updateAttendanceStatus,
        saveEmployee,
        deleteEmployee,
        addExpense,
        approveExpense,
        rejectExpense,
        deleteExpense,
        issueLoan,
        recordLoanRepayment,
        updateCompany,
        openPayslip,
        resetDemoData,
        saveTask,
        completeTaskWithProof,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
