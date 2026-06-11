"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastState = { text: string; error: boolean } | null;

interface ToastContextValue {
  showToast: (text: string, error?: boolean) => void;
  toast: ToastState;
  clearToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const clearToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((text: string, error = false) => {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const value = useMemo(
    () => ({ showToast, toast, clearToast }),
    [showToast, toast, clearToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`app-shell-toast show${toast.error ? " app-shell-toast-err" : ""}`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
