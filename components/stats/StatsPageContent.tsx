"use client";

import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { adjustBankroll, revertBankrollAdjustment } from "@/lib/api/account";
import {
  autoResults,
  createManualPick,
  deletePick,
  editPickResult,
  markPickResult,
} from "@/lib/api/picks";
import { dep, fmt, fmtDate, fmtMiles, fmtPct, fmtUSD } from "@/lib/format";
import type { AutoResultSuggestion, PeriodStats, Pick, StatsBreakdown, StatsResponse } from "@/lib/types/domain";
import { useInvalidateStats, useStats } from "@/hooks/use-stats";
import { useState } from "react";
import { EquityChart } from "@/components/stats/EquityChart";

type Period = "mes" | "todo";

export function StatsPageContent() {
  const { data, isLoading } = useStats();
  const invalidate = useInvalidateStats();
  const [period, setPeriod] = useState<Period>("mes");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState("deposit");
  const [manualOpen, setManualOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPickId, setEditPickId] = useState<number | null>(null);
  const [autoInfo, setAutoInfo] = useState("");
  const [suggestions, setSuggestions] = useState<AutoResultSuggestion[]>([]);
  const [autoLoading, setAutoLoading] = useState(false);

  if (isLoading || !data) {
    return (
      <main className="mx-auto max-w-[1400px] px-5 py-6">
        <div className="empty">
          <span className="material-symbols-outlined spin">progress_activity</span> Cargando estadísticas…
        </div>
      </main>
    );
  }

  const b = period === "todo" ? data.todo : data.mes;
  const pends = data.pending_picks ?? [];

  const runAutoResults = async () => {
    setAutoLoading(true);
    setAutoInfo("🔄 Buscando resultados de partidos ya terminados...");
    try {
      const d = await autoResults();
      if (!d.ok) {
        setAutoInfo(`❌ Error: ${d.error ?? "desconocido"}`);
        return;
      }
      const sugs = (d.suggestions ?? []) as AutoResultSuggestion[];
      setSuggestions(sugs);
      if (sugs.length === 0) {
        setAutoInfo(
          `ℹ️ ${d.message ?? "No hay picks evaluables todavía."}`,
        );
      } else {
        const detectados = sugs.filter((s) => s.suggested !== "undetermined").length;
        setAutoInfo(
          `🔍 ${sugs.length} pick(s) consultado(s) · ${detectados} con sugerencia`,
        );
      }
    } catch (e) {
      setAutoInfo(`❌ Error de red: ${(e as Error).message}`);
    } finally {
      setAutoLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display-lg text-display-lg text-secondary">Resumen de rendimiento</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Tu ROI, capital y distribución por deporte.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-grad" onClick={() => setManualOpen(true)}>
            + Apuesta manual
          </button>
          <select className="select" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="mes">Últimos 30 días</option>
            <option value="todo">Todo el historial</option>
          </select>
        </div>
      </div>

      <CapitalCard
        data={data}
        onDeposit={() => { setAdjustType("deposit"); setAdjustOpen(true); }}
        onWithdraw={() => { setAdjustType("withdrawal"); setAdjustOpen(true); }}
        onAdjust={() => { setAdjustType("adjustment"); setAdjustOpen(true); }}
      />

      {pends.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-headline-md text-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined text-amber">hourglass_top</span>
              Picks esperando resultado
            </h2>
            <button type="button" className="btn" disabled={autoLoading} onClick={runAutoResults}>
              {autoLoading ? "⏳ Consultando scores..." : "🔍 Auto-resultados"}
            </button>
          </div>
          {autoInfo && (
            <div className="mb-4 rounded-lg bg-surface-container-high p-3 text-sm text-on-surface-variant">
              {autoInfo}
            </div>
          )}
          {pends.map((p) => (
            <PendingPickCard
              key={p.id}
              pick={p}
              suggestion={suggestions.find((s) => s.pick_db_id === p.id)}
              onDone={() => invalidate()}
            />
          ))}
        </section>
      )}

      <KpiGrid stats={b} />
      <KpiStrip stats={b} />

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <EquityChart history={data.history ?? []} />
        </div>
        <div className="glass-card p-5">
          <h3 className="font-headline-md text-headline-md mb-5">Distribución por deporte</h3>
          <SportDist stats={b} />
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-outline-variant p-5">
            <h3 className="font-headline-md text-headline-md">Rendimiento mensual</h3>
          </div>
          <MonthlyTable history={data.history ?? []} />
        </div>
        <div className="glass-card overflow-hidden">
          <div className="border-b border-outline-variant p-5">
            <h3 className="font-headline-md text-headline-md">Movimientos de capital</h3>
          </div>
          <MovementsList
            items={data.bankroll_hist ?? []}
            onRevert={async (id) => {
              if (!confirm("¿Revertir este movimiento?")) return;
              const d = await revertBankrollAdjustment(id);
              if (d.ok) invalidate();
            }}
          />
        </div>
      </div>

      <div className="glass-card mb-8 overflow-hidden">
        <div className="border-b border-outline-variant p-5">
          <h3 className="font-headline-md text-headline-md">Actividad reciente</h3>
        </div>
        <ActivityLog history={data.history ?? []} />
      </div>

      <h3 className="font-headline-md text-headline-md mb-4">Desglose detallado</h3>
      <Breakdowns stats={b} />

      <h3 className="font-headline-md text-headline-md mb-4 mt-8">Detalle de apuestas</h3>
      <HistoryTable
        history={data.history ?? []}
        onEdit={(id, status, odds, co, stake) => {
          setEditPickId(id);
          setEditOpen(true);
        }}
      />

      <AdjustmentModal
        open={adjustOpen}
        type={adjustType}
        bankroll={data.bankroll}
        onClose={() => setAdjustOpen(false)}
        onSaved={() => { setAdjustOpen(false); invalidate(); }}
      />
      <ManualPickModal open={manualOpen} onClose={() => setManualOpen(false)} onSaved={() => { setManualOpen(false); invalidate(); }} />
      {editPickId != null && (
        <EditResultModal
          open={editOpen}
          pickId={editPickId}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); invalidate(); }}
        />
      )}
    </main>
  );
}

function CapitalCard({
  data,
  onDeposit,
  onWithdraw,
  onAdjust,
}: {
  data: StatsResponse;
  onDeposit: () => void;
  onWithdraw: () => void;
  onAdjust: () => void;
}) {
  const enJuego = data.mes?.staked_pending ?? data.todo?.staked_pending ?? 0;
  const disponible = (data.bankroll ?? 0) - enJuego;

  return (
    <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5" style={{ borderColor: "var(--teal-border)" }}>
      <div>
        <div className="font-data-label text-data-label mb-1 uppercase text-on-surface-variant">Capital para apostar</div>
        <div className="font-display-lg text-display-lg text-secondary">
          {data.bankroll != null ? `ARS ${fmtMiles(data.bankroll)}` : "—"}
        </div>
        <div className="mt-1 text-sm text-on-surface-variant">
          {data.currency ?? "ARS"}
          {enJuego > 0 && (
            <>
              {" "}· En juego: {fmtMiles(enJuego)} · Disponible: {fmtMiles(disponible)}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-grad" onClick={onDeposit}>+ Agregar fondos</button>
        <button type="button" className="btn" style={{ color: "var(--red)", borderColor: "rgba(239,68,68,.4)" }} onClick={onWithdraw}>− Retirar</button>
        <button type="button" className="btn" onClick={onAdjust}>✏️ Ajuste manual</button>
      </div>
    </div>
  );
}

function typeBadge(type?: string, gold?: boolean) {
  if (gold) return <Badge variant="violet">⭐ Gold</Badge>;
  if (type === "sure") return <Badge variant="teal">🔒 Alta confianza</Badge>;
  return <Badge variant="blue">📊 Valor</Badge>;
}

function statusBadge(status?: string) {
  const map: Record<string, { v: "teal" | "red" | "amber" | "gray" | "violet"; l: string }> = {
    won: { v: "teal", l: "✓ Ganó" },
    lost: { v: "red", l: "✗ Perdió" },
    pending: { v: "amber", l: "⏳ Pendiente" },
    void: { v: "gray", l: "— Anulada" },
    cashout: { v: "violet", l: "💸 Cobro anticipado" },
  };
  const m = map[status ?? ""] ?? { v: "gray" as const, l: status ?? "" };
  return <Badge variant={m.v}>{m.l}</Badge>;
}

function PendingPickCard({
  pick,
  suggestion,
  onDone,
}: {
  pick: Pick;
  suggestion?: AutoResultSuggestion;
  onDone: () => void;
}) {
  const id = pick.id as number;
  const [oddsReal, setOddsReal] = useState(String(pick.odds_ref ?? ""));
  const [stakeReal, setStakeReal] = useState(String(Math.round(pick.stake_usd ?? 0)));
  const [oddsCo, setOddsCo] = useState("");
  const [showCo, setShowCo] = useState(false);

  const submit = async (status: string) => {
    if (status === "cashout" && parseFloat(oddsCo) <= 0) {
      alert("Ingresá la cuota de cobro anticipado");
      return;
    }
    const d = await markPickResult(id, {
      status,
      odds_real: parseFloat(oddsReal) || 0,
      odds_cashout: parseFloat(oddsCo) || 0,
      stake_real: parseFloat(stakeReal) || 0,
    });
    if (d.ok) onDone();
    else alert(`Error: ${d.error ?? "desconocido"}`);
  };

  return (
    <div className="pick-pendiente">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex flex-wrap gap-1.5">
            {typeBadge(pick.type, pick.is_gold)}
            <Badge variant="gray">{dep(pick.sport)} {pick.sport}</Badge>
          </div>
          <div className="text-sm font-semibold">{pick.event}</div>
          <div className="text-xs text-[var(--text2)]">
            Apuesta: <strong>{pick.pick_team}</strong> · {pick.market}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-blue">@{fmt(pick.odds_ref, 2)}</div>
          <div className="text-[11px] text-[var(--text2)]">Monto: ARS {fmtMiles(pick.stake_usd)}</div>
          <div className="mt-0.5 text-[10px] text-[var(--text3)]">{fmtDate(pick.placed_at)}</div>
        </div>
      </div>
      {suggestion && suggestion.suggested !== "undetermined" && (
        <div className="mb-2 rounded-md border-l-[3px] bg-[var(--bg3)] p-2.5 text-[13px]" style={{ borderColor: suggestion.suggested === "won" ? "var(--teal)" : "var(--red)" }}>
          Sugerencia: {suggestion.suggested.toUpperCase()}
          {suggestion.score_home != null && ` · Score: ${suggestion.score_home}-${suggestion.score_away}`}
        </div>
      )}
      <div className="resultado-form">
        <div className="mb-2.5 grid grid-cols-2 gap-2.5">
          <div>
            <label className="mb-1 block text-[11px] uppercase text-[var(--text2)]">Cuota real</label>
            <input className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px]" type="number" step="0.01" value={oddsReal} onChange={(e) => setOddsReal(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase text-[var(--text2)]">Monto real (ARS)</label>
            <input className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px]" type="number" value={stakeReal} onChange={(e) => setStakeReal(e.target.value)} />
          </div>
        </div>
        {showCo && (
          <div className="mb-2.5">
            <label className="mb-1 block text-[11px] uppercase text-[var(--text2)]">Cuota cobro anticipado</label>
            <input className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[13px]" type="number" step="0.01" value={oddsCo} onChange={(e) => setOddsCo(e.target.value)} />
          </div>
        )}
        <div className="resultado-btns">
          <button type="button" className="rbtn ganado" onClick={() => submit("won")}>✓ Ganó</button>
          <button type="button" className="rbtn perdido" onClick={() => submit("lost")}>✗ Perdió</button>
          <button type="button" className="rbtn cashout" onClick={() => { setShowCo(true); submit("cashout"); }}>💸 Cobro anticipado</button>
          <button type="button" className="rbtn" onClick={() => submit("void")}>— Anulada</button>
          <button
            type="button"
            className="rbtn ml-auto"
            style={{ color: "var(--red)", borderColor: "rgba(239,68,68,.3)" }}
            onClick={async () => {
              if (!confirm("¿Eliminar esta apuesta?")) return;
              const d = await deletePick(id);
              if (d.ok) onDone();
            }}
          >
            🗑 Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiGrid({ stats }: { stats?: PeriodStats }) {
  if (!stats?.total_placed) {
    return (
      <div id="kpi-grid" className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="empty col-span-full">
          <span className="empty-icon">📊</span>
          Sin datos en este período. Registrá apuestas desde el panel de picks.
        </div>
      </div>
    );
  }
  const wr = stats.win_rate ?? 0;
  const growthRoi = stats.growth_roi ?? stats.roi;
  const yieldRoi = stats.roi ?? 0;

  return (
    <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard label="ROI (crecimiento)" value={fmtPct(growthRoi)} color={(growthRoi ?? 0) >= 0 ? "var(--teal)" : "var(--red)"} sub="sobre tu capital inicial" />
      <KpiCard label="Yield" value={fmtPct(yieldRoi)} color={yieldRoi >= 0 ? "var(--teal)" : "var(--red)"} sub={`P&L sobre apuestas decididas · ARS ${fmtMiles(stats.staked_evaluable ?? stats.staked_resolved)} invertidos`} />
      <KpiCard label="% de aciertos" value={`${fmt(wr, 1)}%`} color={wr >= 60 ? "var(--teal)" : wr >= 50 ? "var(--blue)" : wr >= 40 ? "var(--amber)" : "var(--red)"} sub={`${stats.won ?? 0} ✓ · ${stats.lost ?? 0} ✗ · ${stats.cashouts ?? 0} 💸 · ${stats.voids ?? 0} —`} bar={wr} />
      <KpiCard label="Ganancia neta" value={fmtUSD(stats.pnl_total, "ARS", true)} color={(stats.pnl_total ?? 0) >= 0 ? "var(--teal)" : "var(--red)"} sub="total ganado o perdido" />
    </div>
  );
}

function KpiStrip({ stats }: { stats?: PeriodStats }) {
  if (!stats?.total_placed) return null;
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard label="Apuestas registradas" value={String(stats.total_placed)} color="var(--blue)" sub={`${stats.pending_picks ?? 0} pendientes`} />
      <KpiCard label="Resueltas" value={String(stats.total_resolved)} color="var(--text)" sub="con resultado cargado" />
      <KpiCard label="En juego" value={fmtMiles(stats.staked_pending)} color="var(--amber)" sub="ARS pendiente resultado" />
      <KpiCard label="Invertido" value={fmtMiles(stats.staked_resolved)} color="var(--blue)" sub="ARS ya jugado" />
    </div>
  );
}

function KpiCard({ label, value, color, sub, bar }: { label: string; value: string; color: string; sub?: string; bar?: number }) {
  return (
    <div className="glass-card flex flex-col justify-between p-5">
      <div className="font-data-label text-data-label mb-2 uppercase text-on-surface-variant">{label}</div>
      <div>
        <div className="font-display-lg text-display-lg" style={{ color }}>{value}</div>
        {bar != null && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
            <div className="confidence-gradient h-full" style={{ width: `${Math.min(Math.max(bar, 0), 100)}%` }} />
          </div>
        )}
        {sub && <div className="mt-1 text-sm text-on-surface-variant">{sub}</div>}
      </div>
    </div>
  );
}

function SportDist({ stats }: { stats?: PeriodStats }) {
  const obj = stats?.by_sport ?? {};
  const entries = Object.entries(obj).sort((a, b) => (b[1].pnl ?? 0) - (a[1].pnl ?? 0));
  if (!entries.length) return <div className="empty">Sin datos</div>;
  const total = entries.reduce((a, [, s]) => a + (s.total ?? 0), 0) || 1;
  const maxAbs = Math.max(...entries.map(([, s]) => Math.abs(s.pnl ?? 0)), 1);
  const best = entries[0];

  return (
    <>
      {entries.map(([k, s]) => {
        const pct = Math.round(((s.total ?? 0) / total) * 100);
        const w = Math.round((Math.abs(s.pnl ?? 0) / maxAbs) * 100);
        const pos = (s.pnl ?? 0) >= 0;
        return (
          <div key={k} className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span>{dep(k)} {k}</span>
              <span style={{ color: pos ? "var(--teal)" : "var(--red)" }}>{pct}% · {pos ? "+" : ""}{fmtMiles(s.pnl)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
              <div className="h-full" style={{ width: `${w}%`, background: pos ? "var(--teal)" : "var(--red)" }} />
            </div>
          </div>
        );
      })}
      {best && (
        <div className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            <span className="font-bold text-secondary">Insight:</span> {dep(best[0])} {best[0]} es tu deporte{" "}
            {(best[1].pnl ?? 0) >= 0 ? "más rentable" : "de mayor pérdida"} ({fmtPct(best[1].roi)} ROI en {best[1].total} apuestas).
          </p>
        </div>
      )}
    </>
  );
}

function MonthlyTable({ history }: { history: Pick[] }) {
  const res = history.filter((p) => p.status && p.status !== "pending");
  if (!res.length) return <div className="empty">Sin apuestas resueltas todavía.</div>;
  const groups: Record<string, { label: string; count: number; pnl: number; stake: number }> = {};
  res.forEach((p) => {
    const d = new Date(p.resulted_at ?? p.placed_at ?? Date.now());
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = { label, count: 0, pnl: 0, stake: 0 };
    groups[key].count++;
    groups[key].pnl += p.pnl ?? 0;
    groups[key].stake += p.stake_usd ?? 0;
  });
  const rows = Object.keys(groups).sort().reverse().slice(0, 8);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-[var(--bg3)] text-on-surface-variant">
            <th className="px-5 py-3 font-data-label text-data-label uppercase">Mes</th>
            <th className="px-5 py-3 font-data-label text-data-label uppercase">Volumen</th>
            <th className="px-5 py-3 font-data-label text-data-label uppercase">ROI</th>
            <th className="px-5 py-3 font-data-label text-data-label uppercase">Ganancia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((k) => {
            const g = groups[k];
            const roi = g.stake > 0 ? (g.pnl / g.stake) * 100 : 0;
            const c = g.pnl >= 0 ? "var(--teal)" : "var(--red)";
            return (
              <tr key={k} className="border-t border-outline-variant">
                <td className="px-5 py-3 capitalize font-medium">{g.label}</td>
                <td className="px-5 py-3 text-on-surface-variant">{g.count} picks</td>
                <td className="px-5 py-3 font-bold" style={{ color: c }}>{fmtPct(roi)}</td>
                <td className="px-5 py-3" style={{ color: c }}>{g.pnl >= 0 ? "+" : ""}ARS {fmtMiles(Math.abs(g.pnl))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MovementsList({
  items,
  onRevert,
}: {
  items: StatsResponse["bankroll_hist"];
  onRevert: (id: number) => void;
}) {
  if (!items?.length) return <div className="empty">Sin movimientos.</div>;
  const typeLbl: Record<string, string> = {
    pick_placed: "Apuesta colocada",
    pick_result: "Resultado",
    deposit: "Depósito",
    withdrawal: "Retiro",
    adjustment: "Ajuste",
    result_edit: "Corrección",
    pick_deleted: "Devolución",
    manual_pick: "Pick manual",
  };

  return (
    <>
      {items.map((h) => (
        <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant p-4 last:border-0">
          <div>
            <span style={{ color: h.amount >= 0 ? "var(--teal)" : "var(--red)", fontWeight: 700 }}>
              {h.amount >= 0 ? "+" : ""}{fmtMiles(h.amount)}
            </span>
            <span className="ml-2 text-[13px] text-[var(--text2)]">{typeLbl[h.type] ?? h.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-data-label text-data-label text-on-surface-variant">
              {h.created_at ? fmtDate(h.created_at) : ""}
            </span>
            {h.type !== "pick_placed" && h.type !== "pick_result" && (
              <button type="button" className="btn text-[11px]" style={{ color: "var(--red)" }} onClick={() => onRevert(h.id)}>
                ↩ Revertir
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function ActivityLog({ history }: { history: Pick[] }) {
  const all = [...history]
    .sort((a, b) => new Date(b.resulted_at ?? b.placed_at ?? 0).getTime() - new Date(a.resulted_at ?? a.placed_at ?? 0).getTime())
    .slice(0, 8);
  if (!all.length) return <div className="empty">Sin actividad.</div>;

  return (
    <>
      {all.map((p) => {
        const won = p.status === "won" || p.status === "cashout";
        const lost = p.status === "lost";
        const col = won ? "var(--teal)" : lost ? "var(--red)" : "var(--text2)";
        const pnl = p.pnl != null ? `${p.pnl >= 0 ? "+" : ""}ARS ${fmtMiles(Math.abs(p.pnl))}` : p.status === "pending" ? "pendiente" : "—";
        return (
          <div key={p.id} className="flex items-center justify-between gap-3 border-b border-outline-variant p-4 last:border-0 hover:bg-surface-variant/30">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${col}1a`, border: `1px solid ${col}55`, color: col }}>
                <span className="material-symbols-outlined text-[18px]">{won ? "check" : lost ? "close" : "hourglass_top"}</span>
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium">{dep(p.sport)} {p.event}</div>
                <div className="truncate font-data-label text-data-label text-on-surface-variant">{p.pick_team} · @{fmt(p.odds_real ?? p.odds_ref, 2)}</div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-bold" style={{ color: col }}>{pnl}</div>
              <div className="font-data-label text-data-label text-on-surface-variant">{fmtDate(p.resulted_at ?? p.placed_at)}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function Breakdowns({ stats }: { stats?: PeriodStats }) {
  if (!stats?.total_placed) return null;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <BreakdownCard title="Por tipo de apuesta">
        <TipoRow label="⭐ Gold Tips" s={stats.gold_stats} color="var(--violet)" />
        <TipoRow label="🔒 Alta confianza" s={stats.sure_stats} color="var(--teal)" />
        <TipoRow label="📊 Valor" s={stats.value_stats} color="var(--blue)" />
      </BreakdownCard>
      <BreakdownCard title="Por deporte"><DimensionRows obj={stats.by_sport} /></BreakdownCard>
      <BreakdownCard title="Por mercado"><DimensionRows obj={stats.by_market} /></BreakdownCard>
      <BreakdownCard title="Por categoría"><DimensionRows obj={stats.by_category} /></BreakdownCard>
    </div>
  );
}

function BreakdownCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <div className="font-data-label text-data-label mb-4 uppercase text-on-surface-variant">{title}</div>
      {children}
    </div>
  );
}

function TipoRow({ label, s, color }: { label: string; s?: StatsBreakdown; color: string }) {
  if (!s || s.total === 0) {
    return (
      <div className="tipo-row opacity-35">
        <div className="tipo-label" style={{ color }}>{label}</div>
        <span className="text-xs text-[var(--text3)]">Sin picks</span>
      </div>
    );
  }
  const rc = (s.roi ?? 0) >= 0 ? "var(--teal)" : "var(--red)";
  return (
    <div className="tipo-row">
      <div className="tipo-label" style={{ color }}>{label}</div>
      <div className="tipo-stats text-xs text-[var(--text2)]">
        <span>{s.total} picks</span>
        <span>Aciertos: <strong>{fmt(s.win_rate, 1)}%</strong></span>
        <span>Rendim.: <strong style={{ color: rc }}>{fmtPct(s.roi)}</strong></span>
      </div>
    </div>
  );
}

function DimensionRows({ obj }: { obj?: Record<string, StatsBreakdown> }) {
  if (!obj || !Object.keys(obj).length) return <div className="py-5 text-center text-[13px] text-[var(--text2)]">Sin datos</div>;
  return Object.entries(obj)
    .sort((a, b) => (b[1].total ?? 0) - (a[1].total ?? 0))
    .map(([d, s]) => <TipoRow key={d} label={d} s={s} color="var(--text2)" />);
}

function HistoryTable({ history, onEdit }: { history: Pick[]; onEdit: (id: number, status: string, odds: number, co: number, stake: number) => void }) {
  const rows = history.filter((p) => p.status !== "pending");
  if (!rows.length) return <div className="empty"><span className="empty-icon">📋</span>Sin historial de apuestas.</div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="hist-table">
          <thead>
            <tr>
              <th>Fecha</th><th>Evento</th><th>Apuesta</th><th>Tipo</th><th>Cuota ref.</th><th>Cuota real</th><th>Monto</th><th>Estado</th><th>Ganancia</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap text-[11px] text-[var(--text2)]">{fmtDate(p.placed_at)}</td>
                <td><div className="text-[13px] font-medium">{dep(p.sport)} {p.event}</div></td>
                <td className="font-medium">{p.pick_team}</td>
                <td>{typeBadge(p.type, p.is_gold)}</td>
                <td className="text-[var(--text2)]">@{fmt(p.odds_ref, 2)}</td>
                <td className="font-semibold text-blue">@{p.odds_real ? fmt(p.odds_real, 2) : "—"}</td>
                <td className="text-violet">{fmtMiles(p.stake_usd)}</td>
                <td>{statusBadge(p.status)}</td>
                <td className="font-bold" style={{ color: (p.pnl ?? 0) >= 0 ? "var(--teal)" : "var(--red)" }}>
                  {p.pnl != null ? `${p.pnl >= 0 ? "+" : ""}${fmtMiles(Math.abs(p.pnl))}` : "—"}
                </td>
                <td>
                  <button type="button" className="btn text-[11px]" onClick={() => onEdit(p.id as number, p.status ?? "won", p.odds_real ?? p.odds_ref ?? 0, p.odds_cashout ?? 0, p.stake_usd ?? 0)}>
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdjustmentModal({
  open,
  type,
  bankroll,
  onClose,
  onSaved,
}: {
  open: boolean;
  type: string;
  bankroll?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  const titles: Record<string, string> = {
    deposit: "+ Agregar fondos al capital",
    withdrawal: "− Retirar fondos",
    adjustment: "✏️ Establecer capital actual",
  };

  const save = async () => {
    const n = parseFloat(amount) || 0;
    if (n <= 0) { alert("Ingresá un monto válido"); return; }
    const finalAmount = type === "withdrawal" ? -n : n;
    const d = await adjustBankroll({ amount: finalAmount, type, description: desc });
    if (d.ok) onSaved();
    else setMsg(d.error ?? "Error");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-[18px] text-base font-semibold text-[var(--teal)]">{titles[type] ?? "Ajustar capital"}</div>
      <div className="app-shell-field">
        <label>Monto</label>
        <input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={type === "adjustment" ? String(bankroll ?? "") : "ej: 500"} />
      </div>
      <div className="app-shell-field">
        <label>Descripción (opcional)</label>
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn flex-1" onClick={onClose}>Cancelar</button>
        <button type="button" className="btn-grad flex-1" onClick={save}>Confirmar</button>
      </div>
      {msg && <div className="mt-2 text-center text-xs text-[var(--red)]">{msg}</div>}
    </Modal>
  );
}

function ManualPickModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [event, setEvent] = useState("");
  const [pick, setPick] = useState("");
  const [sport, setSport] = useState("Béisbol");
  const [league, setLeague] = useState("");
  const [odds, setOdds] = useState("");
  const [stake, setStake] = useState("");
  const [status, setStatus] = useState("pending");
  const [oddsCo, setOddsCo] = useState("");
  const [msg, setMsg] = useState("");

  const save = async () => {
    const data = {
      event, pick_team: pick, sport, league,
      odds_real: parseFloat(odds) || 0,
      odds_cashout: status === "cashout" ? parseFloat(oddsCo) || 0 : 0,
      stake_usd: parseFloat(stake) || 0,
      status, type: "value",
    };
    if (!data.event || !data.pick_team || !data.odds_real || !data.stake_usd) {
      setMsg("Completá los campos obligatorios");
      return;
    }
    const d = await createManualPick(data);
    if (d.ok) onSaved();
    else setMsg(d.error ?? "Error");
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="480px">
      <div className="mb-[18px] text-base font-semibold text-[var(--violet)]">+ Registrar apuesta manual</div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="app-shell-field col-span-2"><label>Evento *</label><input value={event} onChange={(e) => setEvent(e.target.value)} /></div>
        <div className="app-shell-field col-span-2"><label>Pick colocado *</label><input value={pick} onChange={(e) => setPick(e.target.value)} /></div>
        <div className="app-shell-field">
          <label>Deporte</label>
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            {["Béisbol", "Fútbol", "Básquet", "Tenis", "MMA", "Esports", "Otro"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="app-shell-field"><label>Liga</label><input value={league} onChange={(e) => setLeague(e.target.value)} /></div>
        <div className="app-shell-field"><label>Cuota *</label><input type="number" step="0.01" value={odds} onChange={(e) => setOdds(e.target.value)} /></div>
        <div className="app-shell-field"><label>Monto (ARS) *</label><input type="number" value={stake} onChange={(e) => setStake(e.target.value)} /></div>
        <div className="app-shell-field col-span-2">
          <label>Resultado</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pendiente</option>
            <option value="won">Ganó ✓</option>
            <option value="lost">Perdió ✗</option>
            <option value="cashout">Cobro anticipado 💸</option>
            <option value="void">Anulada —</option>
          </select>
        </div>
        {status === "cashout" && (
          <div className="app-shell-field col-span-2"><label>Cuota cobro anticipado</label><input type="number" step="0.01" value={oddsCo} onChange={(e) => setOddsCo(e.target.value)} /></div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn flex-1" onClick={onClose}>Cancelar</button>
        <button type="button" className="btn-grad flex-1" onClick={save}>Guardar pick</button>
      </div>
      {msg && <div className="mt-2 text-center text-xs text-[var(--red)]">{msg}</div>}
    </Modal>
  );
}

function EditResultModal({
  open,
  pickId,
  onClose,
  onSaved,
}: {
  open: boolean;
  pickId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState("won");
  const [odds, setOdds] = useState("");
  const [stake, setStake] = useState("");
  const [oddsCo, setOddsCo] = useState("");
  const [msg, setMsg] = useState("");

  const save = async () => {
    const d = await editPickResult(pickId, {
      status,
      odds_real: parseFloat(odds) || 0,
      stake_real: parseFloat(stake) || 0,
      odds_cashout: parseFloat(oddsCo) || 0,
    });
    if (d.ok) onSaved();
    else setMsg(d.error ?? "Error");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-[18px] text-base font-semibold text-[var(--amber)]">✏️ Corregir resultado</div>
      <div className="app-shell-field">
        <label>Resultado correcto</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="won">✓ Ganó</option>
          <option value="lost">✗ Perdió</option>
          <option value="cashout">💸 Cobro anticipado</option>
          <option value="void">— Anulada</option>
        </select>
      </div>
      <div className="app-shell-field"><label>Cuota real</label><input type="number" step="0.01" value={odds} onChange={(e) => setOdds(e.target.value)} /></div>
      <div className="app-shell-field"><label>Monto real (ARS)</label><input type="number" value={stake} onChange={(e) => setStake(e.target.value)} /></div>
      {status === "cashout" && (
        <div className="app-shell-field"><label>Cuota cobro anticipado</label><input type="number" step="0.01" value={oddsCo} onChange={(e) => setOddsCo(e.target.value)} /></div>
      )}
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn flex-1" onClick={onClose}>Cancelar</button>
        <button type="button" className="btn-grad flex-1" onClick={save}>Confirmar corrección</button>
      </div>
      {msg && <div className="mt-2 text-center text-xs text-[var(--red)]">{msg}</div>}
    </Modal>
  );
}
