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
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage = () => {
  const { navigateTo, loginUser, employees, showToast } = useApp();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('superadmin'); // 'superadmin' | 'admin' | 'employee'
  const [selectedStaffId, setSelectedStaffId] = useState(employees[0]?.id || 'EMP-001');

  const [email, setEmail] = useState('superadmin@staffpulse.io');
  const [password, setPassword] = useState('super123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleToggle = (newRole) => {
    setRole(newRole);
    if (newRole === 'superadmin') {
      setEmail('superadmin@staffpulse.io');
      setPassword('super123');
    } else if (newRole === 'admin') {
      setEmail('admin@apexcorp.com');
      setPassword('admin123');
    } else {
      const staff = employees.find(e => e.id === selectedStaffId) || employees[0];
      setEmail(staff.email);
      setPassword('staff123');
    }
  };

  const handleStaffChange = (empId) => {
    setSelectedStaffId(empId);
    const staff = employees.find(e => e.id === empId);
    if (staff) {
      setEmail(staff.email);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === 'superadmin') {
        showToast('👑 Welcome back, Platform Owner! Logged into Super Admin HQ', 'success');
        navigateTo('superadmin');
      } else {
        await loginUser({
          email,
          password,
          role,
          employeeId: role === 'employee' ? selectedStaffId : null,
        });
        showToast(`Welcome back! Logged in as ${role === 'admin' ? 'Administrator' : 'Staff Member'}`, 'success');
        navigateTo('app');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFastDemoLogin = (demoRole) => {
    if (demoRole === 'superadmin') {
      showToast('👑 Switched to Super Admin (Platform Owner)', 'success');
      navigateTo('superadmin');
    } else if (demoRole === 'admin') {
      loginUser({
        email: 'admin@apexcorp.com',
        role: 'admin',
        name: 'HR Administrator',
      });
      showToast('Logged in successfully as Company Admin', 'success');
      navigateTo('app');
    } else {
      const staff = employees.find(e => e.id === selectedStaffId) || employees[0];
      loginUser({
        email: staff.email,
        role: 'employee',
        name: staff.name,
        employeeId: staff.id,
      });
      showToast('Logged in successfully as Staff Member', 'success');
      navigateTo('app');
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
            APX
          </div>
          <span className="font-bold text-sm tracking-tight text-white">StaffPulse</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {authMode === 'login' ? 'Sign In to Portal' : 'Create Staff Account'}
            </h2>
            <p className="text-xs text-slate-400">
              Access your Attendance logs, Payroll slips, and Expense claims
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleRoleToggle('superadmin')}
              className={`py-2 px-1.5 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'superadmin'
                  ? 'bg-purple-900/80 text-amber-300 shadow-xs border border-purple-700 font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleToggle('admin')}
              className={`py-2 px-1.5 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Company HR</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleToggle('employee')}
              className={`py-2 px-1.5 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'employee'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Staff Portal</span>
            </button>
          </div>

          {/* One-Click Demo Fast Logins Banner */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                1-Click Instant Demo Login
              </span>
              <span className="text-[10px] text-slate-500">Pick any role</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('superadmin')}
                className="py-2 px-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-amber-300 text-[11px] font-bold text-center border border-purple-800/80 transition"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('admin')}
                className="py-2 px-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-white text-[11px] font-semibold text-center border border-slate-600/60 transition"
              >
                🛡️ Co. Admin
              </button>
              <button
                type="button"
                onClick={() => handleFastDemoLogin('employee')}
                className="py-2 px-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-[11px] font-semibold text-center border border-emerald-800/60 transition"
              >
                👤 Staff
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* If Staff Self-Service: Allow quick profile picker */}
            {role === 'employee' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Choose Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@apexcorp.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 font-mono">Demo: admin123</span>
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : `Enter ${role === 'admin' ? 'Admin Dashboard' : 'Staff Portal'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 z-10 py-2">
        StaffPulse by ApexCorp • Protected with Firebase Auth & AES-256
      </div>

    </div>
  );
};
