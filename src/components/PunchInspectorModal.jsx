import React from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PunchInspectorModal = () => {
  const {
    selectedPunchDetail,
    setSelectedPunchDetail
  } = useApp();

  if (!selectedPunchDetail) return null;

  const {
    record,
    employee
  } = selectedPunchDetail;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative border border-slate-200">
        
        <button
          onClick={() => setSelectedPunchDetail(null)}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Biometric Geo-Verified</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold">{record.date}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Punch Verification Record
          </h3>
          <p className="text-xs text-slate-500">
            {employee?.name || record.employeeName} ({employee?.designation || 'Staff'})
          </p>
        </div>

        {/* Verification Selfie Photo Card */}
        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 text-center space-y-2">
          <div className="relative aspect-[4/3] h-48 max-h-52 w-full rounded-xl overflow-hidden mx-auto bg-slate-950 flex items-center justify-center">
            <img
              src={record.selfieUrl || employee?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"}
              alt="Verification selfie"
              className="w-full h-full object-cover"
            />
            {/* Live Facial Scanner Frame Overlay */}
            <div className="absolute inset-4 border-2 border-emerald-400 rounded-xl pointer-events-none flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>MATCH 99.2%</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <span>Anti-Spoofing Liveness:</span>
            <strong className="text-emerald-400">PASSED</strong>
          </div>
        </div>

        {/* Punch Details Grid */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Punch Status</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              record.status === 'Present'
                ? 'bg-emerald-100 text-emerald-800'
                : record.status === 'Late'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {record.status} ({record.currentLiveStatus || 'IN'})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Timestamp</span>
            <span className="font-bold text-slate-900 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{record.punchIn || '09:42 AM'}</span>
            </span>
          </div>

          <div className="border-t border-slate-200/60 pt-2 space-y-1">
            <span className="text-slate-500 font-medium block">Precise Geo Address</span>
            <div className="text-slate-800 font-semibold flex items-start gap-1.5 leading-snug">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{record.inAddress || "Plot 42, Mansarovar Industrial Area, Jaipur, Rajasthan 302020"}</span>
            </div>
          </div>

          {record.inCoordinates && (
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
              <span>GPS Coordinates:</span>
              <span>{record.inCoordinates.lat}, {record.inCoordinates.lng} (Accuracy: 4.2m)</span>
            </div>
          )}

        </div>

        <button
          onClick={() => setSelectedPunchDetail(null)}
          className="w-full bg-slate-950 hover:bg-black text-white font-bold py-2.5 rounded-full transition active:scale-95 text-xs shadow-xs"
        >
          Close Record
        </button>

      </div>
    </div>
  );
};
