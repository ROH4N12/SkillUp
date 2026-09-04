import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  position = "top",
}) {
  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center p-4 overflow-y-auto ${
        position === "top"
          ? "items-start pt-6 sm:pt-10 md:pt-12"
          : "items-center"
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm modal-backdrop-enter"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={`
          relative w-full ${maxWidth} bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
          border border-gray-200 dark:border-slate-700 p-6 z-10 modal-panel-enter mb-8
        `}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
