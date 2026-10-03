// Unified Multi-Tenant Storage Service for Velo HR: Local-First with Firestore Sync capability
import {
  INITIAL_COMPANY,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_EXPENSES,
  INITIAL_LOANS,
  INITIAL_TASKS
} from './seedData';
import { isFirebaseActive, firestoreService } from './firebase';
import { calculateWorkDuration, evaluatePunchStatus, evaluatePunchOutStatus } from '../utils/dateUtils';

const BASE_KEYS = {
  COMPANY: 'velohr_company',
  EMPLOYEES: 'velohr_employees',
  ATTENDANCE: 'velohr_attendance',
  EXPENSES: 'velohr_expenses',
  LOANS: 'velohr_loans',
  TASKS: 'velohr_tasks',
  TENANTS: 'velohr_tenants',
  LEADS: 'velohr_leads',
};

// Generate scoped key per tenant company
const getTenantKey = (baseKey, companyId = 'comp-001') => `${baseKey}_${companyId || 'comp-001'}`;

// Safe localStorage read with clean fallback
const loadLocal = (key, defaultData) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return defaultData;
    }
    const parsed = JSON.parse(raw);
    // If old mock seed data was stored in localStorage from earlier versions, purge it so it starts empty
    if (Array.isArray(parsed) && parsed.some(item => item?.name === 'Ajay Singh Rajpoot' || (item?.id === 'EMP-001' && item?.email === 'ajay.singh@apexcorp.com'))) {
      localStorage.removeItem(key);
      return defaultData;
    }
    return parsed;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultData;
  }
};

const saveLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
};

export const storageService = {
  // --- Company Settings (Per Tenant) ---
  getCompany(companyId = 'comp-001') {
    const key = getTenantKey(BASE_KEYS.COMPANY, companyId);
    return loadLocal(key, { ...INITIAL_COMPANY, id: companyId });
  },
  saveCompany(companyData) {
    const companyId = companyData?.id || 'comp-001';
    const key = getTenantKey(BASE_KEYS.COMPANY, companyId);
    saveLocal(key, companyData);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('companies', companyId, companyData);
    }
    return companyData;
  },

  // --- Employees (Multi-Tenant) ---
  getEmployees(companyId = 'comp-001') {
    const key = getTenantKey(BASE_KEYS.EMPLOYEES, companyId);
    return loadLocal(key, INITIAL_EMPLOYEES); // Empty array []
  },
  saveEmployee(employee, companyId = 'comp-001') {
    const tenantId = employee.companyId || companyId;
    const employees = this.getEmployees(tenantId);
    const index = employees.findIndex(e => e.id === employee.id);
    const enriched = { ...employee, companyId: tenantId };
    let updated;
    if (index >= 0) {
      updated = [...employees];
      updated[index] = { ...employees[index], ...enriched };
    } else {
      updated = [enriched, ...employees];
    }
    saveLocal(getTenantKey(BASE_KEYS.EMPLOYEES, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('employees', employee.id, enriched, tenantId);
    }
    return updated;
  },
  deleteEmployee(employeeId, companyId = 'comp-001') {
    const employees = this.getEmployees(companyId).filter(e => e.id !== employeeId);
    saveLocal(getTenantKey(BASE_KEYS.EMPLOYEES, companyId), employees);
    if (isFirebaseActive()) {
      firestoreService.deleteDocument('employees', employeeId);
    }
    return employees;
  },

  // Search employee across all tenants by phone number or employee ID (collision-proof)
  findEmployeeGlobally(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '');
    const cleanTenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : (cleanDigits.length === 10 ? cleanDigits : null);

    // Check all registered tenants
    const tenants = this.getTenants();
    for (const t of tenants) {
      const emps = this.getEmployees(t.id);
      const match = emps.find(e => {
        const empDigits = (e.phone || '').replace(/\D/g, '');
        const empTenDigits = empDigits.length >= 10 ? empDigits.slice(-10) : empDigits;
        const phoneMatch = Boolean(cleanTenDigits && empTenDigits && (empTenDigits === cleanTenDigits));
        const idMatch = e.id && e.id.toLowerCase() === cleanId;
        const emailMatch = e.email && e.email.toLowerCase() === cleanId;
        return phoneMatch || idMatch || emailMatch;
      });
      if (match) {
        return { employee: match, companyId: t.id, company: this.getCompany(t.id) };
      }
    }

    // Also check default workspace 'comp-001'
    const defaultEmps = this.getEmployees('comp-001');
    const defaultMatch = defaultEmps.find(e => {
      const empDigits = (e.phone || '').replace(/\D/g, '');
      const empTenDigits = empDigits.length >= 10 ? empDigits.slice(-10) : empDigits;
      const phoneMatch = Boolean(cleanTenDigits && empTenDigits && (empTenDigits === cleanTenDigits));
      const idMatch = e.id && e.id.toLowerCase() === cleanId;
      const emailMatch = e.email && e.email.toLowerCase() === cleanId;
      return phoneMatch || idMatch || emailMatch;
    });

    if (defaultMatch) {
      return { employee: defaultMatch, companyId: 'comp-001', company: this.getCompany('comp-001') };
    }

    return null;
  },

  // --- Attendance (Multi-Tenant) ---
  getAttendance(companyId = 'comp-001') {
    const key = getTenantKey(BASE_KEYS.ATTENDANCE, companyId);
    return loadLocal(key, INITIAL_ATTENDANCE); // Empty array []
  },
  saveAttendanceRecord(record, companyId = 'comp-001') {
    const tenantId = record.companyId || companyId;
    const allAttendance = this.getAttendance(tenantId);
    const index = allAttendance.findIndex(a => a.id === record.id);
    const enriched = { ...record, companyId: tenantId };
    let updated;
    if (index >= 0) {
      updated = [...allAttendance];
      updated[index] = { ...allAttendance[index], ...enriched };
    } else {
      updated = [enriched, ...allAttendance];
    }
    saveLocal(getTenantKey(BASE_KEYS.ATTENDANCE, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', record.id, enriched, tenantId);
    }
    return updated;
  },
  punchIn({ employeeId, employeeName, address, coordinates, selfieUrl, notes, dateStr, timeStr, companyId = 'comp-001' }) {
    const tenantId = companyId || 'comp-001';
    const allAttendance = this.getAttendance(tenantId);
    const company = this.getCompany(tenantId);
    const id = `ATT-${employeeId}-${dateStr}`;
    const existingIndex = allAttendance.findIndex(a => a.id === id);

    // Evaluate shift policy (Present vs Late vs Half-Day)
    const shiftEvaluation = evaluatePunchStatus(
      timeStr,
      company?.shiftStartTime || '09:30',
      company?.shiftGracePeriodMins ?? 15,
      company?.shiftHalfDayThresholdHours ?? 4.5
    );

    let updated;
    let record;

    if (existingIndex >= 0) {
      const existing = allAttendance[existingIndex];
      // Prevent duplicate punch-in if already clocked IN
      if (existing.currentLiveStatus === 'IN') {
        throw new Error(`Already clocked in today at ${existing.punchIn}. Please clock out before clocking in again.`);
      }

      // Re-punch / return: preserve original morning punchIn time!
      const newPunches = [
        ...(existing.punches || []),
        { type: 'IN', time: timeStr, address: address || "Office HQ Terminal", coordinates, selfieUrl }
      ];

      record = {
        ...existing,
        currentLiveStatus: "IN",
        punchOut: null,
        workDuration: "In Progress",
        notes: notes ? `${existing.notes || ''} | ${notes}` : existing.notes,
        punches: newPunches,
        updatedAt: new Date().toISOString(),
      };
      updated = [...allAttendance];
      updated[existingIndex] = record;
    } else {
      // First punch in of the day
      record = {
        id,
        companyId: tenantId,
        employeeId,
        employeeName,
        date: dateStr,
        status: shiftEvaluation.status,
        isLate: shiftEvaluation.isLate,
        lateMinutes: shiftEvaluation.lateMinutes,
        currentLiveStatus: "IN",
        punchIn: timeStr,
        firstPunchIn: timeStr,
        punchOut: null,
        inAddress: address || "Office HQ Terminal",
        inCoordinates: coordinates || { lat: 26.8532, lng: 75.7681 },
        selfieUrl: selfieUrl || null,
        notes: notes || (shiftEvaluation.isLate ? `Late arrival by ${shiftEvaluation.lateMinutes} mins` : ""),
        workDuration: "In Progress",
        punches: [
          { type: 'IN', time: timeStr, address: address || "Office HQ Terminal", coordinates, selfieUrl }
        ],
        updatedAt: new Date().toISOString(),
      };
      updated = [record, ...allAttendance];
    }

    saveLocal(getTenantKey(BASE_KEYS.ATTENDANCE, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', record.id, record, tenantId);
    }
    return { updatedAttendance: updated, record };
  },
  punchOut({ employeeId, address, dateStr, timeStr, companyId = 'comp-001' }) {
    const tenantId = companyId || 'comp-001';
    const allAttendance = this.getAttendance(tenantId);
    const id = `ATT-${employeeId}-${dateStr}`;
    let existingIndex = allAttendance.findIndex(a => a.id === id);

    // Night Shift / Cross-Midnight shift support: check yesterday's shift if active
    let shiftDateStr = dateStr;
    if (existingIndex < 0) {
      const yesterday = new Date(Date.now() - 86400000);
      const yDateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      const yesterdayId = `ATT-${employeeId}-${yDateStr}`;
      const yIndex = allAttendance.findIndex(a => a.id === yesterdayId);
      if (yIndex >= 0 && allAttendance[yIndex].currentLiveStatus === 'IN') {
        existingIndex = yIndex;
        shiftDateStr = yDateStr;
      }
    }

    if (existingIndex < 0) {
      throw new Error("No active punch-in record found for today. Please clock in first.");
    }

    const current = allAttendance[existingIndex];
    if (current.currentLiveStatus === 'OUT' && current.punchOut) {
      throw new Error(`Already clocked out at ${current.punchOut}. To log more hours, clock in again.`);
    }

    // Accurately compute duration between punches, accounting for break intervals
    const company = this.getCompany(tenantId);
    const effectiveInTime = current.firstPunchIn || current.punchIn;
    const newPunches = [
      ...(current.punches || []),
      { type: 'OUT', time: timeStr, address: address || "Office HQ Terminal" }
    ];
    const realDuration = calculateWorkDuration(effectiveInTime, timeStr, shiftDateStr, dateStr, newPunches);

    // Re-evaluate status based on actual shift duration
    const outEval = evaluatePunchOutStatus(
      realDuration,
      current.status,
      company?.shiftHalfDayThresholdHours || 4.5
    );

    const record = {
      ...current,
      status: outEval.status,
      currentLiveStatus: "OUT",
      punchOut: timeStr,
      outAddress: address || "Office HQ Terminal",
      workDuration: realDuration,
      notes: outEval.reason ? `${current.notes ? current.notes + ' • ' : ''}${outEval.reason}` : current.notes,
      punches: newPunches,
      updatedAt: new Date().toISOString(),
    };

    const updated = [...allAttendance];
    updated[existingIndex] = record;
    saveLocal(getTenantKey(BASE_KEYS.ATTENDANCE, tenantId), updated);

    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', record.id, record, tenantId);
    }
    return { updatedAttendance: updated, record };
  },

  // --- Expenses (Multi-Tenant) ---
  getExpenses(companyId = 'comp-001') {
    const key = getTenantKey(BASE_KEYS.EXPENSES, companyId);
    return loadLocal(key, INITIAL_EXPENSES); // Empty array []
  },
  saveExpense(expense, companyId = 'comp-001') {
    const tenantId = expense.companyId || companyId;
    const expenses = this.getExpenses(tenantId);
    const index = expenses.findIndex(e => e.id === expense.id);
    const enriched = { ...expense, companyId: tenantId };
    let updated;
    if (index >= 0) {
      updated = [...expenses];
      updated[index] = { ...expenses[index], ...enriched };
    } else {
      updated = [enriched, ...expenses];
    }
    saveLocal(getTenantKey(BASE_KEYS.EXPENSES, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('expenses', expense.id, enriched, tenantId);
    }
    return updated;
  },
  updateExpenseStatus(expenseId, status, adminNotes = '', companyId = 'comp-001') {
    const expenses = this.getExpenses(companyId);
    const updated = expenses.map(exp => {
      if (exp.id === expenseId) {
        return {
          ...exp,
          status,
          adminNotes,
          approvedAt: status === 'Approved' ? new Date().toISOString() : null,
          syncedToPayroll: status === 'Approved',
        };
      }
      return exp;
    });
    saveLocal(getTenantKey(BASE_KEYS.EXPENSES, companyId), updated);
    if (isFirebaseActive()) {
      firestoreService.updateDocument('expenses', expenseId, {
        status,
        adminNotes,
        approvedAt: status === 'Approved' ? new Date().toISOString() : null,
        syncedToPayroll: status === 'Approved',
      });
    }
    return updated;
  },
  deleteExpense(expenseId, companyId = 'comp-001') {
    const expenses = this.getExpenses(companyId).filter(e => e.id !== expenseId);
    saveLocal(getTenantKey(BASE_KEYS.EXPENSES, companyId), expenses);
    if (isFirebaseActive()) {
      firestoreService.deleteDocument('expenses', expenseId);
    }
    return expenses;
  },

  // --- Loans & Advances (Multi-Tenant) ---
  getLoans(companyId = 'comp-001') {
    const key = getTenantKey(BASE_KEYS.LOANS, companyId);
    return loadLocal(key, INITIAL_LOANS); // Empty array []
  },
  saveLoan(loan, companyId = 'comp-001') {
    const tenantId = loan.companyId || companyId;
    const loans = this.getLoans(tenantId);
    const index = loans.findIndex(l => l.id === loan.id);
    const enriched = { ...loan, companyId: tenantId };
    let updated;
    if (index >= 0) {
      updated = [...loans];
      updated[index] = { ...loans[index], ...enriched };
    } else {
      updated = [enriched, ...loans];
    }
    saveLocal(getTenantKey(BASE_KEYS.LOANS, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('loans', loan.id, enriched, tenantId);
    }
    return updated;
  },
  recordLoanPayment(loanId, paymentAmount, note = 'Manual Repayment', companyId = 'comp-001') {
    const loans = this.getLoans(companyId);
    const updated = loans.map(loan => {
      if (loan.id === loanId) {
        const newPaid = Number(loan.totalPaid || 0) + Number(paymentAmount);
        const newRemaining = Math.max(0, Number(loan.amount) - newPaid);
        const newStatus = newRemaining === 0 ? 'Closed' : 'Active';
        const history = loan.repaymentHistory || [];
        return {
          ...loan,
          totalPaid: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
          repaymentHistory: [
            ...history,
            {
              date: new Date().toISOString().split('T')[0],
              amount: paymentAmount,
              note,
              deductedViaPayroll: false,
            }
          ]
        };
      }
      return loan;
    });
    saveLocal(getTenantKey(BASE_KEYS.LOANS, companyId), updated);
    if (isFirebaseActive()) {
      const changed = updated.find(l => l.id === loanId);
      firestoreService.setDocumentWithId('loans', loanId, changed, companyId);
    }
    return updated;
  },

  // --- Work & Task Management (Multi-Tenant) ---
  getTasks(companyId = 'comp-001') {
    const key = getTenantKey(BASE_KEYS.TASKS, companyId);
    return loadLocal(key, INITIAL_TASKS); // Empty array []
  },
  saveTask(task, companyId = 'comp-001') {
    const tenantId = task.companyId || companyId;
    const tasks = this.getTasks(tenantId);
    const index = tasks.findIndex(t => t.id === task.id);
    const enriched = { ...task, companyId: tenantId };
    let updated;
    if (index >= 0) {
      updated = [...tasks];
      updated[index] = { ...tasks[index], ...enriched };
    } else {
      updated = [enriched, ...tasks];
    }
    saveLocal(getTenantKey(BASE_KEYS.TASKS, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('tasks', task.id, enriched, tenantId);
    }
    return updated;
  },
  completeTaskWithProof(taskId, { proofPhoto, completionNotes }, companyId = 'comp-001') {
    const tasks = this.getTasks(companyId);
    let completedItem = null;
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        completedItem = {
          ...t,
          status: 'Completed',
          proofPhoto,
          completionNotes,
          completedAt: new Date().toISOString(),
        };
        return completedItem;
      }
      return t;
    });
    saveLocal(getTenantKey(BASE_KEYS.TASKS, companyId), updated);
    if (isFirebaseActive() && completedItem) {
      firestoreService.setDocumentWithId('tasks', taskId, completedItem, companyId);
    }
    return updated;
  },

  // --- Lead & Demo Access Gateway ---
  saveLead(leadData) {
    const leads = loadLocal(BASE_KEYS.LEADS, []);
    const enriched = {
      ...leadData,
      id: `LEAD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: leadData.status || 'Demo Access Issued',
      type: leadData.type || 'demo_request',
    };
    const updated = [enriched, ...leads];
    saveLocal(BASE_KEYS.LEADS, updated);
    if (isFirebaseActive()) {
      firestoreService.addDocument('inquiries', enriched);
    }
    return enriched;
  },
  getLeads() {
    return loadLocal(BASE_KEYS.LEADS, []);
  },

  // Client Self-Registration Pipeline
  registerTrialLead({ fullName, companyName, email, phone, password, staffCount }) {
    const tenantId = `TENANT-${Date.now().toString().slice(-4)}`;
    const newLead = {
      id: `INQ-${Date.now().toString().slice(-4)}`,
      tenantId,
      name: companyName,
      companyName,
      adminName: fullName,
      adminEmail: email,
      adminPhone: phone,
      staffCount: Number(staffCount) || 15,
      password,
      status: 'pending_approval',
      type: 'trial_signup',
      requestedAt: new Date().toISOString(),
      plan: 'Growth Pro (14-Day Free Trial)',
      city: 'India',
      industry: 'Enterprise Services',
    };

    // Save to Inquiries / Leads
    const currentLeads = this.getLeads();
    const updatedLeads = [newLead, ...currentLeads];
    saveLocal(BASE_KEYS.LEADS, updatedLeads);

    // Provision clean, empty company workspace for this tenant
    const newCompany = {
      ...INITIAL_COMPANY,
      id: tenantId,
      name: companyName,
      adminName: fullName,
      email,
      phone,
      adminPassword: password,
      subscriptionStatus: 'pending_approval',
      planTier: 'pro',
      subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    this.saveCompany(newCompany);

    // Save to tenants list
    const tenants = loadLocal(BASE_KEYS.TENANTS, []);
    const newTenantRecord = {
      id: tenantId,
      name: companyName,
      brandName: companyName.split(' ')[0] || 'VeloHR',
      code: (companyName.slice(0, 3) || 'VHR').toUpperCase(),
      adminName: fullName,
      adminEmail: email,
      adminPhone: phone,
      plan: 'Growth Pro',
      billingCycle: 'Monthly',
      mrr: 1499,
      status: 'pending_approval',
      staffCount: Number(staffCount) || 15,
      payrollProcessedThisMonth: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      city: 'India',
      industry: 'Services',
    };
    saveLocal(BASE_KEYS.TENANTS, [newTenantRecord, ...tenants]);

    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('tenants', tenantId, newTenantRecord);
      firestoreService.setDocumentWithId('inquiries', newLead.id, newLead);
    }

    return { lead: newLead, tenant: newTenantRecord, company: newCompany };
  },

  // One-Click Trial Activation by Master Super Admin
  activateTrialTenant(tenantId) {
    const tenants = loadLocal(BASE_KEYS.TENANTS, []);
    let activatedTenant = null;
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const updatedTenants = tenants.map(t => {
      if (t.id === tenantId) {
        activatedTenant = {
          ...t,
          status: 'Trial',
          renewalDate: expiryDate,
        };
        return activatedTenant;
      }
      return t;
    });
    saveLocal(BASE_KEYS.TENANTS, updatedTenants);

    // Update Company subscription status
    const company = this.getCompany(tenantId);
    if (company) {
      const updatedCompany = {
        ...company,
        subscriptionStatus: 'trial',
        subscriptionExpiresAt: expiryDate,
      };
      this.saveCompany(updatedCompany);
    }

    // Update Inquiries status
    const leads = this.getLeads();
    const updatedLeads = leads.map(l => {
      if (l.tenantId === tenantId || l.id === tenantId) {
        return { ...l, status: 'Trial Activated' };
      }
      return l;
    });
    saveLocal(BASE_KEYS.LEADS, updatedLeads);

    if (isFirebaseActive() && activatedTenant) {
      firestoreService.setDocumentWithId('tenants', tenantId, activatedTenant);
    }

    return activatedTenant;
  },

  // --- Reset Tenant to Clean State ---
  resetTenantToClean(companyId = 'comp-001') {
    const cleanCompany = { ...INITIAL_COMPANY, id: companyId };
    saveLocal(getTenantKey(BASE_KEYS.COMPANY, companyId), cleanCompany);
    saveLocal(getTenantKey(BASE_KEYS.EMPLOYEES, companyId), []);
    saveLocal(getTenantKey(BASE_KEYS.ATTENDANCE, companyId), []);
    saveLocal(getTenantKey(BASE_KEYS.EXPENSES, companyId), []);
    saveLocal(getTenantKey(BASE_KEYS.LOANS, companyId), []);
    saveLocal(getTenantKey(BASE_KEYS.TASKS, companyId), []);
    return {
      company: cleanCompany,
      employees: [],
      attendance: [],
      expenses: [],
      loans: [],
      tasks: [],
    };
  }
};
