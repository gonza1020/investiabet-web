"use client";

import { Modal } from "@/components/ui/Modal";
import {
  overrideEngineSignalResult,
  suggestEngineSignalResult,
} from "@/lib/api/admin";
import {
  detectMarketKind,
  marketKindSupportsSuggestion,
  scoreLabelsForSport,
} from "@/lib/engine/market-kind";
import type { EngineSignal, EngineSignalStatus } from "@/lib/types/domain";
import { useToast } from "@/providers/toast-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

const RESOLVED: EngineSignalStatus[] = ["won", "lost", "push", "void"];

const statusLabel: Record<string, string> = {
  won: "Ganado",
  lost: "Perdido",
  push: "Push",
  void: "Void",
  undetermined: "Indeterminado",
};

interface EngineSignalResultModalProps {
  open: boolean;
  signal: EngineSignal | null;
  onClose: () => void;
}

export function EngineSignalResultModal({
  open,
  signal,
  onClose,
}: EngineSignalResultModalProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<EngineSignalStatus>("won");
  const [scoreHome, setScoreHome] = useState("");
  const [scoreAway, setScoreAway] = useState("");
  const [reason, setReason] = useState("");
  const [suggestHint, setSuggestHint] = useState("");
  const [suggestColor, setSuggestColor] = useState("var(--teal)");
  const [statusManual, setStatusManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const marketKind = signal ? detectMarketKind(signal.market) : "h2h";
  const showScores = marketKind !== "outright";
  const labels = scoreLabelsForSport(signal?.sport);

  useEffect(() => {
    if (!open || !signal) return;
    const initial = RESOLVED.includes(signal.status) ? signal.status : "won";
    setStatus(initial);
    setScoreHome(
      signal.score_home != null ? String(signal.score_home) : "",
    );
    setScoreAway(
      signal.score_away != null ? String(signal.score_away) : "",
    );
    setReason("");
    setSuggestHint("");
    setStatusManual(false);
    setMsg("");
  }, [open, signal]);

  useEffect(() => {
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, []);

  const fetchSuggestion = useCallback(
    async (sh: number, sa: number) => {
      if (!signal) return;
      try {
        const d = await suggestEngineSignalResult(signal.id, {
          score_home: sh,
          score_away: sa,
        });
        if (!d.ok) {
          setSuggestHint(d.error ?? "No se pudo sugerir");
          setSuggestColor("var(--amber)");
          return;
        }
        const sug = d.suggested;
        if (sug === "won" || sug === "lost" || sug === "push") {
          if (!statusManual) setStatus(sug);
          setSuggestHint(
            `${statusManual ? "Sugerencia" : "Sugerido"}: ${statusLabel[sug] ?? sug}${d.reason ? ` — ${d.reason}` : ""}`,
          );
          setSuggestColor("var(--teal)");
        } else {
          setSuggestHint(d.reason ?? "No se pudo determinar automáticamente");
          setSuggestColor("var(--text2)");
        }
      } catch {
        setSuggestHint("Error al obtener sugerencia");
        setSuggestColor("var(--amber)");
      }
    },
    [signal, statusManual],
  );

  const onScoreChange = (sh: string, sa: string) => {
    if (!marketKindSupportsSuggestion(marketKind)) return;
    if (sh === "" || sa === "") {
      setSuggestHint("");
      return;
    }
    const shN = parseInt(sh, 10);
    const saN = parseInt(sa, 10);
    if (isNaN(shN) || isNaN(saN) || shN < 0 || saN < 0) return;
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestion(shN, saN), 400);
  };

  const save = async () => {
    if (!signal) return;
    setSaving(true);
    setMsg("");
    const body: {
      status: EngineSignalStatus;
      score_home?: number;
      score_away?: number;
      reason?: string;
    } = { status };
    if (reason.trim()) body.reason = reason.trim();
    if (scoreHome !== "" && scoreAway !== "") {
      body.score_home = parseInt(scoreHome, 10);
      body.score_away = parseInt(scoreAway, 10);
    }
    const d = await overrideEngineSignalResult(signal.id, body);
    setSaving(false);
    if (d.ok) {
      showToast("✓ Resultado actualizado");
      void queryClient.invalidateQueries({
        queryKey: ["admin", "engine-signals"],
      });
      onClose();
    } else {
      setMsg(d.error ?? "Error al guardar");
    }
  };

  const totalHint =
    marketKind === "totals" && scoreHome !== "" && scoreAway !== ""
      ? `Total: ${parseInt(scoreHome, 10) + parseInt(scoreAway, 10)}`
      : "";

  if (!signal) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth="440px">
      <div className="mb-4 text-base font-semibold text-violet">
        Corregir resultado
      </div>
      <p className="mb-3 text-sm text-on-surface-variant">
        {signal.event ?? `Señal #${signal.id}`}
      </p>
      <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high p-3 text-sm">
        <strong>{signal.pick_team ?? "—"}</strong>
        {signal.market && <> · {signal.market}</>}
        {marketKind === "totals" && signal.total_point != null && (
          <>
            <br />
            Línea: <strong>{signal.total_point}</strong>
          </>
        )}
        {marketKind === "spreads" && signal.handicap_point != null && (
          <>
            <br />
            Hándicap:{" "}
            <strong>
              {signal.handicap_point >= 0 ? "+" : ""}
              {signal.handicap_point}
            </strong>
          </>
        )}
      </div>

      <div className="field mb-3">
        <label>Estado</label>
        <select
          value={status}
          onChange={(e) => {
            setStatusManual(true);
            setStatus(e.target.value as EngineSignalStatus);
          }}
        >
          <option value="won">Ganado</option>
          <option value="lost">Perdido</option>
          <option value="push">Push</option>
          <option value="void">Void</option>
        </select>
      </div>

      {showScores && (
        <div className="mb-2 flex gap-3">
          <div className="field flex-1">
            <label>{labels.home}</label>
            <input
              type="number"
              min={0}
              value={scoreHome}
              onChange={(e) => {
                setScoreHome(e.target.value);
                onScoreChange(e.target.value, scoreAway);
              }}
            />
          </div>
          <div className="field flex-1">
            <label>{labels.away}</label>
            <input
              type="number"
              min={0}
              value={scoreAway}
              onChange={(e) => {
                setScoreAway(e.target.value);
                onScoreChange(scoreHome, e.target.value);
              }}
            />
          </div>
        </div>
      )}

      {totalHint && (
        <p className="mb-2 text-xs text-on-surface-variant">{totalHint}</p>
      )}
      {suggestHint && (
        <p className="mb-3 text-xs" style={{ color: suggestColor }}>
          {suggestHint}
        </p>
      )}

      <div className="field mb-4">
        <label>Motivo (opcional)</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Corrección manual admin"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" className="btn" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-grad"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {msg && (
        <div className="mt-2 text-center text-xs text-[var(--red)]">{msg}</div>
      )}
    </Modal>
  );
}
