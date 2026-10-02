// Velo HR — Cinematic Video Showcase Modal (anim.mp4)
import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CinematicVideoModal = ({ isOpen, onClose, onGoToDemo }) => {
  const { navigateTo } = useApp();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f2444]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Floating Action Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          {/* Brand Tag */}
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full pointer-events-auto shadow-lg">
            <img src="/iconlogo.png" alt="Velo HR" className="w-5 h-5 object-contain" />
            <span className="text-white text-xs font-bold tracking-tight">Velo HR Platform Tour</span>
          </div>

          {/* Quick Exit to Login / Demo Access */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                onClose();
                if (onGoToDemo) onGoToDemo();
                else navigateTo('login');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
            >
              <span>Skip to Demo Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              title="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src="/anim.mp4"
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            playsInline
            autoPlay
          />

          {/* Center Play Overlay when Paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl transition hover:scale-110 active:scale-95 cursor-pointer z-10"
            >
              <Play className="w-8 h-8 fill-slate-950 ml-1" />
            </button>
          )}

          {/* Custom Video Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 z-20">
            {/* Progress Bar */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
              <div
                className="bg-gradient-to-r from-blue-500 to-amber-500 h-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1 text-slate-200 hover:text-white transition cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1 text-slate-200 hover:text-white transition cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  Velo HR Enterprise Showcase
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-amber-400 font-semibold hidden sm:inline flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Real-time Geofenced Biometrics</span>
                </span>

                <button
                  onClick={toggleFullscreen}
                  className="p-1 text-slate-200 hover:text-white transition cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Bar */}
        <div className="bg-[#0f2444] border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-Tenant Firestore Isolation • Instant GPS Check-ins • 1-Click EPF/ESI Payroll</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                if (onGoToDemo) onGoToDemo();
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer text-center"
            >
              Request Sandboxed Demo
            </button>
            <button
              onClick={() => {
                onClose();
                navigateTo('login');
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer text-center"
            >
              Sign In to Portal
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
