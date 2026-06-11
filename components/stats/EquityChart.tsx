"use client";

import { fmtUSD } from "@/lib/format";
import type { Pick } from "@/lib/types/domain";
import { useMemo } from "react";

interface EquityChartProps {
  history: Pick[];
}

export function EquityChart({ history }: EquityChartProps) {
  const { svg, label, empty } = useMemo(() => {
    const resolved = history
      .filter((p) => p.status && p.status !== "pending" && p.pnl != null)
      .slice()
      .sort(
        (a, b) =>
          new Date(a.resulted_at ?? a.placed_at ?? 0).getTime() -
          new Date(b.resulted_at ?? b.placed_at ?? 0).getTime(),
      );

    if (resolved.length < 2) {
      return { empty: true, svg: null, label: "" };
    }

    let cum = 0;
    const pts = [0];
    resolved.forEach((p) => {
      cum += p.pnl ?? 0;
      pts.push(cum);
    });

    const min = Math.min(...pts, 0);
    const max = Math.max(...pts, 0);
    const range = max - min || 1;
    const W = 1000;
    const H = 280;
    const pad = 10;

    const coords = pts.map((v, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - pad - ((v - min) / range) * (H - 2 * pad);
      return [x, y] as const;
    });

    const line = coords.map((c, i) => `${i ? "L" : "M"}${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(" ");
    const area = `${line} L${W},${H} L0,${H} Z`;
    const color = cum >= 0 ? "#7dffa2" : "#ff9b9b";
    const zeroY = H - pad - ((0 - min) / range) * (H - 2 * pad);

    const svg = (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[280px] w-full">
        <defs>
          <linearGradient id="eqg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" x2={W} y1={zeroY.toFixed(1)} y2={zeroY.toFixed(1)} stroke="#1c2431" strokeWidth="1" strokeDasharray="4 4" />
        <path d={area} fill="url(#eqg)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );

    return {
      empty: false,
      svg,
      label: `P&L acumulado: ${fmtUSD(cum, "ARS", true)} · ${resolved.length} apuestas`,
    };
  }, [history]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-headline-md text-headline-md">Evolución del capital</h3>
        {!empty && (
          <span className="font-data-label text-data-label text-on-surface-variant">{label}</span>
        )}
      </div>
      {empty ? (
        <div className="empty">
          <span className="empty-icon">📈</span>
          Necesitás al menos 2 apuestas resueltas para ver la curva.
        </div>
      ) : (
        svg
      )}
    </>
  );
}
