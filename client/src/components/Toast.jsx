import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const typeConfig = {
    error: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/90 text-rose-100',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      titleColor: 'text-rose-200',
    },
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/90 text-emerald-100',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
      titleColor: 'text-emerald-200',
    },
    info: {
      border: 'border-sky-500/30',
      bg: 'bg-slate-900/95 text-slate-100',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
      titleColor: 'text-sky-200',
    },
  };

  const style = typeConfig[toast.type] || typeConfig.error;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${style.bg} ${style.border}`}>
        {style.icon}
        <div className="flex-1 text-sm">
          {toast.title && <h4 className={`font-semibold mb-0.5 ${style.titleColor}`}>{toast.title}</h4>}
          <p className="text-slate-300 leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
