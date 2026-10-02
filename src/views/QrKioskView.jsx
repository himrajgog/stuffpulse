// Velo HR — Office QR Terminal / Shared Tablet Kiosk View
import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Smartphone,
  UserCheck,
  Camera,
  Maximize2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QrKioskView = () => {
  const { company, employees, attendance, punchIn, showToast } = useApp();
  
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }));
  const [currentDateStr, setCurrentDateStr] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }));

  const [qrToken, setQrToken] = useState(`VELO-QR-${Date.now().toString(36).toUpperCase()}`);
  const [countdown, setCountdown] = useState(30);
  const [simulatedStaffId, setSimulatedStaffId] = useState(employees[0]?.id || '');
  const [lastScannedPunch, setLastScannedPunch] = useState(null);

  // Live Clock & Rotating Token
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      setCountdown(prev => {
        if (prev <= 1) {
          setQrToken(`VELO-QR-${Date.now().toString(36).toUpperCase()}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSimulateScan = () => {
    const targetEmp = employees.find(e => e.id === simulatedStaffId) || employees[0];
    if (!targetEmp) {
      showToast('Please add staff members to simulate QR check-ins', 'error');
      return;
    }

    const record = punchIn({
      employeeId: targetEmp.id,
      address: `${company?.name || 'Velo HR HQ'} Reception Tablet Terminal`,
      notes: `Scanned Dynamic Terminal QR: ${qrToken}`,
      timeStr: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });

    setLastScannedPunch({
      employee: targetEmp,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      token: qrToken,
    });

    showToast(`✅ QR Check-in verified for ${targetEmp.name}!`, 'success');
  };

  const todayPunches = attendance.slice(0, 5);

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1b3b6f] text-white flex items-center justify-center shadow-md">
            <QrCode className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Office QR Check-In Terminal
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Kiosk
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deploy this screen on front-desk tablets, wall mounts, or reception iPads for instant hands-free staff punching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Terminal Clock</span>
            <div className="font-mono font-black text-sm text-[#1b3b6f]">
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Dynamic QR Station */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1b3b6f] to-[#0f2444] rounded-3xl p-6 sm:p-10 text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Terminal Location Header */}
          <div className="space-y-1 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{company?.name || 'Velo HR Workspace'} • Terminal #01</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Scan with Mobile App to Clock In
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Dynamic cryptographic token refreshes every 30 seconds to prevent spoofing or photo-sharing fraud.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-amber-400/80 relative flex flex-col items-center justify-center transition-all transform hover:scale-105">
            {/* SVG simulated dynamic QR code */}
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 bg-white flex items-center justify-center p-2 rounded-2xl">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                <rect x="0" y="0" width="30" height="30" fill="currentColor" rx="4" />
                <rect x="5" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="10" y="10" width="10" height="10" fill="#1b3b6f" rx="1" />

                <rect x="70" y="0" width="30" height="30" fill="currentColor" rx="4" />
                <rect x="75" y="5" width="20" height="20" fill="white" rx="2" />
                <rect x="80" y="10" width="10" height="10" fill="#1b3b6f" rx="1" />

                <rect x="0" y="70" width="30" height="30" fill="currentColor" rx="4" />
                <rect x="5" y="75" width="20" height="20" fill="white" rx="2" />
                <rect x="10" y="80" width="10" height="10" fill="#1b3b6f" rx="1" />

                {/* QR Data Dots */}
                <rect x="35" y="5" width="8" height="8" fill="#f39c12" />
                <rect x="48" y="12" width="6" height="14" fill="#1b3b6f" />
                <rect x="40" y="35" width="20" height="20" fill="#1b3b6f" rx="2" />
                <rect x="15" y="45" width="12" height="6" fill="#f39c12" />
                <rect x="70" y="40" width="10" height="10" fill="#1b3b6f" />
                <rect x="85" y="55" width="10" height="10" fill="#f39c12" />
                <rect x="40" y="70" width="15" height="8" fill="#1b3b6f" />
                <rect x="65" y="75" width="8" height="18" fill="#1b3b6f" />
                <rect x="80" y="80" width="12" height="12" fill="#f39c12" />
              </svg>

              {/* Center Logo in QR */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-xl shadow-md p-1 border border-slate-200 flex items-center justify-center">
                <img src="/iconlogo.png" alt="Velo HR" className="w-9 h-9 object-contain" />
              </div>
            </div>

            {/* Token & Countdown pill */}
            <div className="mt-4 flex items-center justify-between w-full text-slate-800 text-xs font-mono font-bold pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">{qrToken}</span>
              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{countdown}s</span>
              </span>
            </div>
          </div>

          {/* Live Geofence Status */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Geofence Radius: 50m</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Anti-Spoofing Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Col: Tablet Simulation & Recent Activity */}
        <div className="space-y-6">
          
          {/* Quick Scanner Simulator Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1b3b6f]" />
              <h4 className="font-extrabold text-sm text-slate-900">Simulate Staff Check-In</h4>
            </div>
            <p className="text-xs text-slate-500">
              Select an employee profile to simulate scanning the tablet QR code in real-time.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Employee:
                </label>
                <select
                  value={simulatedStaffId}
                  onChange={(e) => setSimulatedStaffId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {employees.length === 0 ? (
                    <option value="">No staff registered yet</option>
                  ) : (
                    employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                    ))
                  )}
                </select>
              </div>

              <button
                onClick={handleSimulateScan}
                disabled={employees.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152f58] hover:to-[#081426] text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Simulate Instant Check-In</span>
              </button>
            </div>

            {/* Last Scanned Result Confirmation */}
            {lastScannedPunch && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-1 text-xs animate-in fade-in">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Terminal Punch Confirmed!</span>
                </div>
                <p className="text-emerald-900 font-medium">
                  {lastScannedPunch.employee.name} clocked in at {lastScannedPunch.time}.
                </p>
                <p className="text-[10px] text-emerald-700 font-mono">
                  Token: {lastScannedPunch.token}
                </p>
              </div>
            )}
          </div>

          {/* Today's Terminal Feed */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Recent Terminal Punches
            </h4>

            {todayPunches.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No check-ins recorded today yet.
              </div>
            ) : (
              <div className="space-y-2">
                {todayPunches.map((rec, i) => (
                  <div key={rec.id || i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/70 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#1b3b6f] text-white flex items-center justify-center font-bold text-[10px]">
                        {rec.employeeName?.slice(0, 2).toUpperCase() || 'EM'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-[11px]">{rec.employeeName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{rec.date}</p>
                      </div>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {rec.punchIn || '09:30 AM'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
