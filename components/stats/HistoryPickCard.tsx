"use client";

import { statusBadge, typeBadge } from "@/components/stats/stats-badges";
import { dep, fmt, fmtDate, fmtMiles } from "@/lib/format";
import type { Pick } from "@/lib/types/domain";

interface HistoryPickCardProps {
  pick: Pick;
  onEdit: (id: number, status: string, odds: number, co: number, stake: number) => void;
}

export function HistoryPickCard({ pick, onEdit }: HistoryPickCardProps) {
  const pnlColor = (pick.pnl ?? 0) >= 0 ? "var(--teal)" : "var(--red)";
  const pnlText =
    pick.pnl != null ? `${pick.pnl >= 0 ? "+" : ""}${fmtMiles(Math.abs(pick.pnl))}` : "—";

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {typeBadge(pick.type, pick.is_gold)}
            {statusBadge(pick.status)}
          </div>
          <div className="truncate text-sm font-semibold">
            {dep(pick.sport)} {pick.event}
          </div>
          <div className="mt-0.5 text-xs text-on-surface-variant">{pick.pick_team}</div>
        </div>
        <button
          type="button"
          className="btn shrink-0 text-[11px]"
          aria-label="Editar apuesta"
          onClick={() =>
            onEdit(
              pick.id as number,
              pick.status ?? "won",
              pick.odds_real ?? pick.odds_ref ?? 0,
              pick.odds_cashout ?? 0,
              pick.stake_usd ?? 0
            )
          }
        >
          ✏️
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Fecha</div>
          <div className="text-xs">{fmtDate(pick.placed_at)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Monto</div>
          <div className="font-medium text-violet">{fmtMiles(pick.stake_usd)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Cuota ref.</div>
          <div>@{fmt(pick.odds_ref, 2)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Cuota real</div>
          <div className="font-semibold text-blue">
            @{pick.odds_real ? fmt(pick.odds_real, 2) : "—"}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] uppercase text-on-surface-variant">Ganancia</div>
          <div className="text-lg font-bold" style={{ color: pnlColor }}>
            {pnlText}
          </div>
        </div>
      </div>
    </div>
  );
}
