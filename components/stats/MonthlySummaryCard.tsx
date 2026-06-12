import { fmtMiles, fmtPct } from "@/lib/format";

interface MonthlySummaryCardProps {
  label: string;
  count: number;
  yieldPct: number;
  growthRoiPct: number;
  pnl: number;
}

export function MonthlySummaryCard({
  label,
  count,
  yieldPct,
  growthRoiPct,
  pnl,
}: MonthlySummaryCardProps) {
  const color = pnl >= 0 ? "var(--teal)" : "var(--red)";

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <div className="mb-3 capitalize text-sm font-semibold">{label}</div>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Volumen</div>
          <div>{count} picks</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Yield</div>
          <div className="font-bold" style={{ color }}>
            {fmtPct(yieldPct)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">ROI</div>
          <div className="font-bold" style={{ color }}>
            {fmtPct(growthRoiPct)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Ganancia</div>
          <div style={{ color }}>
            {pnl >= 0 ? "+" : ""}ARS {fmtMiles(Math.abs(pnl))}
          </div>
        </div>
      </div>
    </div>
  );
}
