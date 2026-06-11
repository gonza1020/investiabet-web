"use client";

import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="premium-copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

export function PremiumPaymentMethods() {
  const [active, setActive] = useState<"mp" | "ap">("mp");

  return (
    <div className="premium-metodos">
      <div
        className={`premium-metodo${active === "mp" ? " active" : ""}`}
        onClick={() => setActive("mp")}
        onKeyDown={(e) => e.key === "Enter" && setActive("mp")}
        role="button"
        tabIndex={0}
      >
        <div className="premium-metodo-header">
          <div className="premium-metodo-name">
            💙 Mercado Pago <span className="badge b-teal">Recomendado</span>
          </div>
          <span className="text-[var(--text2)]">{active === "mp" ? "▲" : "▼"}</span>
        </div>
        {active === "mp" && (
          <div className="premium-metodo-body">
            <div className="premium-dato-row">
              <span className="premium-dato-label">Alias</span>
              <div className="flex items-center gap-2">
                <span className="premium-dato-val">franvons</span>
                <CopyButton text="franvons" />
              </div>
            </div>
            <div className="premium-steps">
              <div className="premium-step"><div className="premium-step-n">1</div><span>Abrí Mercado Pago → Enviar dinero</span></div>
              <div className="premium-step"><div className="premium-step-n">2</div><span>Buscá el alias <strong>franvons</strong></span></div>
              <div className="premium-step"><div className="premium-step-n">3</div><span>Enviá el equivalente a $15 USD con asunto <strong>&quot;InvestiaBet Premium&quot;</strong></span></div>
              <div className="premium-step"><div className="premium-step-n">4</div><span>Mandá el comprobante a <strong style={{ color: "var(--teal)" }}>@Stakegoldia_bot</strong> en Telegram</span></div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`premium-metodo${active === "ap" ? " active" : ""}`}
        onClick={() => setActive("ap")}
        onKeyDown={(e) => e.key === "Enter" && setActive("ap")}
        role="button"
        tabIndex={0}
      >
        <div className="premium-metodo-header">
          <div className="premium-metodo-name">💜 AstroPay</div>
          <span className="text-[var(--text2)]">{active === "ap" ? "▲" : "▼"}</span>
        </div>
        {active === "ap" && (
          <div className="premium-metodo-body">
            <div className="premium-dato-row">
              <span className="premium-dato-label">Número de cuenta</span>
              <div className="flex items-center gap-2">
                <span className="premium-dato-val text-xs">0000177500098073799130</span>
                <CopyButton text="0000177500098073799130" />
              </div>
            </div>
            <div className="premium-steps">
              <div className="premium-step"><div className="premium-step-n">1</div><span>Abrí tu app de AstroPay</span></div>
              <div className="premium-step"><div className="premium-step-n">2</div><span>Enviá <strong>$15 USD</strong> al número de cuenta indicado</span></div>
              <div className="premium-step"><div className="premium-step-n">3</div><span>Mandá el comprobante a <strong style={{ color: "var(--teal)" }}>@Stakegoldia_bot</strong></span></div>
            </div>
          </div>
        )}
      </div>

      <div className="premium-metodo opacity-50" style={{ cursor: "default" }}>
        <div className="premium-metodo-header">
          <div className="premium-metodo-name">
            🔶 Crypto (USDT) <span className="badge b-gray">Próximamente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
