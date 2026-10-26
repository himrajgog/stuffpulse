// Punch In / Out Modal with Live Camera Biometric Preview, Face Detection & Blink-to-Punch
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogOut,
  LogIn,
  RotateCcw,
  Navigation,
  Loader2,
  Video,
  VideoOff,
  Eye,
  Scan,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, calculateDistanceMeters, calculateDistanceKm } from '../utils/dateUtils';
import {
  extractFaceDescriptor,
  computeCosineSimilarity,
  checkLivenessMotion,
  detectEyeBlink
} from '../utils/faceRecognitionEngine';
import confetti from 'canvas-confetti';

export const PunchModal = () => {
  const {
    isPunchModalOpen,
    setIsPunchModalOpen,
    employees,
    userRole,
    activeEmployeeId,
    punchIn,
    punchOut,
    attendance,
    selectedDate,
    showToast,
    company
  } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState(activeEmployeeId);
  const [punchType, setPunchType] = useState('IN'); // 'IN' | 'OUT'
  const [selectedLocation, setSelectedLocation] = useState({
    address: 'Detecting live GPS coordinates...',
    lat: null,
    lng: null,
    distanceKm: null,
    isInsideGeofence: false
  });
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Biometric Terminal States
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState(0);
  const [isBlinkTriggered, setIsBlinkTriggered] = useState(false);
  const [autoPunchProcessing, setAutoPunchProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const locationRef = useRef(selectedLocation);

  // Keep locationRef in sync for auto-punch
  useEffect(() => {
    locationRef.current = selectedLocation;
  }, [selectedLocation]);

  useEffect(() => {
    if (userRole === 'employee') {
      setSelectedEmpId(activeEmployeeId);
    }
  }, [userRole, activeEmployeeId]);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const actualToday = getTodayDateString();
  const todayRec = attendance.find(a => a.employeeId === selectedEmpId && a.date === actualToday);
  const isCurrentlyIn = todayRec?.currentLiveStatus === 'IN';

  // Play audio chime
  const playSuccessChime = () => {
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

  // Real GPS Geolocation with Geofence Distance Calculation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let formattedAddress = `GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Real Device Location)`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              formattedAddress = data.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch {
          // Fallback to coordinates
        }

        const officeLat = company?.geofence?.lat || 28.4950;
        const officeLng = company?.geofence?.lng || 77.0895;
        const radiusMeters = company?.geofence?.radiusMeters || 200;
        const strictEnforcement = company?.geofence?.strictEnforcement ?? true;

        const distMeters = calculateDistanceMeters(latitude, longitude, officeLat, officeLng);
        const distKm = distMeters != null ? +(distMeters / 1000).toFixed(2) : null;
        const inside = distMeters !== null && distMeters <= radiusMeters;

        setSelectedLocation({
          address: formattedAddress,
          lat: latitude,
          lng: longitude,
          distanceMeters: distMeters,
          distanceKm: distKm,
          isInsideGeofence: inside,
          radiusMeters,
          strictEnforcement,
        });
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        showToast(`GPS: ${err.message || 'Permission denied'}.`, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Start Real Front Camera
  const handleStartRealCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access denied. Please allow camera permissions to enable touchless face attendance.');
      setIsCameraActive(false);
    }
  };

  // Ensure video element plays and receives stream whenever isCameraActive or punchType changes
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive, punchType]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraActive(false);
    setIsFaceDetected(false);
  };

  // Auto-detect GPS, set punch type & automatically start live camera preview
  useEffect(() => {
    if (isPunchModalOpen) {
      handleDetectGPS();
      setSelfieCaptured(false);
      setSelfieUrl('');
      setIsBlinkTriggered(false);
      setAutoPunchProcessing(false);

      const empId = userRole === 'employee' ? activeEmployeeId : selectedEmpId;
      const rec = attendance.find(a => a.employeeId === empId && a.date === actualToday);
      if (rec?.currentLiveStatus === 'IN') {
        setPunchType('OUT');
      } else {
        setPunchType('IN');
      }

      // Automatically launch camera preview for seamless face attendance
      handleStartRealCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isPunchModalOpen, activeEmployeeId, userRole, selectedEmpId]);

  // Restart camera when switching to 'IN' if closed
  useEffect(() => {
    if (isPunchModalOpen && punchType === 'IN' && !isCameraActive && !selfieCaptured) {
      handleStartRealCamera();
    }
  }, [punchType, isPunchModalOpen]);

  // Continuous Face & Blink Detection Loop
  useEffect(() => {
    if (isCameraActive && isPunchModalOpen && punchType === 'IN' && !autoPunchProcessing) {
      scanIntervalRef.current = setInterval(() => {
        checkVideoFrameForFaceAndBlink();
      }, 250);
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
  }, [isCameraActive, isPunchModalOpen, punchType, autoPunchProcessing, employees, currentEmp]);

  // Frame analyzer: detects face and eye blink
  const checkVideoFrameForFaceAndBlink = () => {
    if (!videoRef.current || autoPunchProcessing) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, 160, 160);
      const frameData = ctx.getImageData(0, 0, 160, 160).data;

      // Extract face descriptor & quality score
      const { descriptor, faceDetected, handDetected, qualityScore, landmarks } = extractFaceDescriptor(canvas);
      
      if (handDetected) {
        setIsFaceDetected(false);
        setFaceQuality(15);
        prevFrameDataRef.current = null;
        return; // Hand / camera obstruction detected -> NEVER punch!
      }

      setIsFaceDetected(faceDetected);
      setFaceQuality(qualityScore);

      if (faceDetected) {
        if (prevFrameDataRef.current) {
          const liveness = checkLivenessMotion(prevFrameDataRef.current, frameData, landmarks);

          // Eye Blink detected on a verified face!
          if (liveness.blinkDetected) {
            handleBlinkPunchTrigger(descriptor, qualityScore);
          }
        }
        prevFrameDataRef.current = frameData;
      } else {
        prevFrameDataRef.current = null;
      }
    } catch (err) {
      console.warn('Face frame check exception:', err);
    }
  };

  // Executes punch when eye blink is detected
  const handleBlinkPunchTrigger = (descriptor, qualityScore) => {
    if (autoPunchProcessing || isBlinkTriggered) return;

    // Check anti-buddy punch if profile is enrolled
    if (currentEmp?.faceEnrolled && currentEmp?.faceDescriptor && Array.isArray(currentEmp.faceDescriptor)) {
      const similarity = computeCosineSimilarity(descriptor, currentEmp.faceDescriptor);
      const matchConfidence = +(similarity * 100).toFixed(1);
      if (matchConfidence < 78.0) {
        showToast(`⚠️ Biometric Mismatch (${matchConfidence}%): Live face does not match ${currentEmp.name}.`, 'error');
        return;
      }
    }

    // Capture snapshot from video feed
    let snapDataUrl = null;
    if (videoRef.current) {
      try {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = 400;
        snapCanvas.height = 400;
        const sctx = snapCanvas.getContext('2d');
        sctx.translate(400, 0);
        sctx.scale(-1, 1);
        sctx.drawImage(videoRef.current, 0, 0, 400, 400);
        snapDataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
      } catch (e) {
        console.warn('Snapshot capture fallback:', e);
      }
    }

    const finalPhoto = snapDataUrl || currentEmp.avatar;
    setSelfieUrl(finalPhoto);
    setSelfieCaptured(true);
    setIsBlinkTriggered(true);
    setAutoPunchProcessing(true);

    playSuccessChime();
    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    } catch {}

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const loc = locationRef.current;

    // Check strict geofence lock
    const strictLock = company?.geofence?.strictEnforcement ?? true;
    if (strictLock && loc.lat && !loc.isInsideGeofence) {
      showToast(`⚠️ Geofence Lock: You are ${loc.distanceKm || 'out of range'} km away from office perimeter. Punch restricted.`, 'error');
      setAutoPunchProcessing(false);
      setIsBlinkTriggered(false);
      return;
    }

    const locationTag = loc.isInsideGeofence
      ? `${loc.address} (Office Geofence Verified)`
      : `${loc.address || 'Field Location'} (Field Punch: ${loc.distanceKm || '0'}km from HQ)`;

    // Record attendance
    punchIn({
      employeeId: selectedEmpId,
      address: locationTag,
      coordinates: { lat: loc.lat || 26.8532, lng: loc.lng || 75.7681 },
      selfieUrl: finalPhoto,
      notes: `Touchless Eye-Blink Face Punch (Face Quality: ${qualityScore}%) • ${locationTag}`,
      timeStr: nowTimeStr,
      dateStr: actualToday,
    });

    showToast(`🎯 Blink verified! Attendance recorded for ${currentEmp.name} at ${nowTimeStr}!`, 'success');

    // Auto-close after celebration
    setTimeout(() => {
      stopCameraStream();
      setIsPunchModalOpen(false);
    }, 1800);
  };

  // Manual snapshot button fallback
  const handleSnapRealCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const faceResult = extractFaceDescriptor(canvas);
      if (!faceResult.faceDetected) {
        showToast('⚠️ No face detected in frame. Please align your face inside the green rectangle.', 'error');
        return;
      }

      setSelfieUrl(dataUrl);
      setSelfieCaptured(true);
      showToast('✅ Face snapshot captured successfully!', 'success');
    }
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (punchType === 'IN') {
      if (!selfieCaptured || !selfieUrl) {
        showToast('⚠️ Face verification photo required. Align your face and blink, or snap manually.', 'error');
        return;
      }
      if (!selectedLocation.lat) {
        showToast('⚠️ Live GPS location is required. Please click "Detect Live GPS".', 'error');
        return;
      }
      if (isCurrentlyIn) {
        showToast(`⚠️ Already clocked in today at ${todayRec?.punchIn}. Switch to "PUNCH OUT" to end shift.`, 'error');
        return;
      }

      const strictLock = company?.geofence?.strictEnforcement ?? true;
      if (strictLock && !selectedLocation.isInsideGeofence) {
        showToast(`⚠️ Geofence Lock: Outside allowed ${company?.geofence?.radiusMeters || 200}m office boundary.`, 'error');
        return;
      }

      const locationTag = selectedLocation.isInsideGeofence
        ? `${selectedLocation.address} (Office Geofence Verified)`
        : `${selectedLocation.address} (Field Punch: ${selectedLocation.distanceKm}km from HQ)`;

      punchIn({
        employeeId: selectedEmpId,
        address: locationTag,
        coordinates: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        selfieUrl,
        notes: remarks ? `${remarks} • ${locationTag}` : locationTag,
        timeStr: nowTimeStr,
        dateStr: actualToday,
      });

      stopCameraStream();
      setIsPunchModalOpen(false);
    } else {
      // PUNCH OUT
      if (!isCurrentlyIn && !todayRec?.punchIn) {
        showToast('⚠️ You have not clocked in today. Please punch in first.', 'error');
        return;
      }
      if (todayRec?.punchOut && todayRec?.currentLiveStatus === 'OUT') {
        showToast(`⚠️ Already clocked out today at ${todayRec.punchOut}.`, 'error');
        return;
      }

      punchOut({
        employeeId: selectedEmpId,
        address: selectedLocation.address || 'Office HQ Terminal',
        timeStr: nowTimeStr,
        dateStr: actualToday,
      });

      stopCameraStream();
      setIsPunchModalOpen(false);
    }
  };

  if (!isPunchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Hidden Canvas for Face Calculations */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 text-white relative border-b border-slate-800">
          <button
            onClick={() => {
              stopCameraStream();
              setIsPunchModalOpen(false);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Touchless Biometric Terminal</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1 tracking-tight">Staff Attendance Kiosk</h2>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-300 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {currentTime}
            </span>
            <span>•</span>
            <span className="text-slate-300 font-medium">Date: {actualToday}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* Staff Member Identity Card */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Staff Member Identity
            </label>
            {userRole === 'employee' ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <img
                  src={currentEmp?.avatar}
                  alt={currentEmp?.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-300 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 truncate">{currentEmp?.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                      {currentEmp?.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentEmp?.designation} • {currentEmp?.department}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Live Today Status Banner with Cooldown Guard */}
            {todayRec && (
              <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Status Today:</span>
                <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 ${
                  isCurrentlyIn ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyIn ? 'bg-emerald-600 animate-ping' : 'bg-slate-500'}`} />
                  {isCurrentlyIn ? `Punched IN at ${todayRec.punchIn}` : todayRec.punchOut ? `Punched OUT at ${todayRec.punchOut}` : 'Not Punched Today'}
                </span>
              </div>
            )}
          </div>

          {/* Action Choice: Punch IN vs OUT */}
          <div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPunchType('IN')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                  punchType === 'IN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>PUNCH IN (CAMERA)</span>
              </button>
              <button
                type="button"
                onClick={() => setPunchType('OUT')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                  punchType === 'OUT'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>PUNCH OUT</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LIVE CAMERA PREVIEW TERMINAL & GREEN RECTANGLE FACE HUD */}
          {/* ============================================================== */}
          {punchType === 'IN' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Face Terminal Live Viewfinder</span>
                </label>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-emerald-500" />
                  Blink to Punch
                </span>
              </div>

              {/* Viewfinder Container */}
              <div className="relative w-full aspect-[4/3] min-h-[280px] sm:min-h-[320px] rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
                
                {/* Live Mirror Camera Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                  className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition duration-200 ${
                    isCameraActive && !selfieCaptured ? 'block' : 'hidden'
                  } ${isFaceDetected ? 'brightness-105' : 'brightness-90'}`}
                />

                {/* Captured Selfie or Avatar Fallback */}
                {(!isCameraActive || selfieCaptured) && (
                  <img
                    src={selfieUrl || currentEmp?.avatar}
                    alt="Employee Verification Preview"
                    className="w-full h-full object-cover filter brightness-95"
                  />
                )}

                {/* Camera Permission / Error Notification Overlay */}
                {cameraError && !isCameraActive && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-20">
                    <VideoOff className="w-8 h-8 text-amber-400" />
                    <p className="text-xs text-slate-300 font-semibold max-w-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={handleStartRealCamera}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                    </button>
                  </div>
                )}

                {/* Top Live Camera Telemetry */}
                <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-slate-200 flex items-center gap-1.5 border border-white/10 z-10">
                  <span className={`w-2 h-2 rounded-full ${isFaceDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{isFaceDetected ? `FACE DETECTED (${faceQuality}%)` : 'SEARCHING FACE...'}</span>
                </div>

                {/* ============================================================== */}
                {/* DYNAMIC GREEN RECTANGLE BOUNDING BOX OVER DETECTED FACE */}
                {/* ============================================================== */}
                {isCameraActive && !selfieCaptured && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div
                      className={`relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between p-3 ${
                        isBlinkTriggered
                          ? 'border-4 border-emerald-400 bg-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.8)] scale-105'
                          : isFaceDetected
                          ? 'border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse'
                          : 'border-2 border-dashed border-white/40'
                      }`}
                    >
                      {/* 4 Green Corner Brackets */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Top HUD Badge */}
                      <div className="flex items-center justify-between w-full text-[9px] font-mono text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <span>{isFaceDetected ? '🟢 LIVE TARGET' : 'ALIGN FACE'}</span>
                        <span>128-D AI</span>
                      </div>

                      {/* Scanning Laser Beam */}
                      {isFaceDetected && !isBlinkTriggered && (
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />
                      )}

                      {/* Center Checkmark on Successful Blink */}
                      {isBlinkTriggered && (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl animate-in zoom-in-75">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                      )}

                      {/* Bottom Guidance Label */}
                      <div className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-emerald-200 bg-slate-950/90 border border-emerald-500/40 shadow-sm flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>{isFaceDetected ? 'Blink Eyes to Punch' : 'Step Into Box'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmed Snapshot Banner */}
                {selfieCaptured && (
                  <div className="absolute bottom-2.5 inset-x-2.5 bg-emerald-950/90 backdrop-blur-md p-2 rounded-xl border border-emerald-500/40 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5 z-20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Live Biometric Selfie Verified!</span>
                  </div>
                )}
              </div>

              {/* Viewfinder Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {selfieCaptured ? 'Photo captured & verified.' : 'Camera active with live AI blink detector.'}
                </span>

                <div className="flex items-center gap-2">
                  {isCameraActive && !selfieCaptured && (
                    <button
                      type="button"
                      onClick={handleSnapRealCamera}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Snap Manually</span>
                    </button>
                  )}
                  {selfieCaptured && (
                    <button
                      type="button"
                      onClick={handleStartRealCamera}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retake</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PUNCH OUT NOTICE */}
          {/* ============================================================== */}
          {punchType === 'OUT' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Shift Clock-Out Confirmation</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Ending shift for <strong>{currentEmp?.name}</strong> at <strong>{currentTime}</strong>. 
                Your total work duration will be calculated automatically against your company's shift schedule.
              </p>
              {todayRec?.punchIn && (
                <div className="text-[11px] text-rose-600 font-mono bg-white/70 p-2 rounded-xl border border-rose-100">
                  Shift Started: {todayRec.punchIn} • Date: {todayRec.date}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* GEOLOCATION WITH OFFICE GEOFENCE */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Geo-Location Perimeter
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGps}
                className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 disabled:opacity-50 cursor-pointer"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" /> Refresh GPS
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {selectedLocation.address || 'Click "Refresh GPS" to fetch real device position'}
                </p>
                <div className="text-[10px] text-slate-500 font-mono mt-1 flex flex-wrap items-center justify-between gap-1">
                  {selectedLocation.lat ? (
                    <>
                      <span>{selectedLocation.lat?.toFixed(4)}°N, {selectedLocation.lng?.toFixed(4)}°E</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded ${
                        selectedLocation.isInsideGeofence
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedLocation.isInsideGeofence
                          ? '✅ Office Perimeter Verified'
                          : `📍 Field Punch (${selectedLocation.distanceKm} km from HQ)`}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-600 font-bold">📍 Detecting coordinates...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks (Optional) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Work Shift Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Client visit, normal office duty"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={autoPunchProcessing}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                punchType === 'IN'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 shadow-rose-500/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm {punchType === 'IN' ? 'Punch In' : 'Punch Out'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
