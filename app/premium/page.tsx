import Link from "next/link";
import { PremiumPaymentMethods } from "@/components/premium/PremiumPaymentMethods";

export default function PremiumPage() {
  return (
    <div className="premium-page">
      <div className="premium-container">
        <div className="premium-logo">📈 InvestiaBet</div>

        <div className="premium-hero">
          <div className="mb-2 text-sm text-[var(--text2)]">Plan Premium — Acceso completo</div>
          <div className="premium-precio">$30 USD</div>
          <div className="premium-precio-sub">por mes · o $15 USD precio fundadores</div>
          <div className="premium-features">
            <div className="premium-feat"><span className="premium-feat-icon">⭐</span>Gold Tips diarios</div>
            <div className="premium-feat"><span className="premium-feat-icon">🔒</span>Sure Bets ≥85%</div>
            <div className="premium-feat"><span className="premium-feat-icon">📊</span>ROI y stats reales</div>
            <div className="premium-feat"><span className="premium-feat-icon">🔴</span>Picks en vivo</div>
            <div className="premium-feat"><span className="premium-feat-icon">♾️</span>Acceso ilimitado</div>
          </div>
        </div>

        <div className="premium-notice">
          <strong>Precio especial fundadores:</strong> $15 USD/mes para los primeros 20 users.
          <br />
          Una vez que confirmes el pago te activamos el acceso en menos de <strong>1 hora</strong>.
        </div>

        <div className="mb-3 text-[13px] font-medium text-[var(--text2)]">Elegí cómo pagar:</div>
        <PremiumPaymentMethods />

        <div className="premium-footer-note">
          ✅ Una vez que confirmemos tu pago por Telegram, activamos tu plan en menos de 1 hora.
          <br />
          ✅ Acceso completo por 30 días desde la activación.
          <br />
          ✅ Podés renovar antes de que venza para no perder los picks.
        </div>

        <Link href="/" className="premium-btn-back">
          ← Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
