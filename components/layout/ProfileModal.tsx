"use client";

import { Modal } from "@/components/ui/Modal";
import { changePassword, updateProfile } from "@/lib/api/account";
import type { User } from "@/lib/types/domain";
import { useToast } from "@/providers/toast-provider";
import { useState } from "react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSaved: (user: User) => void;
}

export function ProfileModal({ open, onClose, user, onSaved }: ProfileModalProps) {
  const { showToast } = useToast();
  const [bankroll, setBankroll] = useState(String(user.bankroll ?? 1000000));
  const [riesgo, setRiesgo] = useState(
    ({ profesional: "aggressive" } as Record<string, string>)[user.risk_profile ?? ""] ||
      user.risk_profile ||
      "smart",
  );
  const [kelly, setKelly] = useState(
    user.kelly_fraction ? String(Math.round(user.kelly_fraction * 100)) : "",
  );
  const [maxStake, setMaxStake] = useState(
    user.max_stake_pct ? String(user.max_stake_pct * 100) : "",
  );
  const [passCurrent, setPassCurrent] = useState("");
  const [passNew, setPassNew] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setMsg("");
    setSaving(true);
    try {
      if (passCurrent || passNew) {
        if (!passCurrent || !passNew) {
          setMsg("Completá ambos campos de contraseña");
          return;
        }
        const dp = await changePassword(passCurrent, passNew);
        if (!dp.ok) {
          setMsg(dp.error || "Error al cambiar contraseña");
          return;
        }
        setPassCurrent("");
        setPassNew("");
      }

      const data: Record<string, unknown> = {
        bankroll: parseFloat(bankroll) || 1000000,
        currency: "ARS",
        risk_profile: riesgo,
      };
      if (riesgo === "pro") {
        const k = parseFloat(kelly);
        const t = parseFloat(maxStake);
        if (k) data.kelly_fraction = k / 100;
        if (t) data.max_stake_pct = t / 100;
      }

      const d = await updateProfile(data as Parameters<typeof updateProfile>[0]);
      if (d.ok) {
        onSaved({ ...user, ...(data as Partial<User>) });
        onClose();
        showToast("✓ Perfil actualizado — los montos sugeridos se recalcularon");
      } else {
        setMsg(d.error || "Error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-[18px] text-base font-semibold text-[var(--teal)]">⚙ Mi perfil</div>
      <div className="app-shell-field">
        <label>Capital para apostar (ARS)</label>
        <input
          type="number"
          min={1000}
          step={1000}
          value={bankroll}
          onChange={(e) => setBankroll(e.target.value)}
        />
        <span className="mt-1 block text-[11px] text-[var(--text3)]">
          Plata total destinada a apuestas. Los montos sugeridos se calculan sobre esto.
        </span>
      </div>
      <div className="app-shell-field">
        <label>Perfil de inversor</label>
        <select value={riesgo} onChange={(e) => setRiesgo(e.target.value)}>
          <option value="conservative">Conservador — apuestas chicas, máx. 3% del capital</option>
          <option value="smart">Equilibrado — máx. 5% del capital (recomendado)</option>
          <option value="aggressive">Agresivo — máx. 10% del capital</option>
          <option value="pro">Profesional — elegí tus propios parámetros</option>
        </select>
      </div>
      {riesgo === "pro" && (
        <div>
          <div className="app-shell-field">
            <label>Fracción de Kelly (%)</label>
            <input
              type="number"
              min={5}
              max={100}
              step={5}
              placeholder="50"
              value={kelly}
              onChange={(e) => setKelly(e.target.value)}
            />
          </div>
          <div className="app-shell-field">
            <label>Tope por apuesta (% del capital)</label>
            <input
              type="number"
              min={0.5}
              max={15}
              step={0.5}
              placeholder="5"
              value={maxStake}
              onChange={(e) => setMaxStake(e.target.value)}
            />
          </div>
        </div>
      )}
      <div className="mb-3.5 mt-4 border-t border-[var(--border)] pt-3.5">
        <div className="mb-2.5 text-xs font-medium text-[var(--text2)]">CAMBIAR CONTRASEÑA</div>
        <div className="app-shell-field">
          <label>Contraseña actual</label>
          <input
            type="password"
            placeholder="••••••••"
            value={passCurrent}
            onChange={(e) => setPassCurrent(e.target.value)}
          />
        </div>
        <div className="app-shell-field">
          <label>Nueva contraseña</label>
          <input
            type="password"
            placeholder="mínimo 6 caracteres"
            value={passNew}
            onChange={(e) => setPassNew(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-1 flex gap-2">
        <button type="button" className="btn flex-1" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn-grad flex-1" disabled={saving} onClick={save}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {msg && (
        <div
          className="mt-2 text-center text-xs"
          style={{ color: msg.includes("Error") || msg.includes("Completá") ? "var(--red)" : "var(--teal)" }}
        >
          {msg}
        </div>
      )}
    </Modal>
  );
}
