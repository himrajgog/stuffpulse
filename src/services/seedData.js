// Realistic Seed Data for Attendance, Payroll, Expenses, Loans, and Task Management
import { getTodayDateString } from '../utils/dateUtils';

const today = getTodayDateString();
const currentYear = new Date().getFullYear();
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

export const INITIAL_COMPANY = {
  name: "Apex Logistics & Retail Solutions Pvt. Ltd.",
  brandName: "StaffPulse",
  code: "APX",
  address: "Plot 42, Mansarovar Industrial Area, Jaipur, Rajasthan 302020",
  phone: "+91 98765 43210",
  email: "payroll@staffpulse.io",
  gstin: "08AAACA1234F1Z8",
  pan: "AAACA1234F",
  currency: "INR",
  currencySymbol: "₹",
  pfRate: 0.12,
  esiRate: 0.0125, // 1.25% as requested
  professionalTax: 200,
  allowancesConfig: [
    { id: "allw-hra", name: "House Rent Allowance (HRA)", amount: 5000, type: "fixed" },
    { id: "allw-inc", name: "Monthly Performance Incentive", amount: 2500, type: "fixed" },
    { id: "allw-conv", name: "Conveyance / Petrol Allowance", amount: 1500, type: "fixed" },
  ]
};

// 30 Staff Members categorized under All, Agents, Manager, Sdh
export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-001",
    name: "Ajay Singh Rajpoot",
    email: "ajay.singh@apexcorp.com",
    phone: "+91 98765 11001",
    designation: "Sales Executive",
    department: "Agents",
    wageType: "Monthly",
    baseSalary: 15000,
    dailyRate: 500,
    joiningDate: "2024-01-15",
    isPFEligible: true,
    isESIEligible: true,
    bankName: "HDFC Bank",
    accountNumber: "50100492817201",
    ifsc: "HDFC0001234",
    givenAdvanceFloat: 500, // Float cash ₹500
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra", "allw-inc"],
    allowances: { hra: 5000, incentive: 2500 },
    bonus: 0,
  },
  {
    id: "EMP-002",
    name: "Sidhee Singh",
    email: "sidhee.singh@apexcorp.com",
    phone: "+91 98765 11002",
    designation: "Operations Manager",
    department: "Manager",
    wageType: "Monthly",
    baseSalary: 35000,
    dailyRate: 1166,
    joiningDate: "2023-06-10",
    isPFEligible: true,
    isESIEligible: false,
    bankName: "ICICI Bank",
    accountNumber: "002101567802",
    ifsc: "ICIC0000021",
    givenAdvanceFloat: 2000,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra"],
    allowances: { hra: 5000 },
    bonus: 3000,
  },
  {
    id: "EMP-003",
    name: "Amit Sharma",
    email: "amit.sharma@apexcorp.com",
    phone: "+91 98765 11003",
    designation: "Senior Agent",
    department: "Agents",
    wageType: "Monthly",
    baseSalary: 18000,
    dailyRate: 600,
    joiningDate: "2024-02-01",
    isPFEligible: true,
    isESIEligible: true,
    bankName: "SBI",
    accountNumber: "30981726503",
    ifsc: "SBIN0004567",
    givenAdvanceFloat: 1000,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-inc"],
    allowances: { incentive: 2500 },
    bonus: 0,
  },
  {
    id: "EMP-004",
    name: "Pooja Verma",
    email: "pooja.v@apexcorp.com",
    phone: "+91 98765 11004",
    designation: "Software Developer (SDH)",
    department: "Sdh",
    wageType: "Monthly",
    baseSalary: 45000,
    dailyRate: 1500,
    joiningDate: "2023-09-15",
    isPFEligible: true,
    isESIEligible: false,
    bankName: "Axis Bank",
    accountNumber: "918020034567804",
    ifsc: "UTIB0000123",
    givenAdvanceFloat: 0,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra"],
    allowances: { hra: 5000 },
    bonus: 2000,
  },
  {
    id: "EMP-005",
    name: "Vikram Rathore",
    email: "vikram.r@apexcorp.com",
    phone: "+91 98765 11005",
    designation: "Territory Sales Agent",
    department: "Agents",
    wageType: "Daily",
    baseSalary: 0,
    dailyRate: 750,
    joiningDate: "2024-03-20",
    isPFEligible: false,
    isESIEligible: true,
    bankName: "HDFC Bank",
    accountNumber: "50100492817205",
    ifsc: "HDFC0001234",
    givenAdvanceFloat: 1500,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: [],
    allowances: {},
    bonus: 500,
  },
  {
    id: "EMP-006",
    name: "Kavita Rao",
    email: "kavita.r@apexcorp.com",
    phone: "+91 98765 11006",
    designation: "Branch Manager",
    department: "Manager",
    wageType: "Monthly",
    baseSalary: 40000,
    dailyRate: 1333,
    joiningDate: "2023-04-12",
    isPFEligible: true,
    isESIEligible: false,
    bankName: "Kotak Bank",
    accountNumber: "4512987606",
    ifsc: "KKBK0000451",
    givenAdvanceFloat: 3000,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra", "allw-inc"],
    allowances: { hra: 5000, incentive: 2500 },
    bonus: 4000,
  },
  {
    id: "EMP-007",
    name: "Rohan Kulkarni",
    email: "rohan.k@apexcorp.com",
    phone: "+91 98765 11007",
    designation: "Systems & Cloud Lead",
    department: "Sdh",
    wageType: "Monthly",
    baseSalary: 52000,
    dailyRate: 1733,
    joiningDate: "2023-01-10",
    isPFEligible: true,
    isESIEligible: false,
    bankName: "ICICI Bank",
    accountNumber: "002101567807",
    ifsc: "ICIC0000021",
    givenAdvanceFloat: 0,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra"],
    allowances: { hra: 5000 },
    bonus: 5000,
  },
  {
    id: "EMP-008",
    name: "Deepak Meena",
    email: "deepak.m@apexcorp.com",
    phone: "+91 98765 11008",
    designation: "Customer Acquisition Agent",
    department: "Agents",
    wageType: "Monthly",
    baseSalary: 16000,
    dailyRate: 533,
    joiningDate: "2024-04-01",
    isPFEligible: true,
    isESIEligible: true,
    bankName: "SBI",
    accountNumber: "30981726508",
    ifsc: "SBIN0004567",
    givenAdvanceFloat: 800,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: [],
    allowances: {},
    bonus: 0,
  },
  {
    id: "EMP-009",
    name: "Neha Joshi",
    email: "neha.j@apexcorp.com",
    phone: "+91 98765 11009",
    designation: "Quality Assurance Lead",
    department: "Sdh",
    wageType: "Monthly",
    baseSalary: 38000,
    dailyRate: 1266,
    joiningDate: "2023-10-01",
    isPFEligible: true,
    isESIEligible: false,
    bankName: "HDFC Bank",
    accountNumber: "50100492817209",
    ifsc: "HDFC0001234",
    givenAdvanceFloat: 0,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra"],
    allowances: { hra: 5000 },
    bonus: 1500,
  },
  {
    id: "EMP-010",
    name: "Rajesh Soni",
    email: "rajesh.soni@apexcorp.com",
    phone: "+91 98765 11010",
    designation: "Fleet & Dispatch Manager",
    department: "Manager",
    wageType: "Monthly",
    baseSalary: 33000,
    dailyRate: 1100,
    joiningDate: "2023-08-15",
    isPFEligible: true,
    isESIEligible: false,
    bankName: "Kotak Bank",
    accountNumber: "4512987610",
    ifsc: "KKBK0000451",
    givenAdvanceFloat: 4000,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    status: "Active",
    assignedBenefits: ["allw-hra"],
    allowances: { hra: 5000 },
    bonus: 2000,
  },
  // Employees 11 to 30
  ...Array.from({ length: 20 }, (_, i) => {
    const idx = i + 11;
    const isAgent = idx % 2 === 1;
    const isManager = idx % 4 === 0;
    const dept = isManager ? "Manager" : isAgent ? "Agents" : "Sdh";
    const names = [
      "Manish Gupta", "Snehal Patel", "Gaurav Choudhary", "Tanvi Bhatia",
      "Suresh Yadav", "Harshita Sen", "Ankit Tiwari", "Ritu Goyal",
      "Kamal Nayan", "Megha Kapoor", "Rahul Bhati", "Priyanka Saxena",
      "Vivek Mathur", "Shweta Jain", "Naveen Bishnoi", "Kritika Saini",
      "Bhupesh Rawat", "Monika Sharma", "Tarun Pareek", "Sunita Dadhich"
    ];
    const name = names[i];
    return {
      id: `EMP-${String(idx).padStart(3, '0')}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@apexcorp.com`,
      phone: `+91 98765 ${11000 + idx}`,
      designation: dept === "Manager" ? "Assistant Manager" : dept === "Agents" ? "Field Agent" : "Junior Developer (SDH)",
      department: dept,
      wageType: idx % 6 === 0 ? "Daily" : "Monthly",
      baseSalary: idx % 6 === 0 ? 0 : 15000 + (idx * 600),
      dailyRate: idx % 6 === 0 ? 650 : Math.round((15000 + (idx * 600)) / 30),
      joiningDate: `2024-0${(idx % 6) + 1}-10`,
      isPFEligible: true,
      isESIEligible: idx % 6 === 0 || (15000 + (idx * 600)) <= 21000,
      bankName: "HDFC Bank",
      accountNumber: `501004928172${idx}`,
      ifsc: "HDFC0001234",
      givenAdvanceFloat: isAgent ? 1000 : 0,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + (idx * 1234567)}?w=150&auto=format&fit=crop&q=80`,
      status: "Active",
      assignedBenefits: idx % 3 === 0 ? ["allw-hra", "allw-inc"] : ["allw-hra"],
      allowances: idx % 3 === 0 ? { hra: 5000, incentive: 2500 } : { hra: 5000 },
      bonus: 0,
    };
  })
];

// Today's attendance generator matching EXACTLY:
// 30 Staff Heads, 23 Present, 7 Absent, 1 Late, 1 Leave, 1 Early Departure!
const generateAttendanceRecords = () => {
  const records = [];
  const currentDate = new Date();
  const currentDay = currentDate.getDate();

  INITIAL_EMPLOYEES.forEach((emp, index) => {
    // History records for previous days in month
    for (let d = 1; d <= currentDay; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${currentMonth}-${dayStr}`;
      const dayOfWeek = new Date(currentYear, Number(currentMonth) - 1, d).getDay();

      if (dayOfWeek === 0) {
        // Sunday Weekly Off
        records.push({
          id: `ATT-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status: "Holiday",
          punchIn: null,
          punchOut: null,
          inAddress: null,
          outAddress: null,
          workDuration: "0h",
          selfieUrl: null,
        });
        continue;
      }

      // TODAY'S SPECIFIC ATTENDANCE RULES
      if (d === currentDay) {
        if (index === 0) {
          // Ajay Singh Rajpoot: IN at 9:42 AM, Mansarovar Industrial Area Jaipur
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Present",
            currentLiveStatus: "IN",
            punchIn: "09:42 AM",
            punchOut: null,
            inAddress: "Mansarovar Industrial Area, Jaipur, Rajasthan",
            inCoordinates: { lat: 26.8532, lng: 75.7681 },
            workDuration: "5h 16m",
            selfieUrl: emp.avatar,
            verificationStatus: "Verified Face Match (99.2%)",
          });
        } else if (index === 1) {
          // Sidhee Singh: IN at 10:08 AM, Mansarovar Industrial Area Jaipur
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Present",
            currentLiveStatus: "IN",
            punchIn: "10:08 AM",
            punchOut: null,
            inAddress: "Mansarovar Industrial Area, Jaipur, Rajasthan",
            inCoordinates: { lat: 26.8532, lng: 75.7681 },
            workDuration: "4h 50m",
            selfieUrl: emp.avatar,
            verificationStatus: "Verified Face Match (98.9%)",
          });
        } else if (index === 2) {
          // Amit Sharma: IN at 9:51 AM
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Present",
            currentLiveStatus: "IN",
            punchIn: "09:51 AM",
            punchOut: null,
            inAddress: "RIICO Complex, Mansarovar, Jaipur",
            inCoordinates: { lat: 26.8540, lng: 75.7690 },
            workDuration: "5h 07m",
            selfieUrl: emp.avatar,
            verificationStatus: "Verified Face Match (99.0%)",
          });
        } else if (index === 4) {
          // 1 LATE arrival (Late mark)
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Late",
            currentLiveStatus: "IN",
            punchIn: "10:45 AM",
            punchOut: null,
            inAddress: "Mansarovar Sector 4, Jaipur",
            inCoordinates: { lat: 26.8510, lng: 75.7640 },
            workDuration: "4h 13m",
            selfieUrl: emp.avatar,
            verificationStatus: "Verified Face Match (98.5%)",
          });
        } else if (index === 5) {
          // 1 EARLY Departure (punched out early)
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Half-Day",
            currentLiveStatus: "OUT",
            isEarlyDeparture: true,
            punchIn: "09:00 AM",
            punchOut: "01:30 PM",
            inAddress: "Mansarovar Industrial Area, Jaipur",
            outAddress: "Mansarovar Industrial Area, Jaipur",
            workDuration: "4h 30m",
            selfieUrl: emp.avatar,
            verificationStatus: "Early Departure Approved",
          });
        } else if (index === 23) {
          // 1 LEAVE (Paid / Casual Leave approved)
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Leave",
            currentLiveStatus: "OUT",
            punchIn: null,
            punchOut: null,
            inAddress: null,
            leaveReason: "Planned Medical Leave (Approved)",
            workDuration: "0h",
            selfieUrl: null,
          });
        } else if (index >= 24) {
          // Indices 24 to 29 (6 employees) + Index 23 leave = 7 ABSENCE total
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Absent",
            currentLiveStatus: "OUT",
            punchIn: null,
            punchOut: null,
            inAddress: null,
            workDuration: "0h",
            selfieUrl: null,
          });
        } else {
          // Remaining 19 employees are Present IN (Total Present = 23!)
          const minutes = 10 + (index * 2);
          const time = `09:${String(minutes % 60).padStart(2, '0')} AM`;
          records.push({
            id: `ATT-${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            status: "Present",
            currentLiveStatus: "IN",
            punchIn: time,
            punchOut: null,
            inAddress: "Mansarovar Industrial Area, Jaipur, Rajasthan",
            inCoordinates: { lat: 26.8532, lng: 75.7681 },
            workDuration: "5h 20m",
            selfieUrl: emp.avatar,
            verificationStatus: "Verified Face Match (99.4%)",
          });
        }
        continue;
      }

      // Past days distribution
      const isPastAbsent = (d + index) % 17 === 0;
      const isPastHalfDay = (d + index) % 23 === 0;
      const status = isPastAbsent ? "Absent" : isPastHalfDay ? "Half-Day" : "Present";
      
      records.push({
        id: `ATT-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        employeeName: emp.name,
        date: dateStr,
        status,
        currentLiveStatus: "OUT",
        punchIn: status !== "Absent" ? "09:15 AM" : null,
        punchOut: status === "Present" ? "06:30 PM" : status === "Half-Day" ? "01:30 PM" : null,
        inAddress: "Mansarovar Industrial Area, Jaipur",
        outAddress: "Mansarovar Industrial Area, Jaipur",
        workDuration: status === "Present" ? "9h 15m" : status === "Half-Day" ? "4h 15m" : "0h",
        selfieUrl: emp.avatar,
      });
    }
  });

  return records;
};

export const INITIAL_ATTENDANCE = generateAttendanceRecords();

export const INITIAL_EXPENSES = [
  {
    id: "EXP-101",
    employeeId: "EMP-001",
    employeeName: "Ajay Singh Rajpoot",
    category: "Petrol / Fuel",
    amount: 500, // ₹500 Petrol as specified
    date: `${currentYear}-${currentMonth}-02`,
    remarks: "Field client visit to RIICO industrial area units (approx 35km).",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    status: "Approved",
    approvedAt: `${currentYear}-${currentMonth}-03T10:30:00Z`,
    approvedBy: "Admin / Sidhee Singh",
    adminNotes: "Fuel reimbursement approved against invoice.",
    syncedToPayroll: true,
  },
  {
    id: "EXP-102",
    employeeId: "EMP-001",
    employeeName: "Ajay Singh Rajpoot",
    category: "Food & Client Meeting",
    amount: 2000, // ₹2,000 Food as specified
    date: `${currentYear}-${currentMonth}-04`,
    remarks: "Client lunch meeting with Apex distributor leadership team.",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    status: "Approved",
    approvedAt: `${currentYear}-${currentMonth}-05T14:15:00Z`,
    approvedBy: "Admin / Accounts",
    adminNotes: "Hospitality verified.",
    syncedToPayroll: true,
  },
  {
    id: "EXP-103",
    employeeId: "EMP-003",
    employeeName: "Amit Sharma",
    category: "Courier & Sample Dispatch",
    amount: 650,
    date: `${currentYear}-${currentMonth}-06`,
    remarks: "Priority client document dispatch to Delhi branch.",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    status: "Pending",
    approvedAt: null,
    adminNotes: "",
    syncedToPayroll: false,
  },
  {
    id: "EXP-104",
    employeeId: "EMP-005",
    employeeName: "Vikram Rathore",
    category: "Vehicle Maintenance",
    amount: 1200,
    date: `${currentYear}-${currentMonth}-08`,
    remarks: "Motorcycle brake pad replacement for field duties.",
    receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    status: "Pending",
    approvedAt: null,
    adminNotes: "",
    syncedToPayroll: false,
  }
];

export const INITIAL_LOANS = [
  {
    id: "LOAN-201",
    employeeId: "EMP-001",
    employeeName: "Ajay Singh Rajpoot",
    loanType: "Medical Emergency Loan",
    amount: 30000, // ₹30,000 Medical Loan as specified
    repaymentType: "Monthly EMI",
    tenureMonths: 6,
    monthlyEmi: 500, // ₹500/month EMI as specified
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-06-30`,
    disbursedDate: `${currentYear}-01-02`,
    totalPaid: 1500,
    remainingAmount: 28500,
    status: "Active",
    reason: "Hospitalization advance assistance for family member",
    repaymentHistory: [
      { month: "Jan 2026", amount: 500, deductedViaPayroll: true },
      { month: "Feb 2026", amount: 500, deductedViaPayroll: true },
      { month: "Mar 2026", amount: 500, deductedViaPayroll: true },
    ]
  },
  {
    id: "LOAN-202",
    employeeId: "EMP-003",
    employeeName: "Amit Sharma",
    loanType: "Salary Advance",
    amount: 5000,
    repaymentType: "One-Time",
    tenureMonths: 1,
    monthlyEmi: 5000,
    startDate: `${currentYear}-${currentMonth}-01`,
    endDate: `${currentYear}-${currentMonth}-30`,
    disbursedDate: `${currentYear}-${currentMonth}-01`,
    totalPaid: 0,
    remainingAmount: 5000,
    status: "Active",
    reason: "Short-term festival festival advance against upcoming salary",
    repaymentHistory: []
  }
];

// Initial Tasks for Work & Task Management
export const INITIAL_TASKS = [
  {
    id: "TSK-001",
    title: "Submit GST returns for Q2",
    description: "Reconcile GSTR-1 and GSTR-3B filings with purchase invoices and export ledger.",
    department: "Manager",
    assigneeId: "EMP-002",
    assigneeName: "Sidhee Singh",
    priority: "High",
    status: "Pending", // 'Pending' | 'In Progress' | 'Completed'
    dueDate: "2026-10-15",
    proofPhoto: null,
    completionNotes: null,
    createdAt: "2026-10-01",
  },
  {
    id: "TSK-002",
    title: "Send offer letter to new hire (Sales Exec)",
    description: "Issue appointment letter and salary annexure to selected candidate for Jaipur territory.",
    department: "Manager",
    assigneeId: "EMP-006",
    assigneeName: "Kavita Rao",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2026-10-05",
    proofPhoto: null,
    completionNotes: null,
    createdAt: "2026-10-01",
  },
  {
    id: "TSK-003",
    title: "Payment Collection from Apex Retailers",
    description: "Collect pending float invoice payments of ₹87,600 from RIICO industrial distributors.",
    department: "Agents",
    assigneeId: "EMP-001",
    assigneeName: "Ajay Singh Rajpoot",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-10-03",
    proofPhoto: null,
    completionNotes: null,
    createdAt: "2026-10-01",
  },
  {
    id: "TSK-004",
    title: "Quarterly Statutory PF/ESI submission",
    description: "Generate ECR text file and upload on EPFO portal along with monthly challan payment.",
    department: "Manager",
    assigneeId: "EMP-002",
    assigneeName: "Sidhee Singh",
    priority: "High",
    status: "Pending",
    dueDate: "2026-10-10",
    proofPhoto: null,
    completionNotes: null,
    createdAt: "2026-10-01",
  },
  {
    id: "TSK-005",
    title: "Field asset audit & barcode scanner check",
    description: "Inspect physical scanner devices and mobile app terminal versions on all agent devices.",
    department: "Sdh",
    assigneeId: "EMP-004",
    assigneeName: "Pooja Verma",
    priority: "Low",
    status: "Completed",
    dueDate: "2026-09-30",
    proofPhoto: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    completionNotes: "All 30 handheld barcode terminals audited and synced with latest firmware.",
    createdAt: "2026-09-28",
  }
];
