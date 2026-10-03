// Company Profile, Statutory Policies & Firebase Settings View
import React, { useState } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  Cloud,
  CloudOff,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Sparkles,
  Database,
  Clock,
  MapPin,
  Radio,
  Navigation,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isFirebaseActive } from '../services/firebase';

export const SettingsView = () => {
  const { company, updateCompany, resetDemoData, setIsFirebaseConfigModalOpen, showToast } = useApp();

  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [formData, setFormData] = useState({
    name: company.name || '',
    brandName: company.brandName || '',
    address: company.address || '',
    phone: company.phone || '',
    email: company.email || '',
    gstin: company.gstin || '',
    pan: company.pan || '',
    currency: company.currency || 'INR',
    currencySymbol: company.currencySymbol || '₹',
    pfRate: company.pfRate ? (company.pfRate * 100) : 12,
    esiRate: company.esiRate ? (company.esiRate * 100) : 0.75,
    professionalTax: company.professionalTax || 200,
    shiftGracePeriodMins: company.shiftGracePeriodMins || 15,
    shiftHalfDayThresholdHours: company.shiftHalfDayThresholdHours || 4.5,
    shiftStartTime: company.shiftStartTime || '09:30',
    shiftEndTime: company.shiftEndTime || '18:30',
    geofenceLat: company.geofence?.lat || 28.4950,
    geofenceLng: company.geofence?.lng || 77.0895,
    geofenceRadius: company.geofence?.radiusMeters || 200,
    geofenceStrict: company.geofence?.strictEnforcement ?? true,
    geofenceAddress: company.geofence?.address || company.address || 'Corporate Office HQ',
  });

  const isConnected = isFirebaseActive();

  const handleDetectOfficeGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedAddress = `Office Location (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              detectedAddress = data.display_name.split(',').slice(0, 4).join(', ');
            }
          }
        } catch {
          // fallback to coordinates
        }

        setFormData(prev => ({
          ...prev,
          geofenceLat: +(latitude.toFixed(6)),
          geofenceLng: +(longitude.toFixed(6)),
          geofenceAddress: detectedAddress
        }));
        setIsDetectingGps(false);
        showToast('📍 Live office GPS coordinates detected and updated!', 'success');
      },
      (err) => {
        setIsDetectingGps(false);
        showToast(`Could not capture GPS: ${err.message}. Please verify browser location permissions.`, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCompany({
      ...company,
      ...formData,
      pfRate: Number(formData.pfRate) / 100,
      esiRate: Number(formData.esiRate) / 100,
      professionalTax: Number(formData.professionalTax),
      shiftGracePeriodMins: Number(formData.shiftGracePeriodMins),
      shiftHalfDayThresholdHours: Number(formData.shiftHalfDayThresholdHours),
      geofence: {
        lat: Number(formData.geofenceLat),
        lng: Number(formData.geofenceLng),
        radiusMeters: Number(formData.geofenceRadius),
        strictEnforcement: Boolean(formData.geofenceStrict),
        address: formData.geofenceAddress || formData.address || 'Corporate Office HQ',
        branches: [
          {
            id: 'branch-main',
            name: 'Primary Office Campus',
            lat: Number(formData.geofenceLat),
            lng: Number(formData.geofenceLng),
            radiusMeters: Number(formData.geofenceRadius),
            address: formData.geofenceAddress || formData.address,
          }
        ]
      }
    });
    showToast('✅ Company settings & geofence perimeter updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-10 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              System Settings & Company Policies
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage company branding on payslips, statutory PF/ESI rates, and Firebase Cloud storage
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reload Sample Data</span>
        </button>
      </div>

      {/* Firebase Cloud Sync Card */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <h3 className="font-extrabold text-sm tracking-wide uppercase text-slate-200">
              Firebase Cloud Firestore & Storage
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-lg">
            {isConnected
              ? 'Connected to Firebase. All attendance records, receipt files, and payroll statements sync live.'
              : 'Running in resilient Local-First Mode with realistic demo data. Connect your Firebase project to sync cloud collections.'}
          </p>
        </div>

        <button
          onClick={() => setIsFirebaseConfigModalOpen(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition shrink-0"
        >
          {isConnected ? 'View Firebase Keys' : 'Configure Firebase'}
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        
        {/* Company Identity */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>1. Employer Details & Payslip Header</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Entity / Company Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Display Name
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Head Office Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company PAN</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Finance Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Statutory Payroll Policies */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>2. Statutory Deduction Slabs (PF, ESI, Professional Tax)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provident Fund (PF Rate %)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={formData.pfRate}
                  onChange={(e) => setFormData({ ...formData, pfRate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard 12% on Basic Pay</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ESI Employee Rate (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  value={formData.esiRate}
                  onChange={(e) => setFormData({ ...formData, esiRate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard 0.75% on Gross</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Tax (₹)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={formData.professionalTax}
                  onChange={(e) => setFormData({ ...formData, professionalTax: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">₹</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Standard ₹200 / month</span>
            </div>
          </div>
        </div>

        {/* Shift Timings & Attendance Rules */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#1b3b6f]" />
            <span>3. Shift Timings, Grace Period & Half-Day Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift In-Time
              </label>
              <input
                type="time"
                value={formData.shiftStartTime}
                onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default 09:30 AM</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift Out-Time
              </label>
              <input
                type="time"
                value={formData.shiftEndTime}
                onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default 06:30 PM</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Late Arrival Grace Period
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.shiftGracePeriodMins}
                  onChange={(e) => setFormData({ ...formData, shiftGracePeriodMins: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">min</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Allowed late check-in without penalty</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Half-Day Min Threshold
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="8"
                  value={formData.shiftHalfDayThresholdHours}
                  onChange={(e) => setFormData({ ...formData, shiftHalfDayThresholdHours: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">hours</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Minimum working duration for 0.5 day</span>
            </div>
          </div>
        </div>

        {/* 4. Office Geofence & Location Perimeter */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>4. Office Geofence & Location Perimeter</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure GPS perimeter to prevent remote clock-in fraud and guarantee physical presence.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDetectOfficeGps}
              disabled={isDetectingGps}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Capturing Device GPS...' : 'Detect My Office Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office / Site Registered Physical Address
              </label>
              <input
                type="text"
                value={formData.geofenceAddress}
                onChange={(e) => setFormData({ ...formData, geofenceAddress: e.target.value })}
                placeholder="e.g. DLF Cyber City, Building 10, Tower B, Gurugram"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Latitude (°N)
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.geofenceLat}
                onChange={(e) => setFormData({ ...formData, geofenceLat: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">e.g. 28.495042</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office Longitude (°E)
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.geofenceLng}
                onChange={(e) => setFormData({ ...formData, geofenceLng: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">e.g. 77.089531</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Geofence Perimeter Radius
              </label>
              <select
                value={formData.geofenceRadius}
                onChange={(e) => setFormData({ ...formData, geofenceRadius: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="50">50 meters (Single Cabin / Small Room)</option>
                <option value="100">100 meters (Standard Commercial Building)</option>
                <option value="200">200 meters (Corporate Campus / Warehouse)</option>
                <option value="500">500 meters (Industrial Estate / Logistics Hub)</option>
                <option value="1000">1,000 meters (1 km Wide Perimeter)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">Max distance allowed from office coordinates</span>
            </div>
          </div>

          {/* Strict Geofence Enforcement Toggle */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-extrabold text-xs tracking-wider uppercase text-slate-200">
                  Strict Geofence Attendance Enforcement
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  formData.geofenceStrict ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {formData.geofenceStrict ? 'Strict Mode (Locked)' : 'Flexible Field Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                {formData.geofenceStrict
                  ? 'Workers outside the designated perimeter are strictly blocked from clocking in.'
                  : 'Workers outside the perimeter can clock in, but their record is explicitly tagged as a Field Punch with real coordinates.'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.geofenceStrict}
                onChange={(e) => setFormData({ ...formData, geofenceStrict: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/25 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
