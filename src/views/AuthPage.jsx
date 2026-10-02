// Velo HR — Enterprise Authentication Gateway & Smart Access Routing
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
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage = () => {
  const { navigateTo, loginUser, registerTrialLead, showToast } = useApp();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Standard Universal Login State
  const [identifier, setIdentifier] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Company Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    staffCount: '25',
  });
  const [regLoading, setRegLoading] = useState(false);

  // Universal Authentication Handler with Smart Credential-Based Routing
  const handleLogin = async (e) => {
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
      if (user.role === 'superadmin') {
        showToast('👑 Master Super Admin Verified. Welcome to Operations HQ!', 'success');
      } else {
        showToast(`👋 Welcome back, ${user.name}!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Self-Registration Handler
  const handleRegister = (e) => {
    e.preventDefault();
    if (!regForm.companyName.trim() || !regForm.email.trim() || !regForm.password.trim()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setRegLoading(true);
    try {
      registerTrialLead(regForm);
      setAuthMode('login');
      setIdentifier(regForm.email);
      showToast('🎉 Workspace provisioned! Your 14-day trial request is under review.', 'success');
    } catch (err) {
      showToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans relative selection:bg-blue-600 selection:text-white bg-velo-watermark">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1b3b6f]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar: Back to Landing & Official Brand Name */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/iconlogo.png" alt="Velo HR" className="w-7 h-7 object-contain" />
          <span className="font-extrabold text-sm tracking-tight text-[#1b3b6f]">Velo HR</span>
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        
        {/* Whole Logo Artwork Prominently Centered Above Authentication Card */}
        <div className="text-center mb-6">
          <img
            src="/wholelogo.png"
            alt="Velo HR — Human Resources | Talent Solutions"
            className="h-16 sm:h-20 mx-auto object-contain filter drop-shadow-sm hover:scale-105 transition duration-300"
          />
        </div>

        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/50 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Sign In to Workspace' : 'Start 14-Day Free Trial'}
            </h2>
            <p className="text-xs text-slate-500">
              {authMode === 'login'
                ? 'Enter your work credentials to access your isolated company portal'
                : 'Self-register your organization for automated attendance & payroll'}
            </p>
          </div>

          {/* Clean 2-Way Mode Selector (No visible Super Admin selector) */}
          <div className="grid grid-cols-2 gap-1 bg-[#F5F2EB] p-1.5 rounded-2xl border border-stone-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-2 px-2 rounded-xl transition text-center cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#1b3b6f] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`py-2 px-2 rounded-xl transition text-center cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Company
            </button>
          </div>

          {/* --- MODE 1: STANDARD UNIVERSAL LOGIN --- */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Email or Employee ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin@company.com or EMP-001"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1b3b6f] font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password / PIN
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1b3b6f] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152e56] hover:to-[#09172c] text-white font-extrabold text-sm shadow-md shadow-[#1b3b6f]/20 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              </button>

              {/* Sandboxed Demo Trigger */}
              <div className="pt-3 border-t border-stone-200 text-center">
                <p className="text-xs text-slate-500">
                  New to Velo HR? Explore with zero commitment.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('landing')}
                  className="mt-1.5 text-xs font-extrabold text-[#1b3b6f] hover:text-amber-600 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Request Sandboxed Live Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* --- MODE 2: CLIENT SELF-REGISTRATION --- */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Business Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regForm.companyName}
                    onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                    placeholder="e.g. Apex Global Corp"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (Authorized Signatory)</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="e.g. Himraj Gogoi"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="founder@company.com"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
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
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
              >
                <Building className="w-4 h-4" />
                <span>{regLoading ? 'Provisioning...' : 'Start 14-Day Free Trial'}</span>
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 z-10 py-2">
        Velo HR — Human Resources | Talent Solutions • Multi-Tenant Enterprise Cloud
      </div>

    </div>
  );
};
