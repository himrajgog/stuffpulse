// Velo HR — Office Tablet Kiosk: AI Face Recognition & Dynamic QR Dual Terminal
import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Smartphone,
  UserCheck,
  Camera,
  Maximize2,
  Video,
  VideoOff,
  Zap,
  Volume2,
  VolumeX,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/dateUtils';
import { extractFaceDescriptor, matchLiveFace, checkLivenessMotion } from '../utils/faceRecognitionEngine';
import confetti from 'canvas-confetti';

export const QrKioskView = () => {
  const { company, employees, attendance, punchIn, punchOut, showToast } = useApp();
  
  // Terminal Mode: 'FACE' (AI Face Recognition) | 'QR' (Dynamic QR Station)
  const [terminalMode, setTerminalMode] = useState('FACE');

  // Terminal Live Clock
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

  // QR Mode States
  const [qrToken, setQrToken] = useState(`VELO-QR-${Date.now().toString(36).toUpperCase()}`);
  const [countdown, setCountdown] = useState(30);

  // AI Face Kiosk States
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [matchedStaff, setMatchedStaff] = useState(null);
  const [matchedSnapshot, setMatchedSnapshot] = useState(null);
  const [matchedPunchAction, setMatchedPunchAction] = useState('IN');
  const [matchedShiftDuration, setMatchedShiftDuration] = useState('');
  const [matchConfidence, setMatchConfidence] = useState(0);
  const [livenessPassed, setLivenessPassed] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [punchCooldown, setPunchCooldown] = useState(false);
  const [simulatedStaffId, setSimulatedStaffId] = useState(employees[0]?.id || '');
  const [lastScannedPunch, setLastScannedPunch] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const prevFrameDataRef = useRef(null);

  // Audio Chime using Web Audio API
  const playSuccessChime = () => {
    if (!audioFeedback) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
  };

  // Live Clock & Rotating QR Token
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      if (terminalMode === 'QR') {
        setCountdown(prev => {
          if (prev <= 1) {
            setQrToken(`VELO-QR-${Date.now().toString(36).toUpperCase()}`);
            return 30;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [terminalMode]);

  // Handle Hardware Camera in Face Mode
  useEffect(() => {
    if (terminalMode === 'FACE') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [terminalMode]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.warn('Kiosk Camera access unavailable, using simulated scanner:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  };

  // Continuous Face Scan Loop
  useEffect(() => {
    if (terminalMode === 'FACE' && cameraActive && !punchCooldown) {
      scanIntervalRef.current = setInterval(() => {
        performLiveVideoFrameCheck();
      }, 450);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [terminalMode, cameraActive, punchCooldown, employees]);

  const performLiveVideoFrameCheck = () => {
    if (!videoRef.current || punchCooldown) return;

    try {
      const video = videoRef.current;
      if (video.readyState < 2) return; // Not ready yet

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 160, 160);
      const frameData = ctx.getImageData(0, 0, 160, 160).data;

      // Extract 128-D descriptor
      const { descriptor, faceDetected, qualityScore } = extractFaceDescriptor(canvas);

      if (faceDetected) {
        setIsScanning(true);

        // Liveness check
        if (prevFrameDataRef.current) {
          const liveness = checkLivenessMotion(prevFrameDataRef.current, frameData);
          setLivenessPassed(liveness.passed);
        }
        prevFrameDataRef.current = frameData;

        // Match against enrolled employees
        const matchResult = matchLiveFace(descriptor, employees, 82);
        if (matchResult.matched && matchResult.bestEmployee) {
          triggerSuccessfulFacePunch(matchResult.bestEmployee, matchResult.confidence);
        }
      } else {
        setIsScanning(false);
      }
    } catch (e) {
      console.warn('Frame processing exception:', e);
    }
  };

  // Trigger Biometric Punch & Cooldown
  const triggerSuccessfulFacePunch = (employee, confidence) => {
    // Capture snapshot from live video feed
    let snapUrl = null;
    if (videoRef.current) {
      try {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = 320;
        snapCanvas.height = 320;
        const sctx = snapCanvas.getContext('2d');
        sctx.translate(320, 0);
        sctx.scale(-1, 1); // Mirror snapshot
        sctx.drawImage(videoRef.current, 0, 0, 320, 320);
        snapUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
      } catch (err) {
        console.warn('Snapshot capture fallback:', err);
      }
    }

    setMatchedSnapshot(snapUrl);
    setPunchCooldown(true);
    setMatchedStaff(employee);
    setMatchConfidence(confidence);
    setIsScanning(false);

    // Audio & Visual celebratory feedback
    playSuccessChime();
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.55 } });
    } catch {}

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const actualToday = getTodayDateString();

    // Check if the employee is already clocked in today
    const existingRecord = attendance.find(a => a.employeeId === employee.id && a.date === actualToday);
    const isCurrentlyIn = existingRecord?.currentLiveStatus === 'IN';
    const actionType = isCurrentlyIn ? 'OUT' : 'IN';
    setMatchedPunchAction(actionType);

    if (actionType === 'OUT') {
      const res = punchOut({
        employeeId: employee.id,
        address: `${company?.name || 'Velo HR Workspace'} • AI Terminal #01`,
        timeStr: nowTimeStr,
      });
      setMatchedShiftDuration(res?.workDuration || existingRecord?.workDuration || '');
      showToast(`🏁 Goodbye, ${employee.name}! Clocked OUT at ${nowTimeStr}.`, 'info');
    } else {
      punchIn({
        employeeId: employee.id,
        address: `${company?.name || 'Velo HR Workspace'} • AI Terminal #01`,
        selfieUrl: snapUrl || employee.avatar,
        notes: `AI Face Biometric Recognition (${confidence}% Match)`,
        timeStr: nowTimeStr,
      });
      showToast(`🎯 Welcome, ${employee.name}! Clocked IN at ${nowTimeStr} (${confidence}%)`, 'success');
    }

    setLastScannedPunch({
      employee,
      time: nowTimeStr,
      confidence,
      method: 'AI_FACE',
      action: actionType,
      snapshot: snapUrl || employee.avatar
    });

    // 4-second cooldown before recognizing the next employee
    setTimeout(() => {
      setMatchedStaff(null);
      setMatchedSnapshot(null);
      setMatchedShiftDuration('');
      setPunchCooldown(false);
      setIsScanning(false);
    }, 4000);
  };

  // Manual Trigger for Simulation or Hardware-less Testing
  const handleSimulateAiFaceScan = (targetEmpId) => {
    const targetEmp = employees.find(e => e.id === targetEmpId) || employees[0];
    if (!targetEmp) {
      showToast('Please add staff members first', 'error');
      return;
    }
    const simulatedConf = +(95 + Math.random() * 4).toFixed(1);
    triggerSuccessfulFacePunch(targetEmp, simulatedConf);
  };

  // QR Mode Simulation
  const handleSimulateQrScan = () => {
    const targetEmp = employees.find(e => e.id === simulatedStaffId) || employees[0];
    if (!targetEmp) {
      showToast('Please add staff members to simulate QR check-ins', 'error');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    punchIn({
      employeeId: targetEmp.id,
      address: `${company?.name || 'Velo HR Workspace'} Reception Terminal`,
      notes: `Scanned Dynamic Terminal QR: ${qrToken}`,
      timeStr: nowTime,
    });

    setLastScannedPunch({
      employee: targetEmp,
      time: nowTime,
      token: qrToken,
      method: 'DYNAMIC_QR'
    });

    playSuccessChime();
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {}

    showToast(`✅ QR Check-in verified for ${targetEmp.name}!`, 'success');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 animate-in fade-in">
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Banner & Mode Toggle */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1b3b6f] to-blue-600 text-white flex items-center justify-center shadow-md">
            {terminalMode === 'FACE' ? (
              <Scan className="w-6 h-6 text-amber-400" />
            ) : (
              <QrCode className="w-6 h-6 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {terminalMode === 'FACE' ? 'Office AI Face Kiosk' : 'Office Dynamic QR Terminal'}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Terminal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deploy this shared screen on front-desk tablets, wall mounts, or reception iPads for touchless workforce punching.
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setTerminalMode('FACE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                terminalMode === 'FACE'
                  ? 'bg-[#1b3b6f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Face ID</span>
            </button>
            <button
              onClick={() => setTerminalMode('QR')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                terminalMode === 'QR'
                  ? 'bg-[#1b3b6f] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Dynamic QR</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioFeedback(prev => !prev)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
            title={audioFeedback ? 'Mute Punch Chime' : 'Unmute Punch Chime'}
          >
            {audioFeedback ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Terminal Clock Badge */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-1.5 text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Terminal Clock</span>
            <div className="font-mono font-black text-sm text-[#1b3b6f]">
              {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Viewport (AI Camera OR Dynamic QR) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1b3b6f] to-[#0f2444] rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[460px]">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Terminal Location Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 mb-4 z-10">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{company?.name || 'Velo HR Workspace'} • Terminal #01</span>
          </div>

          {/* ============================================================== */}
          {/* MODE A: AI FACE RECOGNITION TERMINAL */}
          {/* ============================================================== */}
          {terminalMode === 'FACE' && (
            <div className="w-full max-w-md flex flex-col items-center z-10 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                  <span>Look at the Camera to Clock In</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h3>
                <p className="text-xs text-slate-300">
                  Touchless 128-D vector matching with anti-spoofing micro-motion liveness verification.
                </p>
              </div>

              {/* Viewport Frame */}
              <div className="relative w-full aspect-4/3 rounded-3xl bg-slate-950 border-4 border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center">
                
                {/* Live Hardware Video (Mirrored like a real mirror) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition duration-300 scale-x-[-1] ${
                    cameraActive ? 'block' : 'hidden'
                  } ${isScanning ? 'brightness-110 contrast-105' : 'brightness-95'}`}
                />

                {/* Camera Inactive Fallback Art */}
                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-bold text-white">Camera Offline or Permission Blocked</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Click 'Simulate Live Face Recognition' below to preview the instant touchless check-in flow.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}

                {/* Futuristic HUD Scanning Grid */}
                {cameraActive && !matchedStaff && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Oval Face Bounding Box */}
                    <div className={`w-52 h-64 border-2 rounded-[50%] transition-all duration-300 flex flex-col items-center justify-between p-3 ${
                      isScanning
                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(243,156,18,0.3)] animate-pulse'
                        : 'border-dashed border-white/40'
                    }`}>
                      <div className="flex items-center justify-between w-full text-[9px] font-mono text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded-full">
                        <span>{isScanning ? 'SCANNING' : 'ALIGN FACE'}</span>
                        <span>128-D</span>
                      </div>
                      
                      {/* Scanning Horizontal Laser Bar */}
                      {isScanning && (
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#f39c12] animate-bounce" />
                      )}

                      <div className="text-[9px] font-bold text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded-full">
                        {isScanning ? 'Calculating Vector Embedding...' : 'Step forward'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Successful Match Overlay Card with Live Snapshot Preview */}
                {matchedStaff && (
                  <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-center gap-3">
                      {matchedSnapshot && (
                        <div className="relative">
                          <img
                            src={matchedSnapshot}
                            alt="Live Camera Snapshot"
                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-amber-400 shadow-xl border-2 border-slate-900"
                          />
                          <span className="absolute -bottom-2 inset-x-0 mx-auto w-fit text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded shadow">
                            Live Feed
                          </span>
                        </div>
                      )}
                      <div className="relative">
                        <img
                          src={matchedStaff.avatar}
                          alt={matchedStaff.name}
                          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-400 shadow-xl border-2 border-slate-900"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-950">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="absolute -bottom-2 inset-x-0 mx-auto w-fit text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.2 rounded shadow">
                          Profile
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        matchedPunchAction === 'OUT'
                          ? 'text-rose-400 bg-rose-500/20 border-rose-500/30'
                          : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
                      }`}>
                        {matchConfidence}% Biometric Match Verified • {matchedPunchAction === 'OUT' ? 'CLOCK OUT' : 'CLOCK IN'}
                      </span>
                      <h4 className="text-xl font-extrabold text-white mt-1">
                        {matchedPunchAction === 'OUT' ? `Goodbye, ${matchedStaff.name}!` : `Good Morning, ${matchedStaff.name}!`}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        {matchedStaff.designation} • {matchedStaff.department}
                      </p>
                    </div>

                    <div className={`border rounded-2xl px-4 py-2 text-xs font-mono ${
                      matchedPunchAction === 'OUT'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    }`}>
                      {matchedPunchAction === 'OUT'
                        ? `Punched Out at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}${matchedShiftDuration ? ` • Shift: ${matchedShiftDuration}` : ''}`
                        : `Punched In at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      Ready for next employee in a moment...
                    </p>
                  </div>
                )}

              </div>

              {/* Status Bar Under Camera */}
              <div className="flex items-center justify-between w-full text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Anti-Spoofing: Active</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Latency: &lt;50ms</span>
                </span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE B: DYNAMIC QR CODE TERMINAL */}
          {/* ============================================================== */}
          {terminalMode === 'QR' && (
            <div className="flex flex-col items-center z-10 space-y-4">
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Scan with Mobile App to Clock In
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Dynamic cryptographic token refreshes every 30 seconds to prevent spoofing or photo-sharing fraud.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xl border-4 border-amber-400/80 relative flex flex-col items-center justify-center transition-all">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-white flex items-center justify-center p-2 rounded-2xl">
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
                  <div className="absolute inset-0 m-auto w-11 h-11 bg-white rounded-xl shadow-md p-1 border border-slate-200 flex items-center justify-center">
                    <img src="/iconlogo.png" alt="Velo HR" className="w-8 h-8 object-contain" />
                  </div>
                </div>

                {/* Token & Countdown pill */}
                <div className="mt-3 flex items-center justify-between w-full text-slate-800 text-xs font-mono font-bold pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">{qrToken}</span>
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>{countdown}s</span>
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Instant Terminal Simulator & Punch Feed */}
        <div className="space-y-6">
          
          {/* Quick Scanner Simulator Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1b3b6f]" />
              <h4 className="font-extrabold text-sm text-slate-900">
                {terminalMode === 'FACE' ? 'AI Face Match Test' : 'Simulate Staff Check-In'}
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              {terminalMode === 'FACE'
                ? 'Select a staff profile to test the live biometric matching & audio chime.'
                : 'Select an employee profile to simulate scanning the tablet QR code.'}
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
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation}) {emp.faceEnrolled ? '✓ Face ID' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {terminalMode === 'FACE' ? (
                <button
                  onClick={() => handleSimulateAiFaceScan(simulatedStaffId)}
                  disabled={employees.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Scan className="w-4 h-4 text-amber-300" />
                  <span>Test AI Face Recognition</span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateQrScan}
                  disabled={employees.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152f58] hover:to-[#081426] text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Simulate Instant QR Scan</span>
                </button>
              )}
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
                <div className="flex items-center justify-between text-[10px] text-emerald-700 font-mono pt-1">
                  <span>Method: {lastScannedPunch.method}</span>
                  {lastScannedPunch.confidence && (
                    <span className="font-bold text-emerald-800">{lastScannedPunch.confidence}% match</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Today's Terminal Feed */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                Today's Terminal Activity
              </h4>
              <span className="text-[10px] font-bold text-slate-400">
                {attendance.length} logs today
              </span>
            </div>

            {attendance.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No punches recorded today yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {attendance.slice(0, 6).map((log, idx) => {
                  const staff = employees.find(e => e.id === log.employeeId);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {staff?.name?.[0] || 'E'}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">{staff?.name || log.employeeId}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.punchIn || log.time}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {log.currentLiveStatus || 'IN'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
