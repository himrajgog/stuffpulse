// Velo HR — Enterprise Authentication Gateway & Access Control
import React, { useState } from 'react';
import {
  Lock,
  Mail,
  UserCheck,
  Building,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Users,
  Crown,
  KeyRound,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage = () => {
  const { navigateTo, loginUser, registerCompany, employees, showToast } = useApp();

  const [authTab, setAuthTab] = useState('login'); // 'login' | 'superadmin' | 'register_company'
  
  // Standard Client Login State
  const [identifier, setIdentifier] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Master Super Admin Login State
  const [masterEmail, setMasterEmail] = useState('admin@velohr.com');
  const [masterPassword, setMasterPassword] = useState('MasterAdmin#2026');
  const [showMasterPass, setShowMasterPass] = useState(false);

  // New Company Registration Form State
  const [regForm, setRegForm] = useState({
    companyName: '',
    adminName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Client Company Login Handler
  const handleClientLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Please enter your Employee ID or Company Email', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser({
        identifier: identifier.trim(),
        password: password.trim(),
      });
      showToast(`👋 Welcome back, ${user.name}! (${user.role === 'admin' ? 'Company Admin' : user.role === 'superadmin' ? 'Super Admin' : 'Staff Member'})`, 'success');
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Master Super Admin Login Handler
  const handleMasterLogin = async (e) => {
    e.preventDefault();
    if (!masterEmail.trim()) {
      showToast('Please enter Master Super Admin ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser({
        identifier: masterEmail.trim(),
        password: masterPassword.trim(),
      });
      showToast(`👑 Welcome to Super Admin HQ, ${user.name}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Invalid Master Admin credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Register Company Handler
  const handleRegisterCompany = (e) => {
    e.preventDefault();
    if (!regForm.companyName.trim() || !regForm.email.trim() || !regForm.password.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    registerCompany({
      companyName: regForm.companyName,
      adminName: regForm.adminName || 'Admin',
      email: regForm.email,
      phone: regForm.phone,
      password: regForm.password,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans relative selection:bg-blue-600 selection:text-white">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar: Back to Landing & Brand */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
            VHR
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">Velo HR</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {authTab === 'login' && 'Client Organization Portal'}
              {authTab === 'superadmin' && 'Master Super Admin HQ'}
              {authTab === 'register_company' && 'Create Company Workspace'}
            </h2>
            <p className="text-xs text-slate-500">
              {authTab === 'login' && 'Sign in with your company credentials or employee ID'}
              {authTab === 'superadmin' && 'Restricted platform owner gateway with universal oversight'}
              {authTab === 'register_company' && 'Initialize an isolated, multi-tenant workspace on Firestore'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#F5F2EB] p-1.5 rounded-2xl border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthTab('login')}
              className={`py-2 px-2 rounded-xl transition text-center cursor-pointer ${
                authTab === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('superadmin')}
              className={`py-2 px-2 rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1 ${
                authTab === 'superadmin'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register_company')}
              className={`py-2 px-2 rounded-xl transition text-center cursor-pointer ${
                authTab === 'register_company'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* --- TAB 1: CLIENT COMPANY LOGIN --- */}
          {authTab === 'login' && (
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Company Email or Employee ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g., admin@company.com or EMP-001"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password / PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              </button>

              {/* Sandboxed Demo Shortcut */}
              <div className="pt-3 border-t border-stone-200 text-center">
                <p className="text-xs text-slate-500">
                  Exploring Velo HR for the first time?
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('landing')}
                  className="mt-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Sandboxed Demo Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* --- TAB 2: MASTER SUPER ADMIN LOGIN --- */}
          {authTab === 'superadmin' && (
            <form onSubmit={handleMasterLogin} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-purple-900 leading-tight">
                  <span className="font-bold">Platform Master Access:</span> Enter your master administrative credentials to access platform revenue, tenant operations, and support diagnostics.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Master Super Admin ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={masterEmail}
                    onChange={(e) => setMasterEmail(e.target.value)}
                    placeholder="admin@velohr.com"
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showMasterPass ? 'text' : 'password'}
                    required
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-purple-50/50 border border-purple-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterPass(!showMasterPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showMasterPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 hover:from-purple-800 hover:to-indigo-900 text-amber-300 font-black text-sm shadow-lg shadow-purple-900/30 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{loading ? 'Verifying Super Admin...' : 'Unlock Super Admin HQ'}</span>
              </button>
            </form>
          )}

          {/* --- TAB 3: REGISTER NEW COMPANY --- */}
          {authTab === 'register_company' && (
            <form onSubmit={handleRegisterCompany} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regForm.companyName}
                    onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                    placeholder="e.g., Apex Global Corp"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Administrator Name</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regForm.adminName}
                    onChange={(e) => setRegForm({ ...regForm, adminName: e.target.value })}
                    placeholder="e.g., Himraj Gogoi"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Company Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="admin@company.com"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Set Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Building className="w-4 h-4" />
                <span>Initialize Company Workspace</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 z-10 py-2">
        Velo HR — Payroll & Attendance Suite • Multi-Tenant Firestore Architecture
      </div>

    </div>
  );
};
