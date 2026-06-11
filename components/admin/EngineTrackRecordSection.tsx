"use client";

import { EngineSignalResultModal } from "@/components/admin/EngineSignalResultModal";
import { EngineSignalsTable } from "@/components/admin/EngineSignalsTable";
import {
  useEngineSignalStats,
  useEngineSignals,
} from "@/hooks/use-engine-signals";
import type {
  EngineSignal,
  EngineSignalHistoricalStats,
  EngineSignalOfficialStats,
  EngineSignalPeriod,
  EngineSignalStatsPair,
  EngineSignalType,
} from "@/lib/types/domain";
import { fmtPct } from "@/lib/format";
import { useState } from "react";

const PAGE_SIZE = 25;

type StatusFilter = "" | "pending" | "resolved" | "expired";
type TypeFilter = "" | EngineSignalType;

function RoiStat({ roi }: { roi: number }) {
  const color = roi >= 0 ? "var(--teal)" : "var(--red)";
  return (
    <div className="font-stat-lg text-stat-lg" style={{ color }}>
      {fmtPct(roi)}
    </div>
  );
}

function OfficialStatsBlock({
  stats,
  winRateClassName = "",
}: {
  stats?: EngineSignalOfficialStats;
  winRateClassName?: string;
}) {
  return (
    <div className="mb-4 border-b border-outline-variant pb-4">
      <p className="mb-2 text-xs font-medium uppercase text-on-surface-variant">
        Recomendaciones vigentes (oficial)
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-on-surface-variant">Vigentes</span>
          <div className="font-stat-lg text-stat-lg">{stats?.total ?? "—"}</div>
        </div>
        <div>
          <span className="text-on-surface-variant">Resueltos</span>
          <div className="font-stat-lg text-stat-lg">{stats?.resolved ?? "—"}</div>
        </div>
        <div>
          <span className="text-on-surface-variant">Expiradas</span>
          <div className="font-stat-lg text-stat-lg text-on-surface-variant">
            {stats?.expired ?? "—"}
          </div>
        </div>
        <div>
          <span className="text-on-surface-variant">Detectadas</span>
          <div className="font-stat-lg text-stat-lg">{stats?.detected ?? "—"}</div>
        </div>
        <div>
          <span className="text-on-surface-variant">Win rate</span>
          <div className={`font-stat-lg text-stat-lg ${winRateClassName}`}>
            {stats ? fmtPct(stats.win_rate) : "—"}
          </div>
        </div>
        <div>
          <span className="text-on-surface-variant">ROI</span>
          <RoiStat roi={stats?.roi ?? 0} />
        </div>
      </div>
    </div>
  );
}

function HistoricalStatsBlock({
  stats,
  winRateClassName = "",
}: {
  stats?: EngineSignalHistoricalStats;
  winRateClassName?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-on-surface-variant">
        Todas las detecciones (histórico)
      </p>
      <p className="mb-2 text-[10px] text-on-surface-variant">
        Incluye expiradas con resultado hipotético al cierre del partido
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-on-surface-variant">Detectadas</span>
          <div className="font-stat-lg text-stat-lg">{stats?.total ?? "—"}</div>
        </div>
        <div>
          <span className="text-on-surface-variant">Resueltas</span>
          <div className="font-stat-lg text-stat-lg">{stats?.resolved ?? "—"}</div>
        </div>
        <div>
          <span className="text-on-surface-variant">Pendientes</span>
          <div className="font-stat-lg text-stat-lg">{stats?.pending ?? "—"}</div>
        </div>
        <div>
          <span className="text-on-surface-variant">Sin hipotético</span>
          <div className="font-stat-lg text-stat-lg text-on-surface-variant">
            {stats?.pending_hypothetical ?? "—"}
          </div>
        </div>
        <div>
          <span className="text-on-surface-variant">Win rate</span>
          <div className={`font-stat-lg text-stat-lg ${winRateClassName}`}>
            {stats ? fmtPct(stats.win_rate) : "—"}
          </div>
        </div>
        <div>
          <span className="text-on-surface-variant">ROI</span>
          <RoiStat roi={stats?.roi ?? 0} />
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  stats,
  winRateClassName = "",
}: {
  title: string;
  stats?: EngineSignalStatsPair;
  winRateClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-high p-4">
      <p className="mb-3 font-data-label text-data-label uppercase text-on-surface-variant">
        {title}
      </p>
      <OfficialStatsBlock stats={stats?.official} winRateClassName={winRateClassName} />
      <HistoricalStatsBlock stats={stats?.historical} winRateClassName={winRateClassName} />
    </div>
  );
}

export function EngineTrackRecordSection() {
  const [period, setPeriod] = useState<EngineSignalPeriod>("30d");
  const [type, setType] = useState<TypeFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(0);
  const [editSignal, setEditSignal] = useState<EngineSignal | null>(null);

  const statsQuery = useEngineSignalStats(period);
  const listQuery = useEngineSignals({
    period,
    type: type || undefined,
    status: status || undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const refresh = () => {
    void statsQuery.refetch();
    void listQuery.refetch();
  };

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;
  const rangeStart = total > 0 ? page * PAGE_SIZE + 1 : 0;
  const rangeEnd = total > 0 ? Math.min((page + 1) * PAGE_SIZE, total) : 0;
  const updatedLabel =
    statsQuery.dataUpdatedAt > 0
      ? `Actualizado ${new Date(statsQuery.dataUpdatedAt).toLocaleTimeString("es-AR")}`
      : "";

  return (
    <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="material-symbols-outlined text-violet">verified</span>
        <h2 className="font-headline-md text-headline-md">Track Record del motor</h2>
        {updatedLabel && (
          <span className="text-xs text-on-surface-variant">{updatedLabel}</span>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="field max-w-[140px]">
          <label>Período</label>
          <select
            className="w-full"
            value={period}
            onChange={(e) => {
              setPage(0);
              setPeriod(e.target.value as EngineSignalPeriod);
            }}
          >
            <option value="30d">Últimos 30 días</option>
            <option value="all">Todo el historial</option>
          </select>
        </div>
        <div className="field max-w-[140px]">
          <label>Tipo</label>
          <select
            className="w-full"
            value={type}
            onChange={(e) => {
              setPage(0);
              setType(e.target.value as TypeFilter);
            }}
          >
            <option value="">Todos</option>
            <option value="gold">Gold Tips</option>
            <option value="sure">Alta confianza</option>
          </select>
        </div>
        <div className="field max-w-[140px]">
          <label>Estado</label>
          <select
            className="w-full"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as StatusFilter);
            }}
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="resolved">Resueltos</option>
            <option value="expired">Expiradas</option>
          </select>
        </div>
        <button type="button" className="btn" onClick={refresh}>
          Actualizar
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatsCard
          title="⭐ Gold Tips"
          stats={statsQuery.data?.gold_stats}
          winRateClassName="text-violet"
        />
        <StatsCard
          title="🔒 Alta confianza"
          stats={statsQuery.data?.sure_stats}
          winRateClassName="text-secondary"
        />
      </div>

      {listQuery.isLoading ? (
        <p className="text-sm text-on-surface-variant">Cargando señales…</p>
      ) : (
        <>
          <EngineSignalsTable items={items} onCorrect={setEditSignal} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-on-surface-variant">
            <span>
              {total > 0
                ? `Mostrando ${rangeStart}–${rangeEnd} de ${total}`
                : "0 resultados"}
            </span>
            {total > 0 && (
              <div className="flex items-center gap-3">
                <span>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  type="button"
                  className="btn"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <EngineSignalResultModal
        open={editSignal != null}
        signal={editSignal}
        onClose={() => setEditSignal(null)}
      />
    </section>
  );
}
