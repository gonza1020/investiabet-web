"use client";

import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { formatSignalScore } from "@/lib/engine/market-kind";
import { fmtDate } from "@/lib/format";
import type { EngineSignal, EngineSignalStatus } from "@/lib/types/domain";

const statusBadge: Record<EngineSignalStatus, BadgeVariant> = {
  pending: "amber",
  won: "teal",
  lost: "red",
  push: "gray",
  void: "gray",
  expired: "gray",
};

const statusLabel: Record<EngineSignalStatus, string> = {
  pending: "Pendiente",
  won: "Ganado",
  lost: "Perdido",
  push: "Push",
  void: "Void",
  expired: "Expirada",
};

function fmtOdds(n?: number) {
  return n != null && n > 0 ? `@${Number(n).toFixed(2)}` : "—";
}

function edgeOrConfidence(signal: EngineSignal) {
  if (signal.signal_type === "gold") {
    return signal.edge != null ? `${(signal.edge * 100).toFixed(1)}%` : "—";
  }
  return signal.confidence_pct != null ? `${signal.confidence_pct}%` : "—";
}

interface EngineSignalCardProps {
  signal: EngineSignal;
  onCorrect: (signal: EngineSignal) => void;
}

export function EngineSignalCard({ signal, onCorrect }: EngineSignalCardProps) {
  const score = formatSignalScore(signal);
  const hasHypo = signal.status === "expired" && signal.hypothetical_status != null;
  const displayPnl = hasHypo ? signal.hypothetical_pnl : signal.pnl;
  const pnlColor =
    displayPnl == null ? "var(--text2)" : displayPnl >= 0 ? "var(--teal)" : "var(--red)";
  const pnlText =
    displayPnl != null ? `${displayPnl >= 0 ? "+" : ""}${Math.round(displayPnl)}` : "—";

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {signal.signal_type === "gold" ? (
          <Badge variant="violet">Gold</Badge>
        ) : (
          <Badge variant="teal">Sure</Badge>
        )}
        <Badge variant={statusBadge[signal.status] ?? "gray"}>
          {statusLabel[signal.status] ?? signal.status}
        </Badge>
      </div>

      <div className="mb-2 text-sm font-medium">{signal.event || "—"}</div>
      <div className="mb-3 text-xs text-on-surface-variant">
        {signal.pick_team || "—"}
        {signal.market && <> · {signal.market}</>}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Cuota</div>
          <div>{fmtOdds(signal.odds_ref)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Edge/Conf.</div>
          <div>{edgeOrConfidence(signal)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Marcador</div>
          <div>{score}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">PnL ref.</div>
          <div style={{ color: pnlColor }}>{pnlText}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] uppercase text-on-surface-variant">Escaneado</div>
          <div className="text-xs">{fmtDate(signal.scanned_at)}</div>
        </div>
      </div>

      {signal.status !== "expired" && (
        <button
          type="button"
          className="btn min-h-11 w-full text-[11px]"
          onClick={() => onCorrect(signal)}
        >
          Corregir
        </button>
      )}
    </div>
  );
}
