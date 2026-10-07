import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, message, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 3600);

    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, title) => addToast("success", msg, title),
    error: (msg, title) => addToast("error", msg, title),
    info: (msg, title) => addToast("info", msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast viewport container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              toast-enter pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md
              transition-all duration-200
              ${t.type === "success" 
                ? "bg-white/95 dark:bg-slate-800/95 border-green-500/30 text-gray-900 dark:text-gray-100 shadow-green-500/5" 
                : t.type === "error"
                ? "bg-white/95 dark:bg-slate-800/95 border-red-500/30 text-gray-900 dark:text-gray-100 shadow-red-500/5"
                : "bg-white/95 dark:bg-slate-800/95 border-indigo-500/30 text-gray-900 dark:text-gray-100 shadow-indigo-500/5"
              }
            `}
          >
            {t.type === "success" && (
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {t.type === "error" && (
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            {t.type === "info" && (
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="text-sm font-semibold mb-0.5">{t.title}</p>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded -mr-1 -mt-1"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log("[Toast Success]", msg),
      error: (msg) => console.error("[Toast Error]", msg),
      info: (msg) => console.log("[Toast Info]", msg),
    };
  }
  return context;
}
