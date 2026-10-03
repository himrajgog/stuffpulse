// Punch In / Out Modal with Real Camera Selfie & Live GPS Geolocation
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
  Video
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, calculateDistanceMeters, calculateDistanceKm } from '../utils/dateUtils';
import { extractFaceDescriptor, computeCosineSimilarity } from '../utils/faceRecognitionEngine';

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

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (userRole === 'employee') {
      setSelectedEmpId(activeEmployeeId);
    }
  }, [userRole, activeEmployeeId]);

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

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const todayRec = attendance.find(a => a.employeeId === selectedEmpId && a.date === selectedDate);
  const isCurrentlyIn = todayRec?.currentLiveStatus === 'IN';

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
          // Reverse geocode via OpenStreetMap free API
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
          // Fallback to formatted coords
        }

        // Dynamic Company Office Geofence
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
        showToast(
          inside
            ? `📍 Verified inside office geofence (${distMeters}m from HQ)!`
            : `📍 GPS captured: ${distKm} km from office (Allowed: ${radiusMeters}m).`,
          inside ? 'success' : strictEnforcement ? 'error' : 'info'
        );
      },
      (err) => {
        setIsDetectingGps(false);
        showToast(`Location error: ${err.message || 'Permission denied'}. GPS permission is required.`, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Auto-detect GPS and set punch direction on open
  useEffect(() => {
    if (isPunchModalOpen) {
      handleDetectGPS();
      const actualToday = getTodayDateString();
      const empId = userRole === 'employee' ? activeEmployeeId : selectedEmpId;
      const rec = attendance.find(a => a.employeeId === empId && a.date === actualToday);
      if (rec?.currentLiveStatus === 'IN') {
        setPunchType('OUT');
      } else {
        setPunchType('IN');
      }
    }
  }, [isPunchModalOpen, activeEmployeeId, userRole, selectedEmpId]);

  // Open Real Camera
  const handleStartRealCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Camera access is not supported on this browser/device.', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 400, height: 400 }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      showToast('Camera permission denied. Front camera is mandatory to punch attendance.', 'error');
    }
  };

  // Capture snapshot from real camera with biometric facial matching
  const handleSnapRealCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 320;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1); // Mirror snapshot to match mirror preview
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // 1. Verify that a real human face is present before accepting selfie
      const faceResult = extractFaceDescriptor(canvas);
      if (!faceResult.faceDetected) {
        showToast('⚠️ No face detected! Please position your face clearly in the camera and retake.', 'error');
        return;
      }

      // 2. Anti-Buddy Punch Verification: Verify face matches employee if enrolled
      if (currentEmp?.faceEnrolled && currentEmp?.faceDescriptor && Array.isArray(currentEmp.faceDescriptor)) {
        const similarity = computeCosineSimilarity(faceResult.descriptor, currentEmp.faceDescriptor);
        const matchConfidence = +(similarity * 100).toFixed(1);
        if (matchConfidence < 80.0) {
          showToast(`⚠️ Biometric Mismatch (${matchConfidence}%): Live face does not match registered biometric profile for ${currentEmp.name}. Buddy punching is strictly prohibited.`, 'error');
          return;
        }
        showToast(`✅ Biometric Face ID Matched (${matchConfidence}% Match)`, 'success');
      } else {
        showToast(`✅ Live face verified (${faceResult.qualityScore}% clarity)`, 'success');
      }

      setSelfieUrl(dataUrl);
      setSelfieCaptured(true);
      setIsCameraActive(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const actualToday = getTodayDateString();

    if (punchType === 'IN') {
      if (!selfieCaptured || !selfieUrl) {
        showToast('⚠️ Live face photo is required to punch in. Please snap a selfie.', 'error');
        return;
      }
      if (!selectedLocation.lat) {
        showToast('⚠️ Live GPS location is required. Please click "Detect Live GPS".', 'error');
        return;
      }
      if (isCurrentlyIn) {
        showToast(`⚠️ You are already clocked in today at ${todayRec?.punchIn}. Select "PUNCH OUT" to end shift.`, 'error');
        return;
      }

      // Enforce strict geofence lock if company enabled it
      const strictLock = company?.geofence?.strictEnforcement ?? true;
      if (strictLock && !selectedLocation.isInsideGeofence) {
        showToast(`⚠️ Geofence Lock: You are ${selectedLocation.distanceKm || 'out of range'} km away from registered office perimeter. Strict on-premise presence within ${company?.geofence?.radiusMeters || 200}m is required.`, 'error');
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
    } else {
      if (!isCurrentlyIn && !todayRec?.punchIn) {
        showToast('⚠️ You have not clocked in today. You must clock in first before clocking out.', 'error');
        return;
      }
      if (todayRec?.punchOut && todayRec?.currentLiveStatus === 'OUT') {
        showToast(`⚠️ You have already clocked out for today at ${todayRec.punchOut}.`, 'error');
        return;
      }

      punchOut({
        employeeId: selectedEmpId,
        address: selectedLocation.address || 'Office HQ Terminal',
        timeStr: nowTimeStr,
        dateStr: actualToday,
      });
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    setIsPunchModalOpen(false);
    setSelfieCaptured(false);
    setSelfieUrl('');
    setRemarks('');
  };

  if (!isPunchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white relative">
          <button
            onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
              setIsPunchModalOpen(false);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Live Biometric & Geo Attendance
          </div>
          <h2 className="text-xl font-extrabold mt-1">Staff Punch Terminal</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-mono bg-white/10 px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {currentTime}
            </span>
            <span>•</span>
            <span>Date: {selectedDate}</span>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Employee Identity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {todayRec && (
              <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500">Current Status Today:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  isCurrentlyIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isCurrentlyIn ? `Punched IN at ${todayRec.punchIn}` : todayRec.punchOut ? `Punched OUT at ${todayRec.punchOut}` : 'Not Punched Today'}
                </span>
              </div>
            )}
          </div>

          {/* Action Choice: Punch IN vs OUT */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Punch Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPunchType('IN')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                  punchType === 'IN'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>PUNCH IN</span>
              </button>
              <button
                type="button"
                onClick={() => setPunchType('OUT')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                  punchType === 'OUT'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>PUNCH OUT</span>
              </button>
            </div>
          </div>

          {/* Selfie / Photo Verification */}
          {punchType === 'IN' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Biometric Selfie Verification
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className={`relative ${isCameraActive ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-16 h-16'} rounded-2xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 transition-all duration-300`}>
                    {isCameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    ) : selfieCaptured || selfieUrl ? (
                      <img
                        src={selfieUrl || currentEmp?.avatar}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-slate-600 font-medium leading-tight">
                      {isCameraActive
                        ? "Point front camera to your face and snap photo."
                        : selfieCaptured
                        ? "Selfie verified & matched with employee profile."
                        : "Take or upload a quick selfie to verify attendance on-site."}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {isCameraActive ? (
                        <button
                          type="button"
                          onClick={handleSnapRealCamera}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Snap Photo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartRealCamera}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-emerald-400" /> Open Camera
                        </button>
                      )}
                      {selfieCaptured && (
                        <button
                          type="button"
                          onClick={handleStartRealCamera}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                        >
                          Retake
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Geolocation Tagging with Real GPS Detection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Geo-Tag Location
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGps}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Detecting GPS...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3" /> Detect Live GPS
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  {selectedLocation.address || 'Click "Detect Live GPS" to fetch real device position'}
                </p>
                <div className="text-[11px] text-slate-500 font-mono mt-1 flex flex-wrap items-center justify-between gap-1">
                  {selectedLocation.lat ? (
                    <>
                      <span>GPS: {selectedLocation.lat?.toFixed(4)}, {selectedLocation.lng?.toFixed(4)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        selectedLocation.isInsideGeofence
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedLocation.isInsideGeofence
                          ? '✅ Office Geofence Verified'
                          : `📍 Field Punch (${selectedLocation.distanceKm} km from Office)`}
                      </span>
                    </>
                  ) : (
                    <span className="text-rose-500 font-bold">⚠️ GPS coordinates required</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes / Work Shift Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Client visit at site, general office duty"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                punchType === 'IN'
                  ? 'bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 shadow-emerald-500/25'
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
