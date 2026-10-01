# StaffPulse — Smart HR, Attendance, Payroll, Expense & Loan Management Platform

> A production-ready, mobile-first business & HR management web application (inspired by platforms like myHisaab and RazorpayX Payroll) built with **React**, **Tailwind CSS**, and **Firebase** (Firestore + Cloud Storage + Auth).

---

## 🌟 Core Modules & Architecture

### 0. SaaS Platform Owner / Super Admin Command Center
- **Multi-Tenant Company Directory**:
  - Monitor all companies using StaffPulse (*e.g., Apex Logistics, Zenith Tech, Metro Hypermarket, UrbanCare Clinics, BuildFast Infra*).
  - Track subscription plan (*Starter Free*, *Growth Pro*, *Enterprise Custom*), Monthly Recurring Revenue (MRR), total staff count, renewal dates, and account status (*Active*, *Trial*, *Suspended*).
  - **1-Click Tenant Workspace Impersonation**: Directly enter any company's live workspace to audit their attendance records, verify payroll calculations, or fix configuration bugs.
- **Customer Problem Solver & Support Triage**:
  - Review tickets and bug reports submitted by company admins (*e.g., daily wage discrepancies, GPS geofence drift, billing issues*).
  - Interactive diagnosis action with instant workspace inspection and resolution documentation.
- **Platform Infrastructure & Global Feature Flags**:
  - Monitor multi-tenant Firestore read/write latency, cloud storage usage, and global feature toggles.
  - Onboard new subscribing companies via the Super Admin modal.

### 1. Client-Side Public Landing Page & Auth Portal
- **High-Converting Public Landing Page**:
  - Hero section with live interactive preview terminal, value propositions, and CTA triggers.
  - Interactive feature showcases for attendance, dual-wage payroll, expense tracking, and loan management.
  - Pricing tiers (*Starter Free*, *Growth Pro*, *Enterprise Custom*) and verified customer testimonials.
- **Triple-Role Authentication Portal**:
  - **Super Admin (Platform Owner)**: Full access to the multi-tenant command center, support desk, and all companies.
  - **Admin / HR Manager**: Company-level controls for payroll calculations, loan disbursements, and expense approvals.
  - **Staff Member Self-Service**: Employee clock-in/out, personal payslips, and field expense claim logger.
  - **1-Click Instant Demo Logins**: Pre-configured accounts for instant verification (`superadmin@staffpulse.io`, `admin@apexcorp.com`, and staff profiles).

### 1. Dashboard & Attendance Statistics
- **Real-Time Daily Attendance Metrics**: Live cards showing Total Staff, Present, Absent, Late Arrivals (past 09:30 AM), and Leave / Half-Day counts for any chosen date.
- **Searchable Live Status Directory**: Real-time status badge (`• LIVE IN` vs `OFFLINE`), live punch in/out timestamps, GPS coordinates with human-readable addresses (e.g. *Connaught Place, Central Delhi*, *DLF Cyber City, Gurugram*), and profile avatars.
- **Interactive Monthly Calendar View**: Color-coded daily status mapping per employee (`P` = Present, `HD` = Half-Day, `L` = Leave, `PL` = Paid Leave, `A` = Absent, `H` = Holidays / Weekly Offs). Click any day to inspect punch times, work duration, GPS location, and manually override status.
- **Biometric & Geo Attendance Terminal**: Instant Clock In / Out modal with simulated camera selfie verification, location geofencing, shift remarks, and celebration confetti.

### 2. Automated Payroll & Salary Calculation Engine
- **Dual Wage Model Support**:
  - **Monthly Salaried Staff**: Computes daily wage rate (`Base / Days In Month`), proportionate Basic, HRA (30%), Special/Conveyance allowances, and deducts unpaid absences.
  - **Daily Wage Staff**: Automatically multiplies daily rate by payable days worked (`Daily Rate × Payable Days`).
- **Dynamic Calculation Formula**:
  $$\text{Payable Days} = \text{Present} + \text{Paid Leaves} + \text{Holidays} + (0.5 \times \text{Half-Days})$$
  $$\text{Gross Earnings} = \text{Basic Earned} + \text{HRA} + \text{Allowances} + \text{Bonus} + \text{Approved Expense Reimbursements}$$
  $$\text{Total Deductions} = \text{PF (12\%)} + \text{ESI (0.75\%)} + \text{Professional Tax (₹200)} + \text{Active Loan EMIs} + \text{Unpaid Absences}$$
  $$\text{Net Salary Payable} = \text{Gross Earnings} - \text{Total Deductions}$$
- **Official Payslip Generator**:
  - Professional, printable summary statement with company header, GSTIN, PAN, and employee bank details.
  - Side-by-side earnings and deduction columns.
  - Net salary payable in figures (₹) and Indian currency words (*e.g., "Forty-One Thousand Two Hundred and Fifty Rupees Only"*).
  - One-click **Print / Save as PDF** support (`@media print` optimized for clean A4 printing without UI clutter).

### 3. Expense Management & Admin Approvals
- **Staff Field Expense Logger**: Field agents can log expenses (*Petrol / Fuel, Client Food & Meetings, Travel / Transit, Tools & Materials, Office Supplies*) with category, amount, date, purpose, and attached bill/receipt images.
- **Admin Review & Float Tracking**:
  - Compares **"Given Amount" (Float Advance issued)** vs. **Claimed Expenses** and remaining balance.
  - One-click **Approve** or **Reject** actions with admin feedback notes.
- **Automated Payroll Sync**: Approved expense amounts automatically sync as reimbursements in the employee's monthly payroll calculation.

### 4. Loan & EMI System
- **Loan Disbursal Engine**: Issue advances (*Medical Emergency, Vehicle Repair, Festival Advance, Equipment Loan*).
- **Repayment Modes**:
  - **Monthly EMI**: Auto-calculates monthly installment across chosen tenure (e.g. 3, 6, 12 months) and automatically subtracts from monthly salary payout.
  - **One-Time Deduction**: Automatically recovered in the next payroll payout.
- **Repayment Ledger**: Tracks total disbursed, total recovered, remaining principal balance, and progress percentage.

### 5. Staff Directory & Wage Settings
- Manage employee profiles: Name, designation, department, contact, wage type, base pay / daily rate, statutory PF/ESI eligibility toggles, and bank accounts.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons, Canvas Confetti.
- **Backend / Database**:
  - **Firebase Firestore**: Cloud database for employees, attendance, expenses, and loans.
  - **Firebase Storage**: Storage bucket for receipt bill images and biometric selfies.
  - **Local-First Fallback Adapter**: Zero-configuration mode with reactive `localStorage` persistence and rich seed data so the app runs immediately without cloud setup.
- **Build Tool**: Vite.

---

## 📁 File Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Top bar with clock, date picker, role toggle, quick punch
│   │   ├── Sidebar.jsx            # Desktop navigation with real-time badges & counters
│   │   ├── MobileNav.jsx          # Mobile bottom navigation bar
│   │   ├── PunchModal.jsx         # Clock in/out terminal with selfie & geolocation
│   │   ├── PayslipModal.jsx       # Printable & downloadable salary statement modal
│   │   ├── EmployeeModal.jsx      # Add/edit staff profile & wage configuration
│   │   ├── AddExpenseModal.jsx    # Log field expense with bill proof upload
│   │   ├── IssueLoanModal.jsx     # Issue loans & configure monthly EMI auto-deductions
│   │   ├── FirebaseConfigModal.jsx# Live Firebase credentials configuration
│   │   ├── ReceiptViewerModal.jsx # Full-resolution receipt proof inspection
│   │   └── ToastContainer.jsx     # Real-time alert notifications
│   ├── views/
│   │   ├── Dashboard.jsx          # Operational command center & live attendance metrics
│   │   ├── AttendanceView.jsx     # Monthly interactive calendar & manual override inspector
│   │   ├── PayrollCalculator.jsx  # Automated payroll calculation table & CSV export
│   │   ├── ExpenseManager.jsx     # Given float advance vs claims, and 1-click approvals
│   │   ├── LoanManager.jsx        # Active loans, recovery progress, & EMI deduction ledger
│   │   ├── EmployeeDirectory.jsx  # Staff profiles & wage settings
│   │   └── SettingsView.jsx       # Company profile, statutory rates, & cloud config
│   ├── context/
│   │   └── AppContext.jsx         # Global state provider & actions
│   ├── services/
│   │   ├── firebase.js            # Firebase SDK setup with fallback detection
│   │   ├── storageService.js      # Unified data access layer (LocalStorage + Firestore)
│   │   └── seedData.js            # Realistic sample dataset (staff, punches, claims, loans)
│   ├── utils/
│   │   ├── payrollEngine.js       # Automated salary formula engine
│   │   └── dateUtils.js           # Date formatting & currency helpers
│   ├── App.jsx                    # Root layout & view router
│   ├── index.css                  # Tailwind styles & print stylesheet
│   └── main.jsx                   # React DOM root entry
├── index.html
├── package.json
└── tailwind.config.js
```

---

## 🛠️ Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port shown in your terminal) in your browser.

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## ☁️ Firebase Configuration (Optional)

The application includes an integrated **Local-First mode** with rich seed data out-of-the-box. To connect your Firebase project:

1. Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
2. Or click the **Cloud Synced / Demo Local** button in the top navigation bar to paste your Firebase credentials directly in the live modal without restarting the app!
