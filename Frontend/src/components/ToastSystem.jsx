import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let toastSeed = 0;

const toneClasses = {
    success: 'border-emerald-400/30 bg-emerald-500/95 text-white shadow-emerald-950/20',
    error: 'border-rose-400/30 bg-rose-500/95 text-white shadow-rose-950/20',
    warning: 'border-amber-400/30 bg-amber-500/95 text-slate-950 shadow-amber-950/20',
    info: 'border-slate-300/30 bg-slate-950/95 text-white shadow-slate-950/20'
};

function ToastItem({ toast, onClose }) {
    return (
        <div className={`pointer-events-auto overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur-xl ${toneClasses[toast.type] || toneClasses.info}`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-current opacity-80" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-80">{toast.type}</p>
                    <p className="mt-1 text-sm font-semibold">{toast.title}</p>
                    {toast.message ? <p className="mt-1 text-sm opacity-90">{toast.message}</p> : null}
                </div>
                <button type="button" className="btn btn-ghost btn-xs text-current" onClick={() => onClose(toast.id)}>
                    ✕
                </button>
            </div>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const pushToast = useCallback((toast) => {
        const id = ++toastSeed;
        const nextToast = {
            id,
            type: toast.type || 'info',
            title: toast.title || 'Notice',
            message: toast.message || ''
        };

        setToasts((current) => [...current, nextToast]);

        const duration = toast.duration ?? 3600;
        if (duration > 0) {
            window.setTimeout(() => removeToast(id), duration);
        }

        return id;
    }, [removeToast]);

    const value = useMemo(() => ({
        pushToast,
        success: (title, message, duration) => pushToast({ type: 'success', title, message, duration }),
        error: (title, message, duration) => pushToast({ type: 'error', title, message, duration }),
        warning: (title, message, duration) => pushToast({ type: 'warning', title, message, duration }),
        info: (title, message, duration) => pushToast({ type: 'info', title, message, duration })
    }), [pushToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-9999 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    return context;
}