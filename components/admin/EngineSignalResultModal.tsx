"use client";

import { Modal } from "@/components/ui/Modal";
import { useOverrideEngineSignal } from "@/hooks/use-engine-signals";
import { suggestEngineSignalResult } from "@/lib/api/admin";
import {
  detectMarketKind,
  marketKindShowsScores,
  marketKindSupportsSuggestion,
  scoreLabelsForSport,
} from "@/lib/engine/market-kind";
import type { EngineSignal, EngineSignalStatus } from "@/lib/types/domain";
import { useToast } from "@/providers/toast-provider";
import { useCallback, useEffect, useRef, useState } from "react";

const RESOLVED: EngineSignalStatus[] = ["won", "lost", "push", "void"];

const statusLabel: Record<string, string> = {
  won: "Ganado",
  lost: "Perdido",
  push: "Push",
  void: "Void",
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
  const overrideMutation = useOverrideEngineSignal();

  const [status, setStatus] = useState<EngineSignalStatus>("won");
  const [scoreHome, setScoreHome] = useState("");
  const [scoreAway, setScoreAway] = useState("");
  const [reason, setReason] = useState("");
  const [suggestHint, setSuggestHint] = useState("");
  const [suggestTone, setSuggestTone] = useState<"teal" | "amber" | "muted">(
    "teal",
  );
  const statusManualRef = useRef(false);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const marketKind = signal ? detectMarketKind(signal.market) : "h2h";
  const showScores = marketKindShowsScores(marketKind);
  const labels = scoreLabelsForSport(signal?.sport);

  useEffect(() => {
    if (!open || !signal) return;
    statusManualRef.current = false;
    setSuggestHint("");
    setStatus(
      RESOLVED.includes(signal.status as EngineSignalStatus)
        ? (signal.status as EngineSignalStatus)
        : "won",
    );
    setScoreHome(
      signal.score_home != null ? String(signal.score_home) : "",
    );
    setScoreAway(
      signal.score_away != null ? String(signal.score_away) : "",
    );
    setReason("");
  }, [open, signal]);

  const fetchSuggestion = useCallback(
    async (sh: number, sa: number) => {
      if (!signal || !marketKindSupportsSuggestion(marketKind)) return;
      try {
        const d = await suggestEngineSignalResult(signal.id, {
          score_home: sh,
          score_away: sa,
        });
        if (!d.ok) {
          setSuggestHint(d.error ?? "No se pudo sugerir");
          setSuggestTone("amber");
          return;
        }
        const sug = d.suggested;
        const label = statusLabel[sug ?? ""] ?? sug;
        if (sug === "won" || sug === "lost" || sug === "push") {
          if (!statusManualRef.current) {
            setStatus(sug);
          }
          setSuggestTone("teal");
          setSuggestHint(
            `${statusManualRef.current ? "Sugerencia" : "Sugerido"}: ${label}${d.reason ? ` — ${d.reason}` : ""}`,
          );
        } else {
          setSuggestTone("muted");
          setSuggestHint(
            d.reason ?? "No se pudo determinar automáticamente",
          );
        }
      } catch {
        setSuggestHint("Error al obtener sugerencia");
        setSuggestTone("amber");
      }
    },
    [signal, marketKind],
  );

  const onScoreChange = (field: "home" | "away", value: string) => {
    if (field === "home") setScoreHome(value);
    else setScoreAway(value);

    const sh = field === "home" ? value : scoreHome;
    const sa = field === "away" ? value : scoreAway;
    if (sh === "" || sa === "") {
      setSuggestHint("");
      return;
    }
    const shN = parseInt(sh, 10);
    const saN = parseInt(sa, 10);
    if (isNaN(shN) || isNaN(saN) || shN < 0 || saN < 0) return;

    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(() => {
      void fetchSuggestion(shN, saN);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    };
  }, []);

  const totalHint =
    marketKind === "totals" &&
    scoreHome !== "" &&
    scoreAway !== "" &&
    !isNaN(parseInt(scoreHome, 10)) &&
    !isNaN(parseInt(scoreAway, 10))
      ? `Total: ${parseInt(scoreHome, 10) + parseInt(scoreAway, 10)}`
      : null;

  const save = async () => {
    if (!signal) return;

    const body: {
      status: EngineSignalStatus;
      score_home?: number;
      score_away?: number;
      reason?: string;
    } = {
      status,
      reason: reason.trim() || undefined,
    };

    if (scoreHome !== "" && scoreAway !== "") {
      body.score_home = parseInt(scoreHome, 10);
      body.score_away = parseInt(scoreAway, 10);
    }

    try {
      const d = await overrideMutation.mutateAsync({ id: signal.id, ...body });
      if (d.ok) {
        showToast("✓ Resultado actualizado");
        onClose();
      } else {
        showToast(`✗ ${d.error ?? "Error"}`, true);
      }
    } catch {
      showToast("✗ Error al guardar", true);
    }
  };

  const eventLabel = signal?.event || (signal ? `Señal #${signal.id}` : "");

  return (
    <Modal open={open} onClose={onClose} maxWidth="28rem">
      <h3 className="mb-4 font-headline-md text-headline-md">Corregir resultado</h3>
      <p className="mb-2 text-sm text-on-surface-variant">{eventLabel}</p>

      {signal && (
        <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container-high p-3 text-xs text-on-surface-variant">
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
      )}

      <div className="field mb-3">
        <label>Estado</label>
        <select
          className="w-full"
          value={status}
          onChange={(e) => {
            statusManualRef.current = true;
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
          <div className="field">
            <label>{labels.home}</label>
            <input
              type="number"
              min={0}
              value={scoreHome}
              onChange={(e) => onScoreChange("home", e.target.value)}
            />
          </div>
          <div className="field">
            <label>{labels.away}</label>
            <input
              type="number"
              min={0}
              value={scoreAway}
              onChange={(e) => onScoreChange("away", e.target.value)}
            />
          </div>
        </div>
      )}

      {totalHint && (
        <p className="mb-2 text-xs text-on-surface-variant">{totalHint}</p>
      )}

      {suggestHint && (
        <p
          className="mb-3 text-xs"
          style={{
            color:
              suggestTone === "teal"
                ? "var(--teal)"
                : suggestTone === "amber"
                  ? "var(--amber)"
                  : "var(--text2)",
          }}
        >
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

      <div className="flex justify-end gap-3">
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-grad"
          disabled={overrideMutation.isPending}
          onClick={save}
        >
          {overrideMutation.isPending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}
