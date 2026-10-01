// Unified Storage Service: Local-First with Firestore Sync capability
import {
  INITIAL_COMPANY,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_EXPENSES,
  INITIAL_LOANS,
  INITIAL_TASKS
} from './seedData';
import { isFirebaseActive, firestoreService } from './firebase';

const STORAGE_KEYS = {
  COMPANY: 'workpulse_company',
  EMPLOYEES: 'workpulse_employees',
  ATTENDANCE: 'workpulse_attendance',
  EXPENSES: 'workpulse_expenses',
  LOANS: 'workpulse_loans',
  TASKS: 'workpulse_tasks',
};

// Safe localStorage read with seed fallback
const loadLocal = (key, defaultData) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
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
  // --- Company Settings ---
  getCompany() {
    return loadLocal(STORAGE_KEYS.COMPANY, INITIAL_COMPANY);
  },
  saveCompany(companyData) {
    saveLocal(STORAGE_KEYS.COMPANY, companyData);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('settings', 'company', companyData);
    }
    return companyData;
  },

  // --- Employees ---
  getEmployees() {
    return loadLocal(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },
  saveEmployee(employee) {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);
    let updated;
    if (index >= 0) {
      updated = [...employees];
      updated[index] = { ...employees[index], ...employee };
    } else {
      updated = [employee, ...employees];
    }
    saveLocal(STORAGE_KEYS.EMPLOYEES, updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('employees', employee.id, employee);
    }
    return updated;
  },
  deleteEmployee(employeeId) {
    const employees = this.getEmployees().filter(e => e.id !== employeeId);
    saveLocal(STORAGE_KEYS.EMPLOYEES, employees);
    if (isFirebaseActive()) {
      firestoreService.deleteDocument('employees', employeeId);
    }
    return employees;
  },

  // --- Attendance ---
  getAttendance() {
    return loadLocal(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },
  saveAttendanceRecord(record) {
    const allAttendance = this.getAttendance();
    const index = allAttendance.findIndex(a => a.id === record.id);
    let updated;
    if (index >= 0) {
      updated = [...allAttendance];
      updated[index] = { ...allAttendance[index], ...record };
    } else {
      updated = [record, ...allAttendance];
    }
    saveLocal(STORAGE_KEYS.ATTENDANCE, updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', record.id, record);
    }
    return updated;
  },
  punchIn({ employeeId, employeeName, address, coordinates, selfieUrl, notes, dateStr, timeStr }) {
    const allAttendance = this.getAttendance();
    const id = `ATT-${employeeId}-${dateStr}`;
    const existingIndex = allAttendance.findIndex(a => a.id === id);

    const record = {
      id,
      employeeId,
      employeeName,
      date: dateStr,
      status: "Present",
      currentLiveStatus: "IN",
      punchIn: timeStr,
      punchOut: null,
      inAddress: address || "DLF Cyber City, Gurugram",
      inCoordinates: coordinates || { lat: 28.4950, lng: 77.0895 },
      selfieUrl: selfieUrl || null,
      notes: notes || "",
      workDuration: "In Progress",
      updatedAt: new Date().toISOString(),
    };

    let updated;
    if (existingIndex >= 0) {
      updated = [...allAttendance];
      updated[existingIndex] = {
        ...allAttendance[existingIndex],
        ...record,
      };
    } else {
      updated = [record, ...allAttendance];
    }

    saveLocal(STORAGE_KEYS.ATTENDANCE, updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', id, record);
    }
    return { updatedAttendance: updated, record };
  },
  punchOut({ employeeId, address, dateStr, timeStr }) {
    const allAttendance = this.getAttendance();
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
      outAddress: address || "DLF Cyber City, Gurugram",
      workDuration: "8h 30m",
      updatedAt: new Date().toISOString(),
    };

    const updated = [...allAttendance];
    updated[existingIndex] = record;
    saveLocal(STORAGE_KEYS.ATTENDANCE, updated);

    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('attendance', id, record);
    }
    return { updatedAttendance: updated, record };
  },

  // --- Expenses ---
  getExpenses() {
    return loadLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpense(expense) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    let updated;
    if (index >= 0) {
      updated = [...expenses];
      updated[index] = { ...expenses[index], ...expense };
    } else {
      updated = [expense, ...expenses];
    }
    saveLocal(STORAGE_KEYS.EXPENSES, updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('expenses', expense.id, expense);
    }
    return updated;
  },
  updateExpenseStatus(expenseId, status, adminNotes = '') {
    const expenses = this.getExpenses();
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
    saveLocal(STORAGE_KEYS.EXPENSES, updated);
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
  deleteExpense(expenseId) {
    const expenses = this.getExpenses().filter(e => e.id !== expenseId);
    saveLocal(STORAGE_KEYS.EXPENSES, expenses);
    if (isFirebaseActive()) {
      firestoreService.deleteDocument('expenses', expenseId);
    }
    return expenses;
  },

  // --- Loans & Advances ---
  getLoans() {
    return loadLocal(STORAGE_KEYS.LOANS, INITIAL_LOANS);
  },
  saveLoan(loan) {
    const loans = this.getLoans();
    const index = loans.findIndex(l => l.id === loan.id);
    let updated;
    if (index >= 0) {
      updated = [...loans];
      updated[index] = { ...loans[index], ...loan };
    } else {
      updated = [loan, ...loans];
    }
    saveLocal(STORAGE_KEYS.LOANS, updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('loans', loan.id, loan);
    }
    return updated;
  },
  recordLoanPayment(loanId, paymentAmount, note = 'Manual Repayment') {
    const loans = this.getLoans();
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
    saveLocal(STORAGE_KEYS.LOANS, updated);
    if (isFirebaseActive()) {
      const changed = updated.find(l => l.id === loanId);
      firestoreService.setDocumentWithId('loans', loanId, changed);
    }
    return updated;
  },

  // --- Work & Task Management ---
  getTasks() {
    return loadLocal(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  saveTask(task) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    let updated;
    if (index >= 0) {
      updated = [...tasks];
      updated[index] = { ...tasks[index], ...task };
    } else {
      updated = [task, ...tasks];
    }
    saveLocal(STORAGE_KEYS.TASKS, updated);
    if (isFirebaseActive()) {
      firestoreService.setDocumentWithId('tasks', task.id, task);
    }
    return updated;
  },
  completeTaskWithProof(taskId, { proofPhoto, completionNotes }) {
    const tasks = this.getTasks();
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
    saveLocal(STORAGE_KEYS.TASKS, updated);
    if (isFirebaseActive() && completedItem) {
      firestoreService.setDocumentWithId('tasks', taskId, completedItem);
    }
    return updated;
  },

  // --- Reset to Demo Data ---
  resetToDemo() {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(INITIAL_COMPANY));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(INITIAL_LOANS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    return {
      company: INITIAL_COMPANY,
      employees: INITIAL_EMPLOYEES,
      attendance: INITIAL_ATTENDANCE,
      expenses: INITIAL_EXPENSES,
      loans: INITIAL_LOANS,
      tasks: INITIAL_TASKS,
    };
  }
};
