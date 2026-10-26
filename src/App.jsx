// Main Application Layout & Router - Velo HR
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

// Public & Auth Views
import { LandingPage } from './views/LandingPage';
import { AuthPage } from './views/AuthPage';
import { SuperAdminPanel } from './views/SuperAdminPanel';
import { PayrollOnboarding } from './views/PayrollOnboarding';

// Portal Views
import { Dashboard } from './views/Dashboard';
import { AttendanceView } from './views/AttendanceView';
import { EmployeeDirectory } from './views/EmployeeDirectory';
import { PayrollCalculator } from './views/PayrollCalculator';
import { ExpenseManager } from './views/ExpenseManager';
import { LoanManager } from './views/LoanManager';
import { TaskManager } from './views/TaskManager';
import { SettingsView } from './views/SettingsView';
import { QrKioskView } from './views/QrKioskView';
import { TabletKioskView } from './views/TabletKioskView';
import { SetupWizard } from './components/SetupWizard';

// Modals
import { PunchModal } from './components/PunchModal';
import { PayslipModal } from './components/PayslipModal';
import { EmployeeModal } from './components/EmployeeModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { IssueLoanModal } from './components/IssueLoanModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { FaceTerminalModal } from './components/FaceTerminalModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { PunchInspectorModal } from './components/PunchInspectorModal';
import { ReportsExportModal } from './components/ReportsExportModal';
import { ToastContainer } from './components/ToastContainer';
import { Crown, ArrowLeft } from 'lucide-react';

const MainLayout = () => {
  const {
    activeTab,
    impersonatedTenant,
    exitImpersonation,
    isReportsModalOpen,
    setIsReportsModalOpen,
    reportsModalDefault,
    userRole,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop toggle

  const renderActiveView = () => {
    // Role protection: Employees are blocked from accessing company management views
    if (userRole === 'employee' && (activeTab === 'employees' || activeTab === 'payroll' || activeTab === 'settings')) {
      return <Dashboard />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <AttendanceView />;
      case 'qr_kiosk':
        return <QrKioskView />;
      case 'employees':
        return <EmployeeDirectory />;
      case 'payroll':
        return <PayrollCalculator />;
      case 'expenses':
        return <ExpenseManager />;
      case 'loans':
        return <LoanManager />;
      case 'tasks':
        return <TaskManager />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative bg-velo-watermark">
      {/* Super Admin Workspace Impersonation Banner */}
      {impersonatedTenant && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg sticky top-0 z-50 border-b border-purple-700/60">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-300" />
              <span>SUPER ADMIN DIAGNOSTIC MODE:</span>
              <span className="text-amber-200 underline font-black">{impersonatedTenant.name}</span>
            </div>
            <span className="hidden md:inline text-purple-300">
              — Root diagnostic view for tenant inspection
            </span>
          </div>
          <button
            onClick={exitImpersonation}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Super Admin HQ</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Collapsible Sidebar for Desktop & Drawer on Mobile */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Main Content Area - dynamically adjusts padding when collapsed */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:pl-0' : 'lg:pl-72'
          }`}
        >
          <Navbar
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            isCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {userRole === 'admin' && <SetupWizard />}
            {renderActiveView()}
          </main>

          <MobileNav />
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <PunchModal />
      <PayslipModal />
      <EmployeeModal />
      <AddExpenseModal />
      <IssueLoanModal />
      <FirebaseConfigModal />
      <ReceiptViewerModal />
      <FaceTerminalModal />
      <MonthlyReportModal />
      <PunchInspectorModal />
      <ReportsExportModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        defaultReport={reportsModalDefault}
      />
      <ToastContainer />
    </div>
  );
};

const SuperAdminGate = () => {
  const { loginUser, navigateTo, showToast } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginUser({ identifier: 'admin@velohr.com', password });
      showToast('👑 Master Super Admin Verified. Welcome to Operations HQ!', 'success');
    } catch (err) {
      setError(err.message || 'Invalid Master Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Crown className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white">Super Admin Command Center</h2>
          <p className="text-xs text-slate-400">
            Protected Platform Owner HQ. Enter your Master Super Admin password to unlock multi-tenant diagnostics.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter Master Password"
            required
            autoFocus
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-center tracking-widest"
          />
          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Unlock Super Admin HQ'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            Standard Sign In
          </button>
          <button
            type="button"
            onClick={() => navigateTo('landing')}
            className="text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

const AppRoot = () => {
  const { appMode, currentUser, navigateTo } = useApp();

  if (appMode === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  if (appMode === 'login') {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  if (appMode === 'superadmin') {
    // Access control: only superadmin can view SuperAdminPanel
    if (currentUser?.role !== 'superadmin') {
      return <SuperAdminGate />;
    }

    return (
      <>
        <SuperAdminPanel />
        <ToastContainer />
      </>
    );
  }

  if (appMode === 'kiosk') {
    return (
      <>
        <TabletKioskView />
        <ToastContainer />
      </>
    );
  }

  if (appMode === 'payroll_onboarding') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <PayrollOnboarding />
        <ToastContainer />
      </div>
    );
  }

  // Security Bridge: Unauthenticated visitors must sign in before accessing the workspace
  if (!currentUser) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}
