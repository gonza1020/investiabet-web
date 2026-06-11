"use client";

import { Modal } from "@/components/ui/Modal";

interface HowtoModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowtoModal({ open, onClose }: HowtoModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="480px">
      <div className="mb-3.5 text-base font-semibold text-[var(--teal)]">
        🚀 Cómo usar la app a tu favor
      </div>
      <div className="mb-1.5 text-[13px] font-semibold">💰 Configurá tu capital</div>
      <p className="mb-4 text-[13px] leading-relaxed text-[var(--text2)]">
        En <strong>Perfil</strong> cargá tu <strong>capital</strong> (solo plata que
        puedas arriesgar) y tu <strong>perfil de riesgo</strong>. Todos los montos
        sugeridos salen de ahí. Actualizalo al ganar/perder para mantener las
        apuestas proporcionales.
      </p>
      <div className="mb-1.5 text-[13px] font-semibold">✅ Paso a paso</div>
      <ol className="mb-4 list-decimal pl-[18px] text-[13px] leading-relaxed text-[var(--text2)]">
        <li>Mirá los picks (ordenados por fecha; podés cambiar a &quot;Ventaja&quot;).</li>
        <li>
          Elegí con criterio: ⭐ Gold = mejor valor, 🔒 Alta confianza = más seguro.
          No hace falta jugar todos.
        </li>
        <li>Apostá en tu casa (ej. Stake) con el monto sugerido — la app no apuesta sola.</li>
        <li>Tocá <strong>Registrar</strong> para llevar el control.</li>
        <li>Cargá el resultado al terminar: tu capital se ajusta solo.</li>
      </ol>
      <button type="button" className="btn-grad w-full" onClick={onClose}>
        Entendido
      </button>
    </Modal>
  );
}
