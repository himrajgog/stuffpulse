import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { getTodayDateString } from '../utils/dateUtils';
import { calculateEmployeePayroll, calculateAllPayrolls } from '../utils/payrollEngine';
import { firebaseAuthService, firestoreService, isFirebaseActive } from '../services/firebase';
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
      if (hash && (hash.includes('features') || hash.includes('pricing') || hash.includes('compliance') || hash.includes('landing'))) {
        return 'landing';
      }
      const saved = localStorage.getItem('velohr_app_mode');
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
      } else if (hash === '#landing' || hash === '' || hash.includes('features') || hash.includes('pricing') || hash.includes('compliance')) {
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
      const saved = localStorage.getItem('velohr_tenants');
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [leads, setLeads] = useState(() => storageService.getLeads());

  const [supportTickets, setSupportTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('velohr_support_tickets');
      return saved ? JSON.parse(saved) : INITIAL_SUPPORT_TICKETS;
    } catch {
      return INITIAL_SUPPORT_TICKETS;
    }
  });

  const [impersonatedTenant, setImpersonatedTenant] = useState(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('velohr_auth_user');
      return saved ? JSON.parse(saved) : {
        email: 'admin@company.com',
        role: 'admin',
        name: 'Company Administrator',
      };
    } catch {
      return { email: 'admin@company.com', role: 'admin', name: 'Company Administrator' };
    }
  });

  // Multi-Tenant Company & Entities State (Starts completely empty for real live entries)
  const initialCompanyId = impersonatedTenant?.id || 'comp-001';
  const [company, setCompany] = useState(() => storageService.getCompany(initialCompanyId));
  const currentCompanyId = impersonatedTenant?.id || company?.id || 'comp-001';

  const [employees, setEmployees] = useState(() => storageService.getEmployees(currentCompanyId));
  const [attendance, setAttendance] = useState(() => storageService.getAttendance(currentCompanyId));
  const [expenses, setExpenses] = useState(() => storageService.getExpenses(currentCompanyId));
  const [loans, setLoans] = useState(() => storageService.getLoans(currentCompanyId));
  const [tasks, setTasks] = useState(() => storageService.getTasks(currentCompanyId));

  // Platform-wide metrics for Super Admin overview
  const [platformStats, setPlatformStats] = useState({
    totalCompanies: tenants?.length || 0,
    activeSubscriptions: tenants?.filter(t => t.status === 'Active')?.length || 0,
    totalRevenue: tenants?.reduce((sum, t) => sum + (t.mrr || t.monthlyBilling || 0), 0) || 0,
    totalStaffAcrossPlatform: 0,
    tierCounts: { starter: 1, pro: 3, enterprise: 1 }
  });

  // Real-time synchronization across mobile & desktop when Firebase is configured (Filtered by Tenant)
  useEffect(() => {
    // Reload local scoped data for tenant
    setEmployees(storageService.getEmployees(currentCompanyId));
    setAttendance(storageService.getAttendance(currentCompanyId));
    setExpenses(storageService.getExpenses(currentCompanyId));
    setLoans(storageService.getLoans(currentCompanyId));
    setTasks(storageService.getTasks(currentCompanyId));

    if (!isFirebaseActive()) return;

    const unsubEmployees = firestoreService.subscribeToCollection('employees', (remoteEmployees) => {
      setEmployees(remoteEmployees || []);
      localStorage.setItem(`velohr_employees_${currentCompanyId}`, JSON.stringify(remoteEmployees || []));
    }, currentCompanyId);

    const unsubAttendance = firestoreService.subscribeToCollection('attendance', (remoteAttendance) => {
      setAttendance(remoteAttendance || []);
      localStorage.setItem(`velohr_attendance_${currentCompanyId}`, JSON.stringify(remoteAttendance || []));
    }, currentCompanyId);

    const unsubExpenses = firestoreService.subscribeToCollection('expenses', (remoteExpenses) => {
      setExpenses(remoteExpenses || []);
      localStorage.setItem(`velohr_expenses_${currentCompanyId}`, JSON.stringify(remoteExpenses || []));
    }, currentCompanyId);

    const unsubTasks = firestoreService.subscribeToCollection('tasks', (remoteTasks) => {
      setTasks(remoteTasks || []);
      localStorage.setItem(`velohr_tasks_${currentCompanyId}`, JSON.stringify(remoteTasks || []));
    }, currentCompanyId);

    const unsubLoans = firestoreService.subscribeToCollection('loans', (remoteLoans) => {
      setLoans(remoteLoans || []);
      localStorage.setItem(`velohr_loans_${currentCompanyId}`, JSON.stringify(remoteLoans || []));
    }, currentCompanyId);

    // Refresh platform-wide stats for Super Admin
    firestoreService.getPlatformStats().then(stats => {
      if (stats) setPlatformStats(stats);
    });

    return () => {
      unsubEmployees();
      unsubAttendance();
      unsubExpenses();
      unsubTasks();
      unsubLoans();
    };
  }, [currentCompanyId]);

  // Subscription Gateway State
  const [subscription, setSubscription] = useState(() => {
    try {
      const saved = localStorage.getItem('velohr_subscription');
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
  const punchIn = ({ employeeId, address, coordinates, selfieUrl, notes, timeStr, dateStr }) => {
    const emp = employees.find(e => e.id === employeeId);
    const actualToday = getTodayDateString();
    // Security lock: employees cannot tamper with date, punch always uses actual real-world today
    const effectiveDateStr = (userRole === 'admin' && dateStr) ? dateStr : actualToday;
    const nowTime = timeStr || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    try {
      const { updatedAttendance, record } = storageService.punchIn({
        employeeId,
        employeeName: emp ? emp.name : 'Employee',
        address,
        coordinates,
        selfieUrl,
        notes,
        dateStr: effectiveDateStr,
        timeStr: nowTime,
        companyId: currentCompanyId,
      });

      setAttendance(updatedAttendance);
      triggerCelebration();
      const statusNote = record.status === 'Late' ? ` (Marked Late by ${record.lateMinutes}m)` : '';
      showToast(`✅ Punch In recorded for ${emp?.name || 'staff'} at ${nowTime}${statusNote}!`, record.status === 'Late' ? 'info' : 'success');
      return record;
    } catch (err) {
      showToast(`⚠️ ${err.message}`, 'error');
      return null;
    }
  };

  const punchOut = ({ employeeId, address, timeStr, dateStr }) => {
    const emp = employees.find(e => e.id === employeeId);
    const actualToday = getTodayDateString();
    const effectiveDateStr = (userRole === 'admin' && dateStr) ? dateStr : actualToday;
    const nowTime = timeStr || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    try {
      const { updatedAttendance, record } = storageService.punchOut({
        employeeId,
        address,
        dateStr: effectiveDateStr,
        timeStr: nowTime,
        companyId: currentCompanyId,
      });

      setAttendance(updatedAttendance);
      showToast(`🏁 Punch Out recorded for ${emp?.name || 'staff'} at ${nowTime}. Total shift: ${record.workDuration}`, 'info');
      return record;
    } catch (err) {
      showToast(`⚠️ ${err.message}`, 'error');
      return null;
    }
  };

  const updateAttendanceStatus = (recordId, newStatus) => {
    if (userRole === 'employee') {
      showToast('⚠️ Permission Denied: Staff members cannot override attendance records.', 'error');
      return;
    }

    const actualToday = getTodayDateString();
    // Parse target date from recordId (e.g. ATT-EMP-101-2026-10-15)
    const idParts = (recordId || '').split('-');
    // Date parts are the last 3 tokens: YYYY-MM-DD
    const targetDate = idParts.slice(-3).join('-');

    if (targetDate && targetDate > actualToday) {
      showToast('⚠️ Attendance cannot be marked or modified for future dates.', 'error');
      return;
    }

    let found = false;
    let targetRecord = null;
    const updated = attendance.map(a => {
      if (a.id === recordId) {
        found = true;
        targetRecord = {
          ...a,
          status: newStatus,
          currentLiveStatus: newStatus === 'Present' || newStatus === 'Late' ? 'IN' : 'OUT',
          updatedAt: new Date().toISOString(),
        };
        return targetRecord;
      }
      return a;
    });

    if (!found) {
      // Reconstitute target employee ID from recordId
      const empId = idParts.slice(1, -3).join('-') || employees[0]?.id;
      const emp = employees.find(e => e.id === empId);
      targetRecord = {
        id: recordId,
        companyId: currentCompanyId,
        employeeId: empId,
        employeeName: emp?.name || 'Staff Member',
        date: targetDate || actualToday,
        status: newStatus,
        currentLiveStatus: newStatus === 'Present' || newStatus === 'Late' ? 'IN' : 'OUT',
        punchIn: newStatus === 'Present' ? (company?.shiftStartTime || '09:30') : null,
        punchOut: newStatus === 'Present' ? (company?.shiftEndTime || '18:30') : null,
        workDuration: newStatus === 'Present' ? '8h 30m' : newStatus === 'Half-Day' ? '4h 0m' : '0h',
        notes: `Manual HR Override by ${currentUser?.name || 'Admin'}`,
        updatedAt: new Date().toISOString(),
      };
      updated.push(targetRecord);
    }

    setAttendance(updated);
    storageService.saveAttendanceRecord(targetRecord, currentCompanyId);
    showToast(`Attendance marked as ${newStatus}`, 'success');
  };

  // --- Employee Actions ---
  const saveEmployee = (employeeData) => {
    const isNew = !employeeData.id;
    const finalData = {
      ...employeeData,
      companyId: currentCompanyId,
      id: employeeData.id || `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      status: employeeData.status || 'Active',
    };
    const updated = storageService.saveEmployee(finalData, currentCompanyId);
    setEmployees(updated);
    showToast(isNew ? `Added employee ${finalData.name}` : `Updated employee ${finalData.name}`, 'success');
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const deleteEmployee = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    const updated = storageService.deleteEmployee(employeeId, currentCompanyId);
    setEmployees(updated);
    showToast(`Removed employee ${emp?.name || employeeId}`, 'info');
  };

  // --- Expense Actions ---
  const addExpense = (expenseData) => {
    const emp = employees.find(e => e.id === expenseData.employeeId);
    const newExpense = {
      ...expenseData,
      companyId: currentCompanyId,
      id: `EXP-${Date.now().toString().slice(-4)}`,
      employeeName: emp ? emp.name : 'Employee',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      syncedToPayroll: false,
    };
    const updated = storageService.saveExpense(newExpense, currentCompanyId);
    setExpenses(updated);
    showToast(`Expense claim ₹${newExpense.amount} submitted for approval`, 'success');
    setIsAddExpenseModalOpen(false);
  };

  const approveExpense = (expenseId, adminNotes = '') => {
    const exp = expenses.find(e => e.id === expenseId);
    const updated = storageService.updateExpenseStatus(expenseId, 'Approved', adminNotes, currentCompanyId);
    setExpenses(updated);
    showToast(`Approved expense ₹${exp?.amount} for ${exp?.employeeName}. Synced to Payroll!`, 'success');
  };

  const rejectExpense = (expenseId, adminNotes = '') => {
    const exp = expenses.find(e => e.id === expenseId);
    const updated = storageService.updateExpenseStatus(expenseId, 'Rejected', adminNotes, currentCompanyId);
    setExpenses(updated);
    showToast(`Rejected expense for ${exp?.employeeName}`, 'warning');
  };

  const deleteExpense = (expenseId) => {
    const updated = storageService.deleteExpense(expenseId, currentCompanyId);
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
      companyId: currentCompanyId,
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

    const updated = storageService.saveLoan(newLoan, currentCompanyId);
    setLoans(updated);
    showToast(`Issued ${newLoan.loanType} of ₹${amount} to ${emp?.name}`, 'success');
    setIsIssueLoanModalOpen(false);
  };

  const recordLoanRepayment = (loanId, amount, note) => {
    const updated = storageService.recordLoanPayment(loanId, amount, note, currentCompanyId);
    setLoans(updated);
    showToast(`Recorded repayment of ₹${amount}`, 'success');
  };

  // --- Company Settings ---
  const updateCompany = (newCompanyData) => {
    const enriched = { ...newCompanyData, id: currentCompanyId };
    const updated = storageService.saveCompany(enriched);
    setCompany(updated);
    showToast('Company profile & payroll settings updated', 'success');
  };

  // --- Payslip Generator Trigger ---
  const openPayslip = (employee, month = selectedMonth, year = selectedYear) => {
    if (!employee) return;
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
      companyId: currentCompanyId,
      id: taskData.id || `TSK-${Date.now().toString().slice(-4)}`,
      status: taskData.status || 'Pending',
      createdAt: taskData.createdAt || new Date().toISOString(),
    };
    const updated = storageService.saveTask(finalData, currentCompanyId);
    setTasks(updated);
    showToast(isNew ? `Task created: "${finalData.title}"` : `Task updated`, 'success');
  };

  const completeTaskWithProof = (taskId, { proofPhoto, completionNotes }) => {
    const updated = storageService.completeTaskWithProof(taskId, { proofPhoto, completionNotes }, currentCompanyId);
    setTasks(updated);
    triggerCelebration();
    showToast('Task marked Completed with photo proof verification!', 'success');
  };

  // --- Reset Tenant Data ---
  const resetDemoData = () => {
    const data = storageService.resetTenantToClean(currentCompanyId);
    setCompany(data.company);
    setEmployees(data.employees);
    setAttendance(data.attendance);
    setExpenses(data.expenses);
    setLoans(data.loans);
    setTasks(data.tasks);
    showToast('Reset tenant workspace to clean slate.', 'info');
  };

  // --- Subscription & Billing Paywall Engine ---
  const updateSubscriptionStatus = (newStatus) => {
    const updated = {
      ...company,
      subscriptionStatus: newStatus,
    };
    storageService.saveCompany(updated);
    setCompany(updated);
    showToast(`Company billing status updated to: ${newStatus.toUpperCase()}`, 'info');
  };

  const isSubscriptionActive = () => {
    return company?.subscriptionStatus !== 'expired';
  };

  // --- Client / Demo Access Gateway (Lead Capture) ---
  const requestDemoAccess = ({ name, businessName, phone, email, staffCount }) => {
    const demoPassword = `Demo#${Math.floor(1000 + Math.random() * 9000)}`;
    const demoEmail = email || `demo.${(businessName || 'client').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@velohr.com`;
    
    const lead = storageService.saveLead({
      name,
      businessName,
      phone,
      email: demoEmail,
      staffCount,
      generatedPassword: demoPassword,
    });

    return {
      lead,
      credentials: {
        email: demoEmail,
        password: demoPassword,
        name,
        businessName,
      }
    };
  };

  const enterSandboxDemo = (credentials) => {
    const sandboxUser = {
      email: credentials?.email || 'demo@velohr.com',
      role: 'demo',
      name: credentials?.name || 'Demo Explorer',
      businessName: credentials?.businessName || 'Demo Sandbox Corp',
      isSandbox: true,
    };
    setCurrentUser(sandboxUser);
    setUserRole('admin');
    localStorage.setItem('velohr_auth_user', JSON.stringify(sandboxUser));

    setImpersonatedTenant({
      id: 'demo-sandbox',
      name: `${credentials?.businessName || 'Demo Business'} (Sandbox)`,
      plan: 'Growth Pro',
      status: 'Trial',
    });

    triggerCelebration();
    showToast(`🌟 Welcome to Velo HR Sandboxed Demo, ${credentials?.name || 'Explorer'}!`, 'success');
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
    localStorage.setItem('velohr_subscription', JSON.stringify(newSub));

    if (companyName) {
      updateCompany({
        ...company,
        name: companyName,
        brandName: 'Velo HR',
        email: email || company.email,
        phone: phone || company.phone,
        subscriptionStatus: 'active',
      });
    }

    const newUser = {
      email: email || 'admin@velohr.com',
      role: 'admin',
      name: adminName || 'Admin Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    setCurrentUser(newUser);
    setUserRole('admin');
    localStorage.setItem('velohr_auth_user', JSON.stringify(newUser));

    triggerCelebration();
    showToast(`🎉 Welcome to Velo HR! Activated ${planNames[tier]} for ${companyName || 'your company'}.`, 'success');
    navigateTo('app');
  };

  // --- Reports & Export Modal Handler ---
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [reportsModalDefault, setReportsModalDefault] = useState('payroll');

  const openReportsExport = (defaultType = 'payroll') => {
    setReportsModalDefault(defaultType);
    setIsReportsModalOpen(true);
  };

  // --- Navigation & Auth Actions ---
  const navigateTo = (mode) => {
    setAppMode(mode);
    localStorage.setItem('velohr_app_mode', mode);
    if (typeof window !== 'undefined') {
      window.location.hash = '#' + mode;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginUser = async ({ identifier, email, password, role = 'admin', employeeId = null, name = null }) => {
    const rawId = (identifier || email || '').trim();
    const cleanId = rawId.toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. MASTER SUPER ADMIN LOGIN GATEWAY
    if (
      cleanId === 'admin@velohr.com' ||
      cleanId === 'superadmin@velohr.com' ||
      cleanId === 'superadmin' ||
      cleanId === 'master@velohr.com'
    ) {
      if (cleanPass && cleanPass !== 'MasterAdmin#2026' && cleanPass !== 'admin123' && cleanPass !== 'super123') {
        throw new Error('Invalid Master Super Admin credentials. Access denied.');
      }
      const masterUser = {
        email: 'admin@velohr.com',
        role: 'superadmin',
        name: 'Master Super Admin',
        isMaster: true,
      };
      setCurrentUser(masterUser);
      setUserRole('superadmin');
      localStorage.setItem('velohr_auth_user', JSON.stringify(masterUser));
      navigateTo('superadmin');
      return masterUser;
    }

    // 2. SANDBOX DEMO LOGIN GATEWAY
    if (cleanId.startsWith('demo.') || cleanId === 'demo' || cleanId === 'demo@velohr.com') {
      const demoUser = {
        email: cleanId,
        role: 'demo',
        name: name || 'Demo Explorer',
        isSandbox: true,
      };
      setCurrentUser(demoUser);
      setUserRole('admin');
      localStorage.setItem('velohr_auth_user', JSON.stringify(demoUser));
      setImpersonatedTenant({
        id: 'demo-sandbox',
        name: 'Velo HR Sandboxed Demo',
        plan: 'Growth Pro',
        status: 'Trial',
      });
      navigateTo('app');
      return demoUser;
    }

    // 3. COMPANY ADMINISTRATOR LOGIN
    if (cleanId === 'admin' || cleanId === 'admin@apexcorp.com' || cleanId === (company?.email || '').toLowerCase()) {
      if (cleanPass && cleanPass !== 'admin123' && cleanPass !== (company?.adminPassword || '')) {
        throw new Error('Invalid Administrator credentials.');
      }
      const adminUser = {
        email: cleanId.includes('@') ? cleanId : (company?.email || 'admin@apexcorp.com'),
        role: 'admin',
        name: company?.adminName || name || 'HR Administrator',
      };
      setCurrentUser(adminUser);
      setUserRole('admin');
      localStorage.setItem('velohr_auth_user', JSON.stringify(adminUser));
      navigateTo('app');
      return adminUser;
    }

    // 3b. REGISTERED TENANT ADMIN LOGIN
    const matchedTenant = tenants.find(t => 
      (t.adminEmail || '').toLowerCase() === cleanId || 
      (t.email || '').toLowerCase() === cleanId
    );
    if (matchedTenant) {
      if (matchedTenant.status === 'pending_approval' || matchedTenant.status === 'new_lead') {
        throw new Error('Your organization registration is currently pending Super Admin review. Please allow a few moments for trial activation.');
      }
      const adminUser = {
        email: cleanId,
        role: 'admin',
        name: matchedTenant.adminName || matchedTenant.name,
        companyId: matchedTenant.id,
      };
      setCompany(storageService.getCompany(matchedTenant.id));
      setCurrentUser(adminUser);
      setUserRole('admin');
      localStorage.setItem('velohr_auth_user', JSON.stringify(adminUser));
      navigateTo('app');
      return adminUser;
    }

    // 4. EMPLOYEE PHONE NUMBER / STAFF ID / PIN LOGIN
    let matchedEmp = employees.find(e => {
      const cleanDigits = cleanId.replace(/\D/g, '');
      const cleanTenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : (cleanDigits.length === 10 ? cleanDigits : null);
      const empDigits = (e.phone || '').replace(/\D/g, '');
      const empTenDigits = empDigits.length >= 10 ? empDigits.slice(-10) : empDigits;
      const phoneMatch = Boolean(cleanTenDigits && empTenDigits && (empTenDigits === cleanTenDigits));
      const idMatch = e.id?.toLowerCase() === cleanId;
      const emailMatch = e.email?.toLowerCase() === cleanId;
      return phoneMatch || idMatch || emailMatch;
    });

    let empCompanyId = currentCompanyId;

    // If not found in current company, perform cross-tenant global phone/ID search
    if (!matchedEmp) {
      const globalResult = storageService.findEmployeeGlobally(rawId);
      if (globalResult) {
        matchedEmp = globalResult.employee;
        empCompanyId = globalResult.companyId;
        if (empCompanyId !== currentCompanyId) {
          switchCompany(empCompanyId);
        }
      }
    }

    if (matchedEmp) {
      const validPin = matchedEmp.loginPin || '1234';
      if (!cleanPass || cleanPass !== validPin) {
        throw new Error(`Incorrect 4-digit PIN for ${matchedEmp.name}. Please enter your valid staff PIN.`);
      }

      const staffUser = {
        email: matchedEmp.email,
        phone: matchedEmp.phone,
        role: 'employee',
        name: matchedEmp.name,
        employeeId: matchedEmp.id,
        companyId: empCompanyId,
        avatar: matchedEmp.avatar,
        designation: matchedEmp.designation,
        department: matchedEmp.department,
      };

      setCurrentUser(staffUser);
      setUserRole('employee');
      setActiveEmployeeId(matchedEmp.id);
      setActiveTab('dashboard');
      localStorage.setItem('velohr_auth_user', JSON.stringify(staffUser));
      navigateTo('app');
      return staffUser;
    }

    // 4. Fallback if user explicitly passed an employeeId (e.g. fast demo login button)
    if (employeeId) {
      const emp = employees.find(e => e.id === employeeId);
      const user = {
        email: emp?.email || `${employeeId.toLowerCase()}@velohr.com`,
        role: role,
        name: emp?.name || name || 'Staff Member',
        employeeId: employeeId,
        avatar: emp?.avatar,
      };
      setCurrentUser(user);
      setUserRole(role);
      setActiveEmployeeId(employeeId);
      localStorage.setItem('velohr_auth_user', JSON.stringify(user));
      navigateTo('app');
      return user;
    }

    throw new Error(`No account found matching "${rawId}". Enter your Employee ID (e.g. EMP-001) or Email.`);
  };

  const registerCompany = ({ companyName, adminName, email, phone, password }) => {
    const updatedCompany = {
      ...company,
      name: companyName,
      email,
      phone,
      adminName,
      adminPassword: password,
    };
    storageService.saveCompany(updatedCompany);
    setCompany(updatedCompany);

    const adminUser = {
      email,
      role: 'admin',
      name: adminName,
    };
    setCurrentUser(adminUser);
    setUserRole('admin');
    localStorage.setItem('velohr_auth_user', JSON.stringify(adminUser));
    navigateTo('app');
    showToast(`🏢 Welcome ${companyName}! Office workspace initialized.`, 'success');
  };

  const logoutUser = async () => {
    await firebaseAuthService.logout();
    setCurrentUser(null);
    setImpersonatedTenant(null);
    localStorage.removeItem('velohr_auth_user');
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
    localStorage.setItem('velohr_support_tickets', JSON.stringify(updated));
    showToast(`Ticket ${ticketId} resolved & fix documented!`, 'success');
  };

  const addTenant = (tenantData) => {
    const updated = [tenantData, ...tenants];
    setTenants(updated);
    localStorage.setItem('velohr_tenants', JSON.stringify(updated));
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
    localStorage.setItem('velohr_tenants', JSON.stringify(updated));
    showToast(`Updated account status to ${newStatus}`, 'info');
  };

  const registerTrialLead = (leadData) => {
    const res = storageService.registerTrialLead(leadData);
    setLeads(storageService.getLeads());
    try {
      const savedTenants = localStorage.getItem('velohr_tenants');
      if (savedTenants) setTenants(JSON.parse(savedTenants));
      else setTenants([res.tenant, ...tenants]);
    } catch {
      setTenants([res.tenant, ...tenants]);
    }
    showToast(`🎉 Registration submitted for ${leadData.companyName}! Your 14-day trial request is under review.`, 'success');
    return res;
  };

  const activateTrialTenant = (tenantId) => {
    const activated = storageService.activateTrialTenant(tenantId);
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'Trial' } : t));
    setLeads(storageService.getLeads());
    showToast(`🎉 14-Day Trial activated for tenant!`, 'success');
    return activated;
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
        // Subscription & Paywall Engine
        subscription,
        setSubscription,
        updateSubscriptionStatus,
        isSubscriptionActive,
        requestDemoAccess,
        enterSandboxDemo,
        onboardCompany,
        // Reports & Export Engine
        isReportsModalOpen,
        setIsReportsModalOpen,
        reportsModalDefault,
        setReportsModalDefault,
        openReportsExport,
        // App View & Auth State
        appMode,
        setAppMode,
        currentUser,
        navigateTo,
        loginUser,
        registerCompany,
        logoutUser,
        // Super Admin & Multi-Tenancy
        currentCompanyId,
        platformStats,
        tenants,
        setTenants,
        leads,
        setLeads,
        registerTrialLead,
        activateTrialTenant,
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
