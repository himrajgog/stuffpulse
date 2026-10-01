// Firebase Configuration & Status Modal
import React, { useState } from 'react';
import { X, Cloud, CloudOff, Save, CheckCircle, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStoredFirebaseConfig, initFirebase, isFirebaseActive } from '../services/firebase';

export const FirebaseConfigModal = () => {
  const { isFirebaseConfigModalOpen, setIsFirebaseConfigModalOpen, showToast } = useApp();

  const [config, setConfig] = useState(() => getStoredFirebaseConfig());
  const [testing, setTesting] = useState(false);
  const isConnected = isFirebaseActive();

  if (!isFirebaseConfigModalOpen) return null;

  const handleSaveAndConnect = (e) => {
    e.preventDefault();
    setTesting(true);
    try {
      localStorage.setItem('workpulse_firebase_config', JSON.stringify(config));
      const result = initFirebase(config);
      if (result.success) {
        showToast('Connected to Firebase Firestore & Cloud Storage successfully!', 'success');
      } else {
        showToast(`Firebase initialized with config (${result.reason || 'ready for cloud data'})`, 'info');
      }
      setIsFirebaseConfigModalOpen(false);
    } catch (err) {
      showToast('Firebase connection failed: ' + err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleResetToLocal = () => {
    localStorage.removeItem('workpulse_firebase_config');
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
    showToast('Operating in high-speed Local-First Mode (LocalStorage persistence)', 'info');
    setIsFirebaseConfigModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isConnected ? 'bg-emerald-600' : 'bg-amber-500'} text-white`}>
              {isConnected ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">Firebase Cloud Storage & Database</h2>
              <p className="text-xs text-slate-400">
                Firestore Data Sync • Cloud Storage Receipts • Firebase Auth
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFirebaseConfigModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveAndConnect} className="p-6 space-y-4">
          
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold">
                Current Status: {isConnected ? 'Connected to Firebase Firestore' : 'Operating in Local-First Demo Mode'}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90">
                {isConnected
                  ? 'All changes in employees, attendance punches, expense claims, and loan EMIs sync directly to your Firestore collections and Storage bucket.'
                  : 'You can use the entire application right away with rich sample data! To sync with your own cloud database, paste your Firebase web config keys below.'}
              </p>
            </div>
          </div>

          {/* Config Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  API Key (apiKey)
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Project ID (projectId)
                </label>
                <input
                  type="text"
                  placeholder="my-hisaab-hr"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  placeholder="project-id.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  placeholder="project-id.appspot.com"
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                App ID (appId)
              </label>
              <input
                type="text"
                placeholder="1:123456789:web:abcdef..."
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToLocal}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Clear & Use Local Storage
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFirebaseConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={testing}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save & Connect</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
