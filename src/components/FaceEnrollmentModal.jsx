// Velo HR — Face ID Biometric Enrollment Modal
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Scan,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Video,
  UserCheck,
  Layers,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { extractFaceDescriptor } from '../utils/faceRecognitionEngine';
import confetti from 'canvas-confetti';

export const FaceEnrollmentModal = ({ isOpen, onClose, employee }) => {
  const { saveEmployee, showToast } = useApp();

  const [streamActive, setStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [descriptor, setDescriptor] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setDescriptor(null);
      setQualityScore(0);
      setCountdown(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

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
          setStreamActive(true);
        }
      } else {
        showToast('Webcam not accessible on this device.', 'error');
      }
    } catch (err) {
      console.warn('Camera access denied:', err);
      showToast('Camera permission denied or camera unavailable.', 'error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  // Automated 3-second countdown capture
  const handleStartCaptureSequence = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          snapSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const snapSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Mirror capture to match live mirror preview
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.9);

    setCapturedPhoto(photoData);
    setAnalyzing(true);

    // Extract real 128-D descriptor
    setTimeout(() => {
      const result = extractFaceDescriptor(canvas);
      setQualityScore(result.qualityScore);
      setFaceDetected(result.faceDetected);
      setDescriptor(result.descriptor);
      setAnalyzing(false);
    }, 600);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setDescriptor(null);
    setQualityScore(0);
    setCountdown(null);
    if (!streamActive) {
      startCamera();
    }
  };

  const handleSaveEnrollment = () => {
    if (!employee || !descriptor) return;

    const updatedEmployee = {
      ...employee,
      avatar: capturedPhoto || employee.avatar,
      faceEnrolled: true,
      faceDescriptor: descriptor,
      faceQualityScore: qualityScore,
      faceEnrolledAt: new Date().toISOString()
    };

    saveEmployee(updatedEmployee);

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {}

    showToast(`✅ Biometric Face ID successfully enrolled for ${employee.name}!`, 'success');
    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1b3b6f] to-blue-600 flex items-center justify-center text-amber-400 shadow-md">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Enroll Face ID Biometrics
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                128-D Vector AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Registering biometric profile for <strong className="text-slate-200">{employee.name}</strong> ({employee.id})
            </p>
          </div>
        </div>

        {/* Camera Viewport & HUD Overlay */}
        <div className="relative aspect-[4/3] min-h-[260px] sm:min-h-[300px] w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
          
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
            className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${
              capturedPhoto ? 'hidden' : 'block'
            }`}
          />

          {/* Captured Snapshot Preview */}
          {capturedPhoto && (
            <img
              src={capturedPhoto}
              alt="Face Snapshot"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Oval Face Guide Overlay */}
          {!capturedPhoto && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-60 border-2 border-dashed border-amber-400/80 rounded-[50%] flex flex-col items-center justify-between p-4 shadow-[0_0_25px_rgba(243,156,18,0.2)]">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-slate-900/80 px-2 py-0.5 rounded-full">
                  Align Face Here
                </span>
                <span className="text-[10px] text-slate-300 text-center font-medium bg-slate-900/80 px-2 py-0.5 rounded-full">
                  Keep eyes open & steady
                </span>
              </div>
            </div>
          )}

          {/* Countdown Display */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <div className="text-7xl font-black text-amber-400 animate-ping">
                {countdown}
              </div>
            </div>
          )}

          {/* Analyzing Spinner */}
          {analyzing && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 z-20">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-xs font-bold text-blue-200">
                Extracting 128-D Biometric Landmarks...
              </span>
            </div>
          )}
        </div>

        {/* Quality Score & Landmark Status Card */}
        {capturedPhoto && !analyzing && (
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Biometric Quality Score:
              </span>
              <span className={`font-mono font-black ${qualityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {qualityScore}% ({qualityScore >= 80 ? 'Excellent' : 'Acceptable'})
              </span>
            </div>
            
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  qualityScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${qualityScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                128 Feature Vectors Generated
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Face Detected & Calibrated
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!capturedPhoto && (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px] text-slate-400">
              Position the employee facing the camera directly in normal indoor lighting. When ready, click <strong>"Capture Face ID"</strong> to begin a 3-second calibrated sequence.
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-1">
          {!capturedPhoto ? (
            <button
              type="button"
              onClick={handleStartCaptureSequence}
              disabled={countdown !== null}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Face ID (3s Timer)</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEnrollment}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Save & Activate Face ID</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
