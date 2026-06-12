"use client";

import { Modal } from "@/components/ui/Modal";
import { useEffect, useState } from "react";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "¿Confirmar?",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError("");
    }
  }, [open]);

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const confirmClass = variant === "danger" ? "btn flex-1" : "btn-grad flex-1";
  const confirmStyle =
    variant === "danger"
      ? { color: "var(--red)", borderColor: "rgba(239,68,68,.4)" }
      : undefined;

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose}>
      <div
        className="mb-3 text-base font-semibold"
        style={{ color: variant === "danger" ? "var(--red)" : "var(--teal)" }}
      >
        {title}
      </div>
      <p className="mb-5 text-sm leading-relaxed text-on-surface-variant">{message}</p>
      <div className="flex gap-2">
        <button type="button" className="btn flex-1" disabled={loading} onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={confirmClass}
          style={confirmStyle}
          disabled={loading}
          onClick={handleConfirm}
        >
          {loading ? "Procesando…" : confirmLabel}
        </button>
      </div>
      {error && <div className="mt-3 text-center text-xs text-[var(--red)]">{error}</div>}
    </Modal>
  );
}
