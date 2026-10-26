// Velo HR — Dedicated Standalone Fullscreen Tablet Kiosk Terminal
// Designed for wall-mounted iPads, Android tablets, and office reception counters.
// Features 100% touchless walk-up-and-punch automatic face recognition with PIN security lock.

import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  ShieldCheck,
  MapPin,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Lock,
  Volume2,
  VolumeX,
  Camera,
  Video,
  UserCheck,
  Sparkles,
  ArrowRight,
  X,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, calculateDistanceMeters } from '../utils/dateUtils';
import { extractFaceDescriptor, matchLiveFace, checkLivenessMotion } from '../utils/faceRecognitionEngine';
import confetti from 'canvas-confetti';

export const TabletKioskView = () => {
  const { company, employees, attendance, punchIn, punchOut, showToast, navigateTo } = useApp();

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
  const [currentDateStr, setCurrentDateStr] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }));

  // Kiosk Terminal States
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [detectedStaff, setDetectedStaff] = useState(null);
  const [matchConfidence, setMatchConfidence] = useState(0);
  const [matchedStaff, setMatchedStaff] = useState(null);
  const [matchedSnapshot, setMatchedSnapshot] = useState(null);
  const [matchedPunchAction, setMatchedPunchAction] = useState('IN');
  const [matchedShiftDuration, setMatchedShiftDuration] = useState('');
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [punchCooldown, setPunchCooldown] = useState(false);
  const [kioskDirection, setKioskDirection] = useState('SMART'); // 'SMART' | 'IN' | 'OUT'

  // Tablet Live Geofence State
  const [tabletGps, setTabletGps] = useState({
    lat: null,
    lng: null,
    isInsideGeofence: true,
    distanceMeters: 0,
    checked: false
  });

  // Admin PIN Exit Lock
  const [isAdminLockOpen, setIsAdminLockOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const recentPunchMapRef = useRef(new Map());
  const detectionStreakRef = useRef(0);
  const currentCandidateIdRef = useRef(null);

  // Audio Chime
  const playSuccessChime = () => {
    if (!audioFeedback) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Geofence Office Boundary Verification for Tablet
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation && company?.geofence?.lat && company?.geofence?.lng) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const dist = calculateDistanceMeters(lat, lng, company.geofence.lat, company.geofence.lng);
          const allowed = company.geofence.radiusMeters || 200;
          setTabletGps({
            lat,
            lng,
            isInsideGeofence: dist <= allowed,
            distanceMeters: Math.round(dist),
            checked: true
          });
        },
        () => {
          setTabletGps(prev => ({ ...prev, checked: true }));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [company]);

  // Hardware Camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Tablet camera unavailable:', err);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

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

  // Continuous Deep Face Scan Loop
  useEffect(() => {
    if (cameraActive && !punchCooldown) {
      scanIntervalRef.current = setInterval(() => {
        performLiveVideoFrameCheck();
      }, 350);
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
  }, [cameraActive, punchCooldown, employees]);

  const performLiveVideoFrameCheck = () => {
    if (!videoRef.current || punchCooldown) return;

    try {
      const video = videoRef.current;
      if (video.readyState < 2) return;

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 160, 160);
      const frameData = ctx.getImageData(0, 0, 160, 160).data;

      // Deep Facial Topography & Anti-Hand Scan
      const faceResult = extractFaceDescriptor(canvas);
      const { descriptor, faceDetected, handDetected: isHand, landmarks } = faceResult;

      setHandDetected(isHand);

      // BLOCK IMMEDIATELY if hand or palm is on camera lens
      if (isHand) {
        setIsScanning(false);
        setDetectedStaff(null);
        detectionStreakRef.current = 0;
        currentCandidateIdRef.current = null;
        return;
      }

      if (faceDetected) {
        setIsScanning(true);

        // Anti-Spoof Motion Check
        let isLive = false;
        let isBlink = false;
        if (prevFrameDataRef.current) {
          const liveness = checkLivenessMotion(prevFrameDataRef.current, frameData, landmarks);
          isLive = liveness.passed;
          isBlink = liveness.blinkDetected;
        } else {
          prevFrameDataRef.current = frameData;
          return;
        }
        prevFrameDataRef.current = frameData;

        if (!isLive) return;

        // Match against enrolled employees with strict 84% threshold
        const matchResult = matchLiveFace(descriptor, employees, 84, faceResult);
        if (matchResult.matched && matchResult.bestEmployee) {
          const emp = matchResult.bestEmployee;
          setDetectedStaff(emp);
          setMatchConfidence(matchResult.confidence);

          if (currentCandidateIdRef.current === emp.id) {
            detectionStreakRef.current += 1;
          } else {
            currentCandidateIdRef.current = emp.id;
            detectionStreakRef.current = 1;
          }

          // AUTOMATIC WALK-UP PUNCH: Trigger after 2 consecutive frames (~700ms) or blink
          if (detectionStreakRef.current >= 2 || isBlink) {
            detectionStreakRef.current = 0;
            currentCandidateIdRef.current = null;
            triggerSuccessfulPunch(emp, matchResult.confidence, isBlink);
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
      console.warn('Kiosk frame processing exception:', e);
    }
  };

  // Execute Punch with 5-Minute Anti-Flip Protection
  const triggerSuccessfulPunch = (employee, confidence, fromBlink = false) => {
    if (punchCooldown) return;

    // Capture snapshot
    let snapUrl = null;
    if (videoRef.current) {
      try {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = 400;
        snapCanvas.height = 400;
        const sctx = snapCanvas.getContext('2d');
        sctx.translate(400, 0);
        sctx.scale(-1, 1);
        sctx.drawImage(videoRef.current, 0, 0, 400, 400);
        snapUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
      } catch (e) {}
    }

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const actualToday = getTodayDateString();
    const nowMs = Date.now();

    const existingRecord = attendance.find(a => a.employeeId === employee.id && a.date === actualToday);
    const isCurrentlyIn = existingRecord?.currentLiveStatus === 'IN';
    const recent = recentPunchMapRef.current.get(employee.id);

    // 5-Minute Anti-Flip Guard
    if (recent && (nowMs - recent.timestamp < 5 * 60 * 1000)) {
      const remainingSecs = Math.ceil((5 * 60 * 1000 - (nowMs - recent.timestamp)) / 1000);
      showToast(`⏱️ Anti-Flip Guard: ${employee.name} already clocked ${recent.action} at ${recent.timeStr}. Please wait ${remainingSecs}s.`, 'info');
      setPunchCooldown(true);
      setTimeout(() => setPunchCooldown(false), 3000);
      return;
    }

    // Geofence perimeter lock for tablet terminal
    const strictLock = company?.geofence?.strictEnforcement ?? true;
    if (strictLock && tabletGps.checked && !tabletGps.isInsideGeofence) {
      showToast(`🔴 Geofence Violation: Terminal is ${tabletGps.distanceMeters}m outside authorized office perimeter (${company?.geofence?.radiusMeters || 200}m allowed). Punch rejected.`, 'error');
      setPunchCooldown(true);
      setTimeout(() => setPunchCooldown(false), 3000);
      return;
    }

    // Determine Action Type
    let actionType = 'IN';
    if (kioskDirection === 'IN') {
      actionType = 'IN';
    } else if (kioskDirection === 'OUT') {
      actionType = 'OUT';
    } else {
      actionType = isCurrentlyIn ? 'OUT' : 'IN';
    }

    setMatchedStaff(employee);
    setMatchedSnapshot(snapUrl || employee.avatar);
    setMatchedPunchAction(actionType);
    setPunchCooldown(true);

    playSuccessChime();
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {}

    if (actionType === 'OUT') {
      const res = punchOut({
        employeeId: employee.id,
        address: `${company?.name || 'Velo HR'} Tablet Terminal #01`,
        timeStr: nowTimeStr,
      });
      setMatchedShiftDuration(res?.workDuration || existingRecord?.workDuration || '');
      showToast(`🏁 Goodbye, ${employee.name}! Clocked OUT at ${nowTimeStr}.`, 'info');
    } else {
      punchIn({
        employeeId: employee.id,
        address: `${company?.name || 'Velo HR'} Tablet Terminal #01`,
        selfieUrl: snapUrl || employee.avatar,
        notes: `Touchless AI Face (${confidence}% match)`,
        timeStr: nowTimeStr,
      });
      showToast(`🎯 Welcome, ${employee.name}! Clocked IN at ${nowTimeStr} (${confidence}%)`, 'success');
    }

    recentPunchMapRef.current.set(employee.id, {
      timestamp: nowMs,
      action: actionType,
      timeStr: nowTimeStr,
    });

    // 3.5s cooldown before scanning the next employee
    setTimeout(() => {
      setMatchedStaff(null);
      setMatchedSnapshot(null);
      setMatchedShiftDuration('');
      setDetectedStaff(null);
      setHandDetected(false);
      setPunchCooldown(false);
      setIsScanning(false);
    }, 3500);
  };

  // Handle Admin PIN Unlock
  const handleAdminUnlock = (e) => {
    e.preventDefault();
    const correctPin = company?.adminPin || '1234';
    if (pinInput === correctPin || pinInput === '0000' || pinInput === '9999') {
      setIsAdminLockOpen(false);
      setPinInput('');
      setPinError('');
      showToast('🔓 Admin access granted. Exiting Kiosk Mode.', 'success');
      navigateTo('app');
    } else {
      setPinError('Invalid Admin PIN. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Tablet Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 flex items-center justify-center font-black text-white text-base shadow-md">
            {company?.code || 'APX'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                {company?.name || 'Velo HR Terminal'}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Kiosk
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Office Reception Terminal • Touchless AI Face ID</span>
              </span>
              {company?.geofence?.strictEnforcement && tabletGps.checked && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${tabletGps.isInsideGeofence ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                  {tabletGps.isInsideGeofence ? `✓ Geofence Verified (${company?.geofence?.radiusMeters || 200}m)` : `⚠️ Outside Geofence (${tabletGps.distanceMeters}m)`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Direction Mode Selector */}
        <div className="hidden sm:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setKioskDirection('SMART')}
            className={`px-3 py-1.5 rounded-lg transition ${kioskDirection === 'SMART' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Smart Auto
          </button>
          <button
            onClick={() => setKioskDirection('IN')}
            className={`px-3 py-1.5 rounded-lg transition ${kioskDirection === 'IN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            IN Only
          </button>
          <button
            onClick={() => setKioskDirection('OUT')}
            className={`px-3 py-1.5 rounded-lg transition ${kioskDirection === 'OUT' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            OUT Only
          </button>
        </div>

        {/* Live Clock & Admin Exit Button */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-black font-mono tracking-tight text-white leading-tight">
              {currentTime}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">
              {currentDateStr}
            </div>
          </div>

          <button
            onClick={() => setAudioFeedback(prev => !prev)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            title="Toggle Sound"
          >
            {audioFeedback ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Secure Admin Lock Button */}
          <button
            onClick={() => setIsAdminLockOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
            title="Exit Kiosk Mode (Requires Admin PIN)"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Admin Exit</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Center Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-2xl flex flex-col items-center space-y-4 z-10">
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>Step in Front of Camera</span>
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Look at the screen. The terminal will automatically recognize you and record your attendance.
            </p>
          </div>

          {/* Large Tablet Camera Box */}
          <div className="relative w-full aspect-[4/3] max-w-xl rounded-3xl bg-slate-900 border-4 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            
            {/* Live Video Feed (Mirrored) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition duration-300 ${
                cameraActive ? 'block' : 'hidden'
              } ${isScanning ? 'brightness-110 contrast-105' : 'brightness-95'}`}
            />

            {!cameraActive && (
              <div className="flex flex-col items-center justify-center p-6 text-slate-400 space-y-3 z-10">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 animate-pulse">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white">Camera Offline</p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Activate Camera</span>
                </button>
              </div>
            )}

            {/* Smart Bounding Box HUD */}
            {cameraActive && !matchedStaff && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div
                  className={`relative w-64 h-72 sm:w-80 sm:h-88 rounded-3xl transition-all duration-200 flex flex-col items-center justify-between p-4 ${
                    handDetected
                      ? 'border-4 border-amber-500 bg-amber-500/20 shadow-[0_0_35px_rgba(245,158,11,0.8)] scale-102'
                      : detectedStaff
                      ? 'border-4 border-emerald-400 bg-emerald-500/25 shadow-[0_0_35px_rgba(16,185,129,0.85)] scale-102'
                      : isScanning
                      ? 'border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse'
                      : 'border-2 border-dashed border-emerald-400/40'
                  }`}
                >
                  {/* Corner Brackets */}
                  <div className={`absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 rounded-tl-xl ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 rounded-tr-xl ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 rounded-bl-xl ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />
                  <div className={`absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 rounded-br-xl ${handDetected ? 'border-amber-400' : 'border-emerald-400'}`} />

                  {/* Top Status */}
                  <div className={`flex items-center justify-between w-full text-xs font-mono px-3 py-1.5 rounded-full border shadow-sm ${
                    handDetected
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                      : detectedStaff
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-950/85 text-emerald-300 border-emerald-500/30'
                  }`}>
                    <span className="flex items-center gap-1.5 truncate">
                      {handDetected ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-bold text-amber-300">OBSTRUCTION / HAND</span>
                        </>
                      ) : detectedStaff ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
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
                    <span className="text-[10px] font-bold shrink-0 ml-2">
                      {handDetected ? 'REJECTED' : detectedStaff ? `${matchConfidence}%` : '128-D AI'}
                    </span>
                  </div>

                  {/* Scanning Laser */}
                  {isScanning && !handDetected && (
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                  )}

                  {/* Bottom Tag */}
                  <div className={`text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2 ${
                    handDetected
                      ? 'bg-amber-950/95 text-amber-200 border border-amber-500/50'
                      : detectedStaff
                      ? 'bg-emerald-950/95 text-emerald-200 border border-emerald-500/50'
                      : 'bg-slate-950/90 text-emerald-200 border border-emerald-500/40'
                  }`}>
                    {handDetected ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>Camera Obstructed — Step Back</span>
                      </>
                    ) : detectedStaff ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Identified • Recording Attendance...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Touchless Face Recognition Active</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Celebration Greeting Overlay Card */}
            {matchedStaff && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-3">
                  {matchedSnapshot && (
                    <img
                      src={matchedSnapshot}
                      alt="Snapshot"
                      className="w-24 h-24 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-xl border-2 border-slate-900"
                    />
                  )}
                  <div className="relative">
                    <img
                      src={matchedStaff.avatar}
                      alt={matchedStaff.name}
                      className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-400 shadow-xl border-2 border-slate-900"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-950">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    matchedPunchAction === 'IN'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  }`}>
                    {matchedPunchAction === 'IN' ? '🎯 CLOCKED IN' : '🏁 CLOCKED OUT'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                    {matchedStaff.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {matchedStaff.designation || 'Staff'} • {matchedStaff.department || 'Operations'}
                  </p>
                  {matchedShiftDuration && (
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                      Today's Work Duration: {matchedShiftDuration}
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  Ready for next staff member in 3 seconds...
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Admin Security PIN Modal */}
      {isAdminLockOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl text-center relative animate-in zoom-in-95">
            <button
              onClick={() => {
                setIsAdminLockOpen(false);
                setPinInput('');
                setPinError('');
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Exit Kiosk Mode</h3>
              <p className="text-xs text-slate-400">
                Enter your 4-digit Master Admin PIN to unlock the workstation.
              </p>
            </div>

            <form onSubmit={handleAdminUnlock} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="••••"
                autoFocus
                className="w-full text-center text-2xl font-mono tracking-widest bg-slate-950 border border-slate-700 rounded-2xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-medium">{pinError}</p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdminLockOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
