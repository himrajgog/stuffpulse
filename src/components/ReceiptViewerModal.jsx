// Receipt Image Viewer Modal
import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReceiptViewerModal = () => {
  const { receiptPreviewUrl, setReceiptPreviewUrl } = useApp();

  if (!receiptPreviewUrl) return null;

  return (
    <div
      onClick={() => setReceiptPreviewUrl(null)}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Attached Expense Bill / Receipt Proof
          </span>
          <button
            onClick={() => setReceiptPreviewUrl(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
          <img
            src={receiptPreviewUrl}
            alt="Expense Bill"
            className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
          />
        </div>

        <div className="p-3 bg-white border-t border-slate-100 flex justify-end gap-2">
          <a
            href={receiptPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Original</span>
          </a>
          <button
            onClick={() => setReceiptPreviewUrl(null)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
