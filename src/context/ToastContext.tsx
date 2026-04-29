"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastType } from "@/components/common/Toast";

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        open={state.open}
        type={state.type}
        message={state.message}
        onClose={closeToast}
      />
    </ToastContext.Provider>
  );
}

export function useGlobalToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useGlobalToast must be used within <ToastProvider>");
  }
  return ctx;
}
