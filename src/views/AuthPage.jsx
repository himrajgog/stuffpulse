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
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage = () => {
  const { navigateTo, loginUser, registerCompany, employees, company, showToast } = useApp();

  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register_company'
  const [identifier, setIdentifier] = useState('admin@apexcorp.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemoDraw, setShowDemoDraw] = useState(false);

  // New Company Registration Form State
  const [regForm, setRegForm] = useState({
    companyName: '',
    adminName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Please enter your Employee ID or Email', 'error');
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

  const handleFastDemoLogin = (demoRole) => {
    if (demoRole === 'superadmin') {
      showToast('👑 Switched to Super Admin (Platform Owner)', 'success');
      navigateTo('superadmin');
    } else if (demoRole === 'admin') {
      loginUser({
        identifier: 'admin@apexcorp.com',
        password: 'admin',
        role: 'admin',
        name: 'HR Administrator',
      });
      showToast('Logged in as Company Admin', 'success');
    } else {
      const staff = employees[0] || { id: 'EMP-001', name: 'Ajay Singh Rajpoot', email: 'ajay.singh@apexcorp.com' };
      loginUser({
        identifier: staff.id,
        password: staff.loginPin || '1234',
        role: 'employee',
        name: staff.name,
        employeeId: staff.id,
      });
      showToast(`Logged in as Staff (${staff.name})`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar: Back to Landing */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-xs">
            SP
          </div>
          <span className="font-bold text-sm tracking-tight text-white">StaffPulse</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {authTab === 'login' ? 'Sign In to Office Portal' : 'Register New Office'}
            </h2>
            <p className="text-xs text-slate-400">
              {authTab === 'login'
                ? 'Enter your Employee ID or Admin Email to access workspace'
                : 'Create an independent company workspace for your organization'}
            </p>
          </div>

          {/* Mode Tabs: Login vs Register Office */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthTab('login')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                authTab === 'login'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthTab('register_company')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                authTab === 'register_company'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4 text-white" />
              <span>Register Office</span>
            </button>
          </div>

          {/* --- TAB 1: LOGIN --- */}
          {authTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Employee ID or Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Employee ID or Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. EMP-001 or admin@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Staff: Enter your assigned ID (e.g. EMP-001)</span>
                  <span className="text-emerald-400 font-medium">PIN: 1234</span>
                </div>
              </div>

              {/* Password or PIN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password / 4-Digit PIN
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Verifying Account...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Credentials Accordion */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDemoDraw(!showDemoDraw)}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-white"
                >
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant 1-Click Demo Logins</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{showDemoDraw ? 'Hide' : 'Show'}</span>
                </button>

                {showDemoDraw && (
                  <div className="grid grid-cols-3 gap-1.5 pt-2.5 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleFastDemoLogin('admin')}
                      className="py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold border border-slate-700 transition"
                    >
                      🛡️ Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFastDemoLogin('employee')}
                      className="py-2 px-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-800 transition"
                    >
                      👤 Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFastDemoLogin('superadmin')}
                      className="py-2 px-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-amber-300 text-[11px] font-bold border border-purple-800 transition"
                    >
                      👑 Owner
                    </button>
                  </div>
                )}
              </div>

            </form>
          )}

          {/* --- TAB 2: REGISTER NEW OFFICE --- */}
          {authTab === 'register_company' && (
            <form onSubmit={handleRegisterCompany} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Office Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regForm.companyName}
                    onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                    placeholder="e.g., Apex Infotech Pvt Ltd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Administrator Name</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regForm.adminName}
                    onChange={(e) => setRegForm({ ...regForm, adminName: e.target.value })}
                    placeholder="e.g., Himraj Gogoi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="admin@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Create Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                <Building className="w-4 h-4" />
                <span>Initialize Office Workspace</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 z-10 py-2">
        StaffPulse • Cloud-Synced Biometric Attendance & Payroll Suite
      </div>

    </div>
  );
};
