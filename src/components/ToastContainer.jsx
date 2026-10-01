// Toast Notification System
import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 text-white border-slate-700';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-400';

        if (toast.type === 'error') {
          bg = 'bg-rose-900 text-white border-rose-700';
          Icon = AlertTriangle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900 text-white border-amber-700';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'info') {
          bg = 'bg-slate-900 text-white border-slate-700';
          Icon = Info;
          iconColor = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 px-4 rounded-2xl shadow-xl border ${bg} text-xs font-medium animate-in slide-in-from-right-10 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
