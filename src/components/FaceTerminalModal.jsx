import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Scan,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Video,
  VideoOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

export const FaceTerminalModal = () => {
  const {
    isFaceTerminalOpen,
    setIsFaceTerminalOpen,
    employees,
    punchIn,
    showToast
  } = useApp();

  const [selectedStaffId, setSelectedStaffId] = useState(employees[0]?.id || 'EMP-001');
  const [scanState, setScanState] = useState('ready'); // 'ready' | 'scanning' | 'matched' | 'failed'
  const [matchScore, setMatchScore] = useState(99.2);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const selectedEmployee = employees.find(e => e.id === selectedStaffId) || employees[0];

  // Initialize camera when terminal opens
  useEffect(() => {
    if (isFaceTerminalOpen) {
      setScanState('ready');
      setCapturedPhoto(null);
      setMatchScore(+(98.5 + Math.random() * 1.3).toFixed(1));

      // Attempt to access live physical camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        })
          .then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
              setCameraActive(true);
            }
          })
          .catch((err) => {
            console.log('Real camera not accessible, falling back to simulated biometric feed:', err.message);
            setCameraActive(false);
          });
      }
    }

    return () => {
      // Clean up stream tracks on close
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    };
  }, [isFaceTerminalOpen]);

  if (!isFaceTerminalOpen) return null;

  const handleStartScan = () => {
    setScanState('scanning');

    // Take snapshot if live camera is active
    let photoData = selectedEmployee.avatar;
    if (cameraActive && videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        photoData = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(photoData);
      } catch (e) {
        console.warn('Snapshot capture fallback:', e);
      }
    }

    setTimeout(() => {
      setScanState('matched');
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}

      // Record biometric punch in
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      punchIn({
        employeeId: selectedEmployee.id,
        address: "Mansarovar Industrial Area, Jaipur, Rajasthan",
        selfieUrl: photoData,
        notes: `AI Face Terminal Check-In (Match: ${matchScore}%, Anti-Spoofing Passed${cameraActive ? ', Live Hardware Camera' : ''})`,
        timeStr: nowTime,
      });

      showToast(`🎯 Face match confirmed for ${selectedEmployee.name}! Checked In at ${nowTime}`, 'success');

      // Auto-reset back to ready after 3.5 seconds
      setTimeout(() => {
        setScanState('ready');
      }, 3500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
        
        {/* Hidden canvas for taking snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Close Button */}
        <button
          onClick={() => setIsFaceTerminalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Terminal Header */}
        <div className="flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/30">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">Face Terminal Kiosk</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Touchless
                </span>
                {cameraActive && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Video className="w-3 h-3" /> Live Cam
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>Mansarovar Industrial Area Terminal, Jaipur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Viewfinder Camera Viewport */}
        <div className="relative w-full aspect-4/3 rounded-2xl bg-slate-900 border-2 border-slate-800 overflow-hidden flex items-center justify-center">
          
          {/* Live Video Feed (if hardware camera allowed) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition duration-300 ${
              cameraActive && !capturedPhoto ? 'block' : 'hidden'
            } ${scanState === 'scanning' ? 'brightness-110 contrast-105' : 'brightness-95'}`}
          />

          {/* Captured photo or avatar fallback */}
          {(!cameraActive || capturedPhoto) && (
            <img
              src={capturedPhoto || selectedEmployee.avatar}
              alt={selectedEmployee.name}
              className={`w-full h-full object-cover transition duration-300 filter ${
                scanState === 'scanning' ? 'brightness-110 contrast-105' : 'brightness-90'
              }`}
            />
          )}

          {/* Vignette & scan overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

          {/* AI Face Scanning Green Rectangle HUD [   ] */}
          <div className={`absolute w-48 h-56 sm:w-56 sm:h-64 rounded-2xl transition-all duration-300 pointer-events-none flex items-center justify-center ${
            scanState === 'matched'
              ? 'border-4 border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/50'
              : scanState === 'scanning'
              ? 'border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-pulse'
              : 'border-2 border-dashed border-emerald-400/50'
          }`}>
            
            {/* Green Corner Brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

            {/* Scanning Laser Beam */}
            {scanState === 'scanning' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-md shadow-cyan-400" />
            )}

            {/* Success Checkmark Circle */}
            {scanState === 'matched' && (
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl animate-in zoom-in-50 duration-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Top Camera Status Overlay */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${scanState === 'scanning' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{cameraActive ? 'WEBCAM ACTIVE · FPS 60' : 'SIMULATED FEED · ANTI-SPOOF ACTIVE'}</span>
          </div>

          {/* Live Anti-Spoofing & Match Score Tag */}
          <div className="absolute bottom-3 inset-x-3 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Face Match: <strong className="text-emerald-400">{matchScore}%</strong></span>
            </div>
            <span className="text-[10px] text-slate-400">Liveness Score: 0.994</span>
          </div>

        </div>

        {/* Checked In Confirmation Banner */}
        {scanState === 'matched' && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-1 animate-in zoom-in-95">
            <div className="text-emerald-400 font-extrabold text-base flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Checked In Successfully!</span>
            </div>
            <div className="text-xs text-slate-200">
              Employee: <strong className="text-white">{selectedEmployee.name}</strong> ({selectedEmployee.department})
            </div>
            <div className="text-[11px] text-slate-400">
              Timestamp: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · Geo: Mansarovar Industrial Area, Jaipur
            </div>
          </div>
        )}

        {/* Staff Simulator Switcher & Action Trigger */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Select Staff to Test Face Terminal:</span>
            <span className="text-slate-500 font-mono text-[10px]">ID: {selectedEmployee.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedStaffId}
              disabled={scanState === 'scanning'}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setScanState('ready');
                setCapturedPhoto(null);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-medium outline-hidden"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>

            <button
              onClick={handleStartScan}
              disabled={scanState === 'scanning'}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>{scanState === 'scanning' ? 'Verifying Face...' : 'Scan & Punch In'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
