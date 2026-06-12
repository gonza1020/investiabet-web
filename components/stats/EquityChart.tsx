"use client";

import { dep, fmt, fmtDate, fmtUSD } from "@/lib/format";
import type { Pick, PickStatus } from "@/lib/types/domain";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EquityChartProps {
  history: Pick[];
}

interface ChartPoint {
  index: number;
  cumPnl: number;
  betPnl: number | null;
  dateLabel: string;
  dateFull: string;
  pick: Pick | null;
}

interface EquityTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
  activeIndex?: string | number | null;
  label?: string | number;
  chartData: ChartPoint[];
}

const POSITIVE_COLOR = "#7dffa2";
const NEGATIVE_COLOR = "#ff9b9b";

function fmtDateShort(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function statusLabel(status: PickStatus | undefined): string {
  const map: Record<PickStatus, string> = {
    pending: "Pendiente",
    won: "Ganada",
    lost: "Perdida",
    void: "Void",
    cashout: "Cashout",
  };
  return status ? map[status] : "—";
}

function buildChartData(history: Pick[]): {
  empty: boolean;
  chartData: ChartPoint[];
  color: string;
  label: string;
} {
  const resolved = history
    .filter((p) => p.status && p.status !== "pending" && p.pnl != null)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.resulted_at ?? a.placed_at ?? 0).getTime() -
        new Date(b.resulted_at ?? b.placed_at ?? 0).getTime(),
    );

  if (resolved.length < 2) {
    return { empty: true, chartData: [], color: POSITIVE_COLOR, label: "" };
  }

  const chartData: ChartPoint[] = [
    {
      index: 0,
      cumPnl: 0,
      betPnl: null,
      dateLabel: "Inicio",
      dateFull: "—",
      pick: null,
    },
  ];

  let cum = 0;
  resolved.forEach((pick, i) => {
    cum += pick.pnl ?? 0;
    const date = pick.resulted_at ?? pick.placed_at;
    chartData.push({
      index: i + 1,
      cumPnl: cum,
      betPnl: pick.pnl ?? 0,
      dateLabel: fmtDateShort(date),
      dateFull: fmtDate(date),
      pick,
    });
  });

  return {
    empty: false,
    chartData,
    color: cum >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
    label: `P&L acumulado: ${fmtUSD(cum, "ARS", true)} · ${resolved.length} apuestas`,
  };
}

function xAxisTicks(length: number): number[] {
  if (length <= 6) return Array.from({ length }, (_, i) => i);
  const steps = 5;
  const ticks = new Set<number>([0, length - 1]);
  for (let i = 1; i < steps; i++) {
    ticks.add(Math.round((i / steps) * (length - 1)));
  }
  return [...ticks].sort((a, b) => a - b);
}

function resolveActivePoint({
  activeIndex,
  label,
  payload,
  chartData,
}: EquityTooltipProps): ChartPoint | null {
  if (activeIndex != null && activeIndex !== "") {
    const idx = Number(activeIndex);
    if (!Number.isNaN(idx) && chartData[idx]) return chartData[idx];
  }

  if (label != null && label !== "") {
    const idx = Number(label);
    if (!Number.isNaN(idx) && chartData[idx]) return chartData[idx];
  }

  const nested = payload?.[0]?.payload;
  if (nested != null) return nested;

  return null;
}

function EquityTooltip(props: EquityTooltipProps) {
  const { active, chartData } = props;
  if (!active || !chartData.length) return null;

  const point = resolveActivePoint(props);
  if (!point) return null;

  const pnlColor = point.cumPnl >= 0 ? "var(--teal)" : "var(--red)";

  if (point.index === 0) {
    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-xs shadow-lg">
        <div className="font-medium text-on-surface">Punto inicial</div>
        <div className="mt-1 font-data-label text-data-label text-on-surface-variant">
          P&L acumulado:{" "}
          <span style={{ color: "var(--teal)" }}>{fmtUSD(0, "ARS", true)}</span>
        </div>
      </div>
    );
  }

  const pick = point.pick;
  if (!pick) return null;

  const betColor = (point.betPnl ?? 0) >= 0 ? "var(--teal)" : "var(--red)";
  const odds = pick.odds_real ?? pick.odds_ref;

  return (
    <div className="max-w-[240px] rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-xs shadow-lg">
      <div className="font-data-label text-data-label text-on-surface-variant">
        {point.dateFull}
      </div>
      <div className="mt-1 truncate font-medium text-on-surface">
        {dep(pick.sport)} {pick.event}
      </div>
      <div className="truncate font-data-label text-data-label text-on-surface-variant">
        {pick.pick_team}
        {odds != null ? ` · @${fmt(odds, 2)}` : ""}
      </div>
      <div className="mt-2 space-y-0.5">
        <div className="flex justify-between gap-4">
          <span className="text-on-surface-variant">Apuesta</span>
          <span className="font-medium" style={{ color: betColor }}>
            {fmtUSD(point.betPnl, "ARS", true)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-on-surface-variant">Acumulado</span>
          <span className="font-medium" style={{ color: pnlColor }}>
            {fmtUSD(point.cumPnl, "ARS", true)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-on-surface-variant">Estado</span>
          <span className="font-medium text-on-surface">
            {statusLabel(pick.status)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function EquityChart({ history }: EquityChartProps) {
  const { empty, chartData, color, label } = useMemo(
    () => buildChartData(history),
    [history],
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-headline-md text-headline-md">Evolución del capital</h3>
        {!empty && (
          <span className="font-data-label text-data-label text-on-surface-variant">
            {label}
          </span>
        )}
      </div>
      {empty ? (
        <div className="empty">
          <span className="empty-icon">📈</span>
          Necesitás al menos 2 apuestas resueltas para ver la curva.
        </div>
      ) : (
        <div
          className="h-[280px] w-full"
          aria-label="Gráfico de evolución del capital acumulado"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="eqg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="index"
                type="number"
                domain={[0, chartData.length - 1]}
                ticks={xAxisTicks(chartData.length)}
                tickFormatter={(idx) => chartData[Number(idx)]?.dateLabel ?? ""}
                interval="preserveStartEnd"
                tick={{ fill: "var(--text2)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                width={56}
                tickFormatter={(v: number) =>
                  fmtUSD(v, "ARS").replace("ARS ", "")
                }
                tick={{ fill: "var(--text2)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine
                y={0}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <Tooltip
                content={(props) => (
                  <EquityTooltip {...props} chartData={chartData} />
                )}
                cursor={{
                  stroke: "var(--text3)",
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="cumPnl"
                stroke={color}
                strokeWidth={2.5}
                fill="url(#eqg)"
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
