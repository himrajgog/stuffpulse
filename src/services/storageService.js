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
    const id = `ATT-${employeeId}-${dateStr}`;
    const existingIndex = allAttendance.findIndex(a => a.id === id);

    const record = {
      id,
      companyId: tenantId,
      employeeId,
      employeeName,
      date: dateStr,
      status: "Present",
      currentLiveStatus: "IN",
      punchIn: timeStr,
      punchOut: null,
      inAddress: address || "Office HQ Terminal",
      inCoordinates: coordinates || { lat: 26.8532, lng: 75.7681 },
      selfieUrl: selfieUrl || null,
      notes: notes || "",
      workDuration: "In Progress",
      updatedAt: new Date().toISOString(),
    };

    let updated;
    if (existingIndex >= 0) {
      updated = [...allAttendance];
      updated[existingIndex] = { ...allAttendance[existingIndex], ...record };
    } else {
      updated = [record, ...allAttendance];
    }

    saveLocal(getTenantKey(BASE_KEYS.ATTENDANCE, tenantId), updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', id, record, tenantId);
    }
    return { updatedAttendance: updated, record };
  },
  punchOut({ employeeId, address, dateStr, timeStr, companyId = 'comp-001' }) {
    const tenantId = companyId || 'comp-001';
    const allAttendance = this.getAttendance(tenantId);
    const id = `ATT-${employeeId}-${dateStr}`;
    const existingIndex = allAttendance.findIndex(a => a.id === id);

    if (existingIndex < 0) {
      throw new Error("No punch-in record found for today.");
    }

    const current = allAttendance[existingIndex];
    const record = {
      ...current,
      currentLiveStatus: "OUT",
      punchOut: timeStr,
      outAddress: address || "Office HQ Terminal",
      workDuration: "8h 30m",
      updatedAt: new Date().toISOString(),
    };

    const updated = [...allAttendance];
    updated[existingIndex] = record;
    saveLocal(getTenantKey(BASE_KEYS.ATTENDANCE, tenantId), updated);

    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', id, record, tenantId);
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
