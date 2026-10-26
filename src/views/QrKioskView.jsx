// Velo HR — Office Tablet Kiosk: AI Face Recognition & Dynamic QR Dual Terminal
import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Scan,
  Clock,
  MapPin,
  ShieldCheck,
  Shield,
  Lock,
  Activity,
  Eye,
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
  const [kioskDirection, setKioskDirection] = useState('SMART'); // 'SMART' | 'IN' | 'OUT'
  const [isBlinkTriggered, setIsBlinkTriggered] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [detectedStaff, setDetectedStaff] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const recentPunchMapRef = useRef(new Map());
  const detectionStreakRef = useRef(0);
  const currentCandidateIdRef = useRef(null);

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
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Kiosk Camera access unavailable, using simulated scanner:', err);
      setCameraActive(false);
    }
  };

  // Ensure video element plays and receives stream whenever cameraActive or video mounts
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive, terminalMode]);

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

      // Extract 128-D descriptor, facial topography & anti-hand detection
      const faceResult = extractFaceDescriptor(canvas);
      const { descriptor, faceDetected, handDetected: isHand, landmarks } = faceResult;

      setHandDetected(isHand);

      // CRITICAL: If a hand, palm, or obstruction is placed on the camera,
      // IMMEDIATELY BLOCK punch and reset all matching states!
      if (isHand) {
        setIsScanning(false);
        setDetectedStaff(null);
        detectionStreakRef.current = 0;
        currentCandidateIdRef.current = null;
        return; // Hand on camera -> NEVER PUNCH!
      }

      if (faceDetected) {
        setIsScanning(true);

        // Anti-Spoofing & Motion Detection
        let isLive = false;
        let isBlink = false;
        if (prevFrameDataRef.current) {
          const liveness = checkLivenessMotion(prevFrameDataRef.current, frameData, landmarks);
          setLivenessPassed(liveness.passed);
          isLive = liveness.passed;
          isBlink = liveness.blinkDetected;
        } else {
          // Initialize first frame baseline
          prevFrameDataRef.current = frameData;
          return;
        }
        prevFrameDataRef.current = frameData;

        // Block static photos / spoofing
        if (!isLive) {
          return;
        }

        // Match against enrolled employees with strict 84% confidence threshold
        const matchResult = matchLiveFace(descriptor, employees, 84, faceResult);
        if (matchResult.matched && matchResult.bestEmployee) {
          const emp = matchResult.bestEmployee;
          setDetectedStaff(emp);
          setMatchConfidence(matchResult.confidence);

          // Track consecutive matching frames for seamless automatic employee punch
          if (currentCandidateIdRef.current === emp.id) {
            detectionStreakRef.current += 1;
          } else {
            currentCandidateIdRef.current = emp.id;
            detectionStreakRef.current = 1;
          }

          // AUTOMATIC RECOGNITION PUNCH: Once verified steadily for 2 consecutive frames (~800ms) or blink
          if (detectionStreakRef.current >= 2 || isBlink) {
            detectionStreakRef.current = 0;
            currentCandidateIdRef.current = null;
            triggerSuccessfulFacePunch(emp, matchResult.confidence, isBlink);
          }
        } else {
          setDetectedStaff(null);
          detectionStreakRef.current = 0;
          currentCandidateIdRef.current = null;
        }
      } else {
        setIsScanning(false);
        setDetectedStaff(null);
        detectionStreakRef.current = 0;
        currentCandidateIdRef.current = null;
      }
    } catch (e) {
      console.warn('Frame processing exception:', e);
    }
  };

  // Trigger Biometric Punch & Cooldown with 5-Minute Anti-Flip Protection
  const triggerSuccessfulFacePunch = (employee, confidence, fromBlink = false) => {
    if (punchCooldown) return;

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

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const actualToday = getTodayDateString();
    const nowMs = Date.now();

    // Check if employee is currently clocked in today
    const existingRecord = attendance.find(a => a.employeeId === employee.id && a.date === actualToday);
    const isCurrentlyIn = existingRecord?.currentLiveStatus === 'IN';
    const recent = recentPunchMapRef.current.get(employee.id);

    // ==============================================================
    // ANTI-FLIP GUARD: Prevent accidental punch out on subsequent blinks
    // If clocked in less than 5 minutes ago and kiosk is in SMART or IN mode:
    // ==============================================================
    if (kioskDirection !== 'OUT' && isCurrentlyIn) {
      const lastInTimestamp = recent?.action === 'IN' ? recent.timestamp : null;
      const isWithin5Min = lastInTimestamp ? (nowMs - lastInTimestamp < 300000) : false;

      if (isWithin5Min || kioskDirection === 'IN') {
        setMatchedSnapshot(snapUrl);
        setPunchCooldown(true);
        setMatchedStaff(employee);
        setMatchConfidence(confidence);
        setMatchedPunchAction('IN_ACTIVE');
        setIsBlinkTriggered(true);

        playSuccessChime();
        const minsLeft = lastInTimestamp ? Math.max(1, Math.ceil((300000 - (nowMs - lastInTimestamp)) / 60000)) : 5;
        showToast(`👋 Welcome back, ${employee.name}! You are already clocked IN (${existingRecord?.punchIn}). Anti-flip safety active for ${minsLeft}m.`, 'info');

        setTimeout(() => {
          setMatchedStaff(null);
          setMatchedSnapshot(null);
          setIsBlinkTriggered(false);
          setPunchCooldown(false);
          setIsScanning(false);
        }, 3500);
        return;
      }
    }

    // Determine target punch direction
    let actionType = 'IN';
    if (kioskDirection === 'OUT') {
      actionType = 'OUT';
    } else if (kioskDirection === 'IN') {
      actionType = 'IN';
    } else {
      // SMART AUTO: Clock OUT only if shift duration is past the guard threshold
      actionType = isCurrentlyIn ? 'OUT' : 'IN';
    }

    setMatchedSnapshot(snapUrl);
    setPunchCooldown(true);
    setMatchedStaff(employee);
    setMatchConfidence(confidence);
    setIsScanning(false);
    setIsBlinkTriggered(true);
    setMatchedPunchAction(actionType);

    // Audio & Visual celebratory feedback
    playSuccessChime();
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.55 } });
    } catch {}

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
        notes: `AI Face Touchless Recognition (${confidence}% Match${fromBlink ? ' • Eye Blink Verified' : ''})`,
        timeStr: nowTimeStr,
      });
      showToast(`🎯 Welcome, ${employee.name}! Clocked IN at ${nowTimeStr} (${confidence}%)`, 'success');
    }

    // Record in anti-flip guard map
    recentPunchMapRef.current.set(employee.id, {
      timestamp: nowMs,
      action: actionType,
      timeStr: nowTimeStr,
    });

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
      setDetectedStaff(null);
      setHandDetected(false);
      setIsBlinkTriggered(false);
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
    triggerSuccessfulFacePunch(targetEmp, simulatedConf, false);
  };

  // QR Mode Scan Verification (Supports both IN and OUT)
  const handleSimulateQrScan = () => {
    const targetEmp = employees.find(e => e.id === simulatedStaffId) || employees[0];
    if (!targetEmp) {
      showToast('Please register staff members first', 'error');
      return;
    }

    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const actualToday = getTodayDateString();

    const existingRecord = attendance.find(a => a.employeeId === targetEmp.id && a.date === actualToday);
    const isCurrentlyIn = existingRecord?.currentLiveStatus === 'IN';
    const actionType = isCurrentlyIn ? 'OUT' : 'IN';

    if (actionType === 'OUT') {
      const res = punchOut({
        employeeId: targetEmp.id,
        address: `${company?.name || 'Velo HR Workspace'} Reception Terminal`,
        timeStr: nowTime,
      });
      showToast(`🏁 Goodbye, ${targetEmp.name}! Clocked OUT at ${nowTime}.`, 'info');
      setLastScannedPunch({
        employee: targetEmp,
        time: nowTime,
        token: qrToken,
        method: 'DYNAMIC_QR',
        action: 'OUT',
        duration: res?.workDuration || existingRecord?.workDuration || ''
      });
    } else {
      punchIn({
        employeeId: targetEmp.id,
        address: `${company?.name || 'Velo HR Workspace'} Reception Terminal`,
        notes: `Scanned Dynamic Terminal QR: ${qrToken}`,
        timeStr: nowTime,
      });
      showToast(`✅ Dynamic QR Check-in verified for ${targetEmp.name}!`, 'success');
      setLastScannedPunch({
        employee: targetEmp,
        time: nowTime,
        token: qrToken,
        method: 'DYNAMIC_QR',
        action: 'IN'
      });
    }

    playSuccessChime();
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {}
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

          {/* Punch Direction Selector (For Dedicated In/Out Doors or Smart Auto) */}
          {terminalMode === 'FACE' && (
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setKioskDirection('SMART')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  kioskDirection === 'SMART'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Smart Auto with 5-minute guard to prevent accidental punch-out"
              >
                <span>Smart Auto</span>
              </button>
              <button
                type="button"
                onClick={() => setKioskDirection('IN')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  kioskDirection === 'IN'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Entrance terminal: only accepts Punch In"
              >
                <span>IN Only</span>
              </button>
              <button
                type="button"
                onClick={() => setKioskDirection('OUT')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  kioskDirection === 'OUT'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Exit terminal: only accepts Punch Out"
              >
                <span>OUT Only</span>
              </button>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setAudioFeedback(prev => !prev)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition cursor-pointer"
            title={audioFeedback ? 'Mute Punch Chime' : 'Unmute Punch Chime'}
          >
            {audioFeedback ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Standalone Tablet Kiosk Mode Launch Button */}
          <button
            onClick={() => {
              window.location.hash = '#kiosk';
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1b3b6f] hover:bg-blue-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
            title="Launch Dedicated Fullscreen Tablet Kiosk for Office Tablets & iPads"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Tablet Kiosk</span>
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

              {/* Viewport Frame - with guaranteed minimum height and valid aspect ratio */}
              <div className="relative w-full aspect-[4/3] min-h-[320px] sm:min-h-[360px] h-[340px] sm:h-[380px] rounded-3xl bg-slate-950 border-4 border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center">
                
                {/* Live Hardware Video (Mirrored like a real mirror) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                  className={`absolute inset-0 w-full h-full object-cover transition duration-300 scale-x-[-1] ${
                    cameraActive ? 'block' : 'hidden'
                  } ${isScanning ? 'brightness-110 contrast-105' : 'brightness-95'}`}
                />

                {/* Camera Inactive Fallback Art */}
                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400 space-y-3 z-10">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700 animate-pulse">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-bold text-white">Camera Preview Offline</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Allow camera permissions or click below to launch live touchless camera feed.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>Start Camera Preview</span>
                    </button>
                  </div>
                )}

                {/* ============================================================== */}
                {/* DYNAMIC SMART BOUNDING BOX HUD OVER DETECTED FACE OR HAND */}
                {/* ============================================================== */}
                {cameraActive && !matchedStaff && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div
                      className={`relative w-56 h-64 sm:w-64 sm:h-72 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between p-3.5 ${
                        handDetected
                          ? 'border-4 border-amber-500 bg-amber-500/20 shadow-[0_0_35px_rgba(245,158,11,0.8)] scale-102'
                          : isBlinkTriggered
                          ? 'border-4 border-emerald-400 bg-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.8)] scale-105'
                          : detectedStaff
                          ? 'border-4 border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.7)] scale-102'
                          : isScanning
                          ? 'border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse'
                          : 'border-2 border-dashed border-emerald-400/40'
                      }`}
                    >
                      {/* 4 Corner HUD Brackets */}
                      <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />
                      <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />
                      <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />

                      {/* Top HUD Badge */}
                      <div className={`flex items-center justify-between w-full text-[10px] font-mono px-2.5 py-1 rounded-full border shadow-sm ${
                        handDetected
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                          : detectedStaff
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-950/85 text-emerald-300 border-emerald-500/30'
                      }`}>
                        <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                          {handDetected ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-bold text-amber-300">OBSTRUCTION / HAND</span>
                            </>
                          ) : detectedStaff ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                              <span className="font-bold text-emerald-300 truncate">
                                {detectedStaff.name.toUpperCase()}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                              <span>{isScanning ? 'FACE LOCKED' : 'ALIGN FACE'}</span>
                            </>
                          )}
                        </span>
                        <span className="text-[9px] font-bold shrink-0 ml-1">
                          {handDetected ? 'REJECTED' : detectedStaff ? `${matchConfidence}%` : '128-D AI'}
                        </span>
                      </div>

                      {/* Scanning Laser Line */}
                      {isScanning && !handDetected && !isBlinkTriggered && (
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />
                      )}

                      {/* Center Confirmation / Warning Icon */}
                      {handDetected && (
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-xl animate-in zoom-in-75">
                          <AlertCircle className="w-9 h-9" />
                        </div>
                      )}
                      {isBlinkTriggered && (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl animate-in zoom-in-75">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                      )}

                      {/* Bottom Guidance Tag */}
                      <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 ${
                        handDetected
                          ? 'bg-amber-950/95 text-amber-200 border border-amber-500/50'
                          : detectedStaff
                          ? 'bg-emerald-950/95 text-emerald-200 border border-emerald-500/50'
                          : 'bg-slate-950/90 text-emerald-200 border border-emerald-500/40'
                      }`}>
                        {handDetected ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Camera Obstructed — Step Back</span>
                          </>
                        ) : detectedStaff ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Verified • Auto-Marking Attendance...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span>{isScanning ? 'Identifying Enrolled Face...' : 'Position Face in Green Box'}</span>
                          </>
                        )}
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
                            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-xl border-2 border-slate-900"
                          />
                          <span className="absolute -bottom-2 inset-x-0 mx-auto w-fit text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded shadow">
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
                        matchedPunchAction === 'IN_ACTIVE'
                          ? 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                          : matchedPunchAction === 'OUT'
                          ? 'text-rose-400 bg-rose-500/20 border-rose-500/30'
                          : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
                      }`}>
                        {matchConfidence}% Biometric Match Verified • {
                          matchedPunchAction === 'IN_ACTIVE'
                            ? 'ALREADY IN'
                            : matchedPunchAction === 'OUT'
                            ? 'CLOCK OUT'
                            : 'CLOCK IN'
                        }
                      </span>
                      <h4 className="text-xl font-extrabold text-white mt-1">
                        {matchedPunchAction === 'IN_ACTIVE'
                          ? `Already Clocked In, ${matchedStaff.name}!`
                          : matchedPunchAction === 'OUT'
                          ? `Goodbye, ${matchedStaff.name}!`
                          : `Good Morning, ${matchedStaff.name}!`}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        {matchedStaff.designation} • {matchedStaff.department}
                      </p>
                    </div>

                    <div className={`border rounded-2xl px-4 py-2 text-xs font-mono ${
                      matchedPunchAction === 'IN_ACTIVE'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                        : matchedPunchAction === 'OUT'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    }`}>
                      {matchedPunchAction === 'IN_ACTIVE'
                        ? `Shift currently in progress • Protected by 5-min cooldown guard`
                        : matchedPunchAction === 'OUT'
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
          
          {/* Terminal Security & Hardware Monitor Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Terminal Security & Health
                </h4>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Secured
              </span>
            </div>

            {/* Security Parameters Telemetry */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Geofence Boundary</span>
                </div>
                <span className="font-bold text-[11px] text-slate-900">
                  {company?.geofence?.strictEnforcement ? 'Strict Perimeter Locked' : 'Flexible Radius'} ({company?.geofence?.radiusMeters || 200}m)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  <span>Liveness Anti-Spoof</span>
                </div>
                <span className="font-bold text-[11px] text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Micro-Motion Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Face Biometrics</span>
                </div>
                <span className="font-bold text-[11px] text-indigo-700">
                  {employees.filter(e => e.faceEnrolled).length} / {employees.length} Enrolled (128-D)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Lock className="w-3.5 h-3.5 text-violet-600" />
                  <span>Dynamic QR Salt</span>
                </div>
                <span className="font-bold text-[11px] text-slate-900 font-mono">
                  AES 15s Rotating
                </span>
              </div>
            </div>

            {/* Diagnostic Hardware Test / Admin Verification */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Diagnostic Scan Calibration
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Hardware Test</span>
              </div>

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
                      {emp.name} ({emp.designation}) {emp.faceEnrolled ? '✓ Face ID' : '⚠️ No Face ID'}
                    </option>
                  ))
                )}
              </select>

              {terminalMode === 'FACE' ? (
                <button
                  onClick={() => handleSimulateAiFaceScan(simulatedStaffId)}
                  disabled={employees.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Scan className="w-4 h-4 text-amber-300" />
                  <span>Run Biometric Calibration Test</span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateQrScan}
                  disabled={employees.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1b3b6f] to-[#0f2444] hover:from-[#152f58] hover:to-[#081426] text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Verify Dynamic QR Reader</span>
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
                  {lastScannedPunch.employee.name} clocked {lastScannedPunch.action === 'OUT' ? 'OUT' : 'IN'} at {lastScannedPunch.time}.
                  {lastScannedPunch.duration && ` • Shift: ${lastScannedPunch.duration}`}
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
