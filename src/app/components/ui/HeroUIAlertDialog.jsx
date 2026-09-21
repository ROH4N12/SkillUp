import React, { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Trash2, RotateCcw, Info, CheckCircle2 } from "lucide-react";

// Context to share open/close state among compound components
const AlertDialogContext = createContext(null);

export function AlertDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (next) => {
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <AlertDialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ children, className = "", onClick, ...props }) {
  const { setIsOpen } = useContext(AlertDialogContext);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          setIsOpen(true);
        }
      }}
      className={`cursor-pointer select-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertDialogBackdrop({ children, className = "" }) {
  const { isOpen, setIsOpen } = useContext(AlertDialogContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={() => setIsOpen(false)}
      className={`fixed inset-0 z-[9999] bg-black/50 dark:bg-black/70 transition-all duration-300 flex items-center justify-center p-4 animate-in fade-in ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}

function AlertDialogContainer({ children, className = "" }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-full max-w-md ${className}`}
    >
      {children}
    </div>
  );
}

function AlertDialogDialog({ children, className = "" }) {
  return (
    <div
      className={`relative glass-default rounded-3xl border border-white/70 dark:border-white/10 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-all duration-300 transform scale-100 animate-in zoom-in-95 ${className}`}
    >
      {children}
    </div>
  );
}

function AlertDialogCloseTrigger({ className = "" }) {
  const { setIsOpen } = useContext(AlertDialogContext);

  return (
    <button
      onClick={() => setIsOpen(false)}
      aria-label="Close dialog"
      className={`absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none ${className}`}
    >
      <X className="w-4 h-4" />
    </button>
  );
}

function AlertDialogHeader({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-3.5 mb-3 ${className}`}>
      {children}
    </div>
  );
}

function AlertDialogIcon({
  children,
  status = "danger", // "danger" | "warning" | "info" | "success"
  className = "",
}) {
  const statusStyles = {
    danger: "bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50",
    warning: "bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50",
    info: "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50",
    success: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50",
  };

  const selectedStyle = statusStyles[status] || statusStyles.danger;

  return (
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${selectedStyle} ${className}`}
    >
      {children}
    </div>
  );
}

function AlertDialogHeading({ children, className = "" }) {
  return (
    <h3
      className={`text-lg font-bold text-gray-900 dark:text-white tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

function AlertDialogBody({ children, className = "" }) {
  return (
    <div
      className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-6 ${className}`}
    >
      {children}
    </div>
  );
}

function AlertDialogFooter({ children, className = "" }) {
  const { setIsOpen } = useContext(AlertDialogContext);

  // Clone children to attach slot="close" auto-closing if specified
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.props.slot === "close") {
      return React.cloneElement(child, {
        onClick: (e) => {
          child.props.onClick?.(e);
          if (!e.defaultPrevented) {
            setIsOpen(false);
          }
        },
      });
    }
    return child;
  });

  return (
    <div className={`flex items-center justify-end gap-2.5 pt-2 ${className}`}>
      {enhancedChildren}
    </div>
  );
}

// Attach sub-components to AlertDialog
AlertDialog.Trigger = AlertDialogTrigger;
AlertDialog.Backdrop = AlertDialogBackdrop;
AlertDialog.Container = AlertDialogContainer;
AlertDialog.Dialog = AlertDialogDialog;
AlertDialog.CloseTrigger = AlertDialogCloseTrigger;
AlertDialog.Header = AlertDialogHeader;
AlertDialog.Icon = AlertDialogIcon;
AlertDialog.Heading = AlertDialogHeading;
AlertDialog.Body = AlertDialogBody;
AlertDialog.Footer = AlertDialogFooter;

/**
 * Convenient standalone ConfirmAlertDialog component
 */
export function ConfirmAlertDialog({
  open,
  onOpenChange,
  title = "Confirm Action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  status = "danger",
  icon,
  loading = false,
  trigger,
}) {
  const defaultIcons = {
    danger: <Trash2 className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
  };

  const actionIcon = icon || defaultIcons[status] || defaultIcons.danger;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>}
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[420px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status={status}>{actionIcon}</AlertDialog.Icon>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>{description}</AlertDialog.Body>
            <AlertDialog.Footer>
              <button
                type="button"
                slot="close"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                slot="close"
                disabled={loading}
                onClick={async (e) => {
                  if (onConfirm) {
                    await onConfirm(e);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 ${
                  status === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : status === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                }`}
              >
                {confirmText}
              </button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

export default AlertDialog;
