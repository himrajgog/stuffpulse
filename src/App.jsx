// Main Application Layout & Router
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { SuiteSelector } from './components/SuiteSelector';

// Public & Auth Views
import { LandingPage } from './views/LandingPage';
import { AuthPage } from './views/AuthPage';
import { SuperAdminPanel } from './views/SuperAdminPanel';
import { PayrollOnboarding } from './views/PayrollOnboarding';
import { ComingSoonModule } from './views/ComingSoonModule';

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
import { ToastContainer } from './components/ToastContainer';
import { Crown, ArrowLeft } from 'lucide-react';

const MainLayout = () => {
  const { activeTab, impersonatedTenant, exitImpersonation } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
              — You have root access to inspect & fix their attendance, salary, and loan records
            </span>
          </div>
          <button
            onClick={exitImpersonation}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1 shrink-0 ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Super Admin HQ</span>
          </button>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar for Desktop & Drawer on Mobile */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          <SuiteSelector />
          <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

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
      <ToastContainer />
    </div>
  );
};

const AppRoot = () => {
  const { appMode, suiteModule } = useApp();

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
    return (
      <>
        <SuperAdminPanel />
        <ToastContainer />
      </>
    );
  }

  if (appMode === 'payroll_onboarding') {
    return (
      <div className="min-h-screen bg-[#FBFAF7] flex flex-col">
        <SuiteSelector />
        <PayrollOnboarding />
        <ToastContainer />
      </div>
    );
  }

  if (appMode === 'coming_soon') {
    return (
      <div className="min-h-screen bg-[#FBFAF7] flex flex-col">
        <SuiteSelector />
        <ComingSoonModule moduleKey={suiteModule} />
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
