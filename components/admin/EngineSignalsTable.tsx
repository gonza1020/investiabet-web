"use client";

import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { formatSignalScore } from "@/lib/engine/market-kind";
import type { EngineSignal, EngineSignalStatus } from "@/lib/types/domain";
import { fmtDate } from "@/lib/format";

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

interface EngineSignalsTableProps {
  items: EngineSignal[];
  onCorrect: (signal: EngineSignal) => void;
}

export function EngineSignalsTable({ items, onCorrect }: EngineSignalsTableProps) {
  if (!items.length) {
    return (
      <div className="overflow-x-auto">
        <table className="admin-table">
          <tbody>
            <tr>
              <td colSpan={10} className="py-6 text-center text-[var(--text2)]">
                Sin señales todavía. Se persisten desde el próximo escaneo.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Evento</th>
            <th>Pick</th>
            <th>Cuota</th>
            <th>Edge/Conf.</th>
            <th>Escaneado</th>
            <th>Estado</th>
            <th>Marcador</th>
            <th>PnL ref.</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => {
            const score = formatSignalScore(x);
            const pnlColor =
              x.pnl == null ? "var(--text2)" : x.pnl >= 0 ? "var(--teal)" : "var(--red)";
            const pnlText =
              x.pnl != null ? `${x.pnl >= 0 ? "+" : ""}${Math.round(x.pnl)}` : "—";

            return (
              <tr key={x.id}>
                <td>
                  {x.signal_type === "gold" ? (
                    <Badge variant="violet">Gold</Badge>
                  ) : (
                    <Badge variant="teal">Sure</Badge>
                  )}
                </td>
                <td className="max-w-[180px] text-xs">{x.event || "—"}</td>
                <td className="text-xs">
                  {x.pick_team || "—"}
                  {x.market && (
                    <>
                      <br />
                      <span className="text-[10px] text-[var(--text2)]">{x.market}</span>
                    </>
                  )}
                </td>
                <td>{fmtOdds(x.odds_ref)}</td>
                <td>{edgeOrConfidence(x)}</td>
                <td className="text-[11px] text-[var(--text2)]">
                  {fmtDate(x.scanned_at)}
                  {x.last_seen_at && (
                    <>
                      <br />
                      <span className="text-[10px]">visto {fmtDate(x.last_seen_at)}</span>
                    </>
                  )}
                </td>
                <td>
                  <Badge variant={statusBadge[x.status] ?? "gray"}>
                    {statusLabel[x.status] ?? x.status}
                  </Badge>
                  {x.status === "expired" && x.result_reason && (
                    <>
                      <br />
                      <span className="text-[10px] text-[var(--text2)]">
                        {x.result_reason}
                      </span>
                    </>
                  )}
                </td>
                <td className="text-xs">{score}</td>
                <td className="text-xs" style={{ color: pnlColor }}>
                  {pnlText}
                </td>
                <td>
                  {x.status !== "expired" ? (
                    <button
                      type="button"
                      className="btn px-2 py-1 text-[11px]"
                      onClick={() => onCorrect(x)}
                    >
                      Corregir
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
