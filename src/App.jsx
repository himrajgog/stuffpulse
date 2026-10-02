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
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop toggle

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <AttendanceView />;
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Super Admin Access Protected</h2>
            <p className="text-xs text-slate-400">
              Only the Master Super Admin can access the platform owner command center. Please sign in with master credentials.
            </p>
            <button
              onClick={() => navigateTo('login')}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              Sign In as Master Admin
            </button>
          </div>
          <ToastContainer />
        </div>
      );
    }

    return (
      <>
        <SuperAdminPanel />
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

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}
