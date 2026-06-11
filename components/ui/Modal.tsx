"use client";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  children,
  maxWidth = "min(400px, calc(100vw - 32px))",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="app-shell-modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="app-shell-modal" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
