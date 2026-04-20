"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastState {
  open: boolean;
  type: "success" | "error";
  message: string;
}

export function useToast() {
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    type: "success",
    message: "",
  });

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToastState({ open: true, type, message });
    },
    []
  );

  const closeToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, open: false }));
  }, []);

  return { toastState, showToast, closeToast };
}

interface ToastProps {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
  children?: ReactNode;
}

export function Toast({ open, type, message, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-lg bg-surface-raised px-4 py-3 shadow-lg border-l-4",
        "animate-in slide-in-from-bottom-4 fade-in duration-300 ease-spring",
        type === "success" ? "border-l-success" : "border-l-danger"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-danger" />
      )}
      <p className="text-body-sm text-foreground">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 shrink-0 rounded-md p-0.5 text-foreground-muted transition-colors duration-150 ease-snappy hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Cerrar"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}
