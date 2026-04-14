"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error";

interface ToastProps {
  open: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  open,
  type,
  message,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-4 right-4 z-[60] flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-body-sm font-medium max-w-xs w-full animate-in slide-in-from-bottom-4 duration-300 ease-spring bg-surface-raised border-l-4",
        type === "success"
          ? "border-l-success"
          : "border-l-danger"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
      )}
      <span className="flex-1 text-foreground">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 p-0.5 rounded text-foreground-muted transition-colors duration-150 ease-snappy hover:text-foreground flex-shrink-0"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Convenience hook for managing a single toast notification */
export function useToast() {
  const [state, setState] = useState<{
    open: boolean;
    type: ToastType;
    message: string;
  }>({ open: false, type: "success", message: "" });

  const showToast = useCallback((type: ToastType, message: string) => {
    setState({ open: true, type, message });
  }, []);

  const closeToast = useCallback(
    () => setState((s) => ({ ...s, open: false })),
    []
  );

  return { toastState: state, showToast, closeToast };
}
