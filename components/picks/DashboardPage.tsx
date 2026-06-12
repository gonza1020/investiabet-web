"use client";

import {
  FuturePickCard,
  LivePickCard,
  SkipCard,
  sortPicks,
  SureBetCard,
  ValuePickCard,
} from "@/components/picks/PickCards";
import { AppShell } from "@/components/layout/AppShell";
import { placePick } from "@/lib/api/picks";
import { fmtPct, fmtUSD } from "@/lib/format";
import type { Pick } from "@/lib/types/domain";
import { usePlacedPicks } from "@/hooks/use-placed-picks";
import { usePicks } from "@/hooks/use-picks";
import { useUser } from "@/providers/auth-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

type SortMode = "fecha" | "ventaja";
type SportTab = "todos" | "futbol" | "tenis" | "basquet" | "esports" | "otros";

const SPORT_TABS: { id: SportTab; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "futbol", label: "Fútbol" },
  { id: "tenis", label: "Tenis" },
  { id: "basquet", label: "Básquet" },
  { id: "esports", label: "Esports" },
  { id: "otros", label: "MMA/Béisbol" },
];

function filterBySport(picks: Pick[], key: SportTab): Pick[] {
  if (key === "todos") return picks;
  if (key === "otros") return picks.filter((p) => ["MMA", "Béisbol"].includes(p.sport ?? ""));
  const map: Record<string, string> = {
    futbol: "Fútbol",
    tenis: "Tenis",
    basquet: "Básquet",
    esports: "Esports",
  };
  return picks.filter((p) => p.sport === map[key]);
}

function pickKey(p: Pick, i: number): string {
  if (p.id != null) return String(p.id);
  return `${p.event}|${p.pick_team}|${p.market ?? ""}|${p.odds_real ?? ""}|${i}`;
}

export function DashboardPage() {
  const { user } = useUser();
  const { data, isLoading, refetch } = usePicks();
  const { getMark, refetch: refetchPlaced } = usePlacedPicks();
  const qc = useQueryClient();
  const [sortMode, setSortMode] = useState<SortMode>("fecha");
  const [minEdge, setMinEdge] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState<SportTab>("todos");
  const [placingKey, setPlacingKey] = useState<string | null>(null);
  const [bankSub, setBankSub] = useState<{ enJuego: number; disponible: number } | null>(null);
  const [showDiscarded, setShowDiscarded] = useState(false);

  const premium = user?.plan === "premium" || user?.plan === "admin";

  const minEdgeOptions = useMemo(() => {
    if (!data) return [];
    const floor = Math.max(0, Math.round((data.min_edge_pct ?? 0) * 100));
    return [floor, floor + 3, floor + 8];
  }, [data]);

  useEffect(() => {
    if (minEdgeOptions.length && minEdge === null) {
      setMinEdge(minEdgeOptions[0]);
    }
  }, [minEdgeOptions, minEdge]);

  useEffect(() => {
    if (data?.scanning && !data.gold_tips) {
      const t = window.setTimeout(() => refetch(), 5000);
      return () => clearTimeout(t);
    }
  }, [data, refetch]);

  const handlePlace = useCallback(
    async (pick: Pick, type?: string) => {
      const key = `${pick.event}|${pick.pick_team}`;
      setPlacingKey(key);
      try {
        const body = {
          ...pick,
          bankroll_engine: data?.bankroll ?? pick.bankroll_engine,
          stake_usd: pick.stake_usd,
          ...(type ? { type } : {}),
        };
        const d = await placePick(body);
        if (d.ok) {
          if (d.en_juego != null) {
            setBankSub({ enJuego: d.en_juego, disponible: d.disponible ?? 0 });
          }
          await refetchPlaced();
          qc.invalidateQueries({ queryKey: ["stats"] });
        }
      } finally {
        setPlacingKey(null);
      }
    },
    [data, refetchPlaced, qc],
  );

  const handlePlaceFree = useCallback(
    async (pick: Pick) => {
      const monto = window.prompt(
        `¿Cuánto vas a apostar? (en ${data?.currency ?? "ARS"})`,
      );
      if (monto === null) return;
      const stake = parseFloat(monto);
      if (!stake || stake <= 0) {
        window.alert("Ingresá un monto válido.");
        return;
      }
      await handlePlace({ ...pick, stake_usd: Math.round(stake * 100) / 100 });
    },
    [data, handlePlace],
  );

  const scanBadge = data
    ? { className: "badge b-teal", text: "● Activo" }
    : { className: "badge b-amber", text: "Cargando…" };

  const lastScan = data?.last_scan ? `Último: ${data.last_scan}` : undefined;

  const filteredGold = useMemo(() => {
    if (!data) return [];
    const minE = (minEdge ?? 0) / 100;
    const picks = filterBySport(data.gold_tips ?? data.valid_picks ?? [], currentTab).filter(
      (p) => (p.edge ?? 0) >= minE,
    );
    return sortPicks(picks, sortMode);
  }, [data, minEdge, sortMode, currentTab]);

  const sureBets = useMemo(
    () => sortPicks(data?.sure_bets ?? [], sortMode),
    [data, sortMode],
  );

  const livePicks = useMemo(() => {
    const vivos = data?.live_picks ?? [];
    const seen = new Set<string>();
    return sortPicks(
      vivos.filter((p) => {
        if (seen.has(p.event)) return false;
        seen.add(p.event);
        return true;
      }),
      sortMode,
    );
  }, [data, sortMode]);

  const futuresActive = useMemo(
    () => sortPicks((data?.futures_picks ?? []).filter((p) => !p.discarded), sortMode),
    [data, sortMode],
  );

  const futuresRef = useMemo(
    () => (data?.futures_picks ?? []).filter((p) => p.discarded),
    [data],
  );

  const currency = data?.currency ?? "ARS";
  const enJuego = bankSub?.enJuego ?? user?.en_juego ?? 0;
  const disponible = bankSub?.disponible ?? user?.disponible ?? data?.bankroll ?? 0;

  const cardProps = (pick: Pick, type?: string) => ({
    pick,
    currency,
    showStake: pick.stake_usd != null,
    mark: getMark(pick.event, pick.pick_team),
    placing: placingKey === `${pick.event}|${pick.pick_team}`,
    onPlace: () => handlePlace(pick, type),
    onPlaceFree: () => handlePlaceFree(pick),
  });

  return (
    <AppShell
      page="picks"
      scanBadge={scanBadge}
      lastScan={lastScan}
      onScanComplete={() => refetch()}
      onProfileSaved={() => refetch()}
    >
      <main className="custom-scrollbar mx-auto max-w-[1400px] px-4 py-6 sm:px-5">
        {user?.plan === "free" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
            <div>
              <div className="mb-0.5 font-semibold text-secondary">Plan Free</div>
              <div className="text-sm text-on-surface-variant">
                Ves hasta 5 Gold Tips y 3 de alta confianza con su ventaja. Los montos sugeridos por
                el motor y los picks en vivo son Premium.
                {(data?.blocked_picks ?? 0) > 0 &&
                  ` Hay ${data?.blocked_picks} Gold Tips más en este escaneo que no estás viendo.`}
              </div>
            </div>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Capital total" value={fmtUSD(data?.bankroll)} sub={bankrollSub(currency, enJuego, disponible)} />
          <KpiCard label="⭐ Gold Tips" value={String((data?.gold_tips ?? []).length)} sub={`Rendimiento potencial: ${premium ? fmtPct(data?.roi_gold_potencial) : "🔒"}`} valueClass="text-violet" />
          <KpiCard label="🔒 Alta confianza" value={String((data?.sure_bets ?? []).length)} sub={`Rendimiento potencial: ${premium ? fmtPct(data?.roi_sure_potencial) : "🔒"}`} valueClass="text-secondary" />
          <KpiCard label="Partidos analizados" value={String(data?.total_events ?? "—")} sub={`próximas ${data?.window_hours ?? 24}hs`} valueClass="text-blue" />
        </section>

        {(user?.plan !== "free" ? livePicks.length > 0 : true) && (
          <section className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-error" />
              <h2 className="font-headline-md text-headline-md text-error">En Vivo</h2>
              <span className="badge b-red">
                {user?.plan === "free" ? "Premium" : `${livePicks.length} picks`}
              </span>
              <span className="text-xs text-on-surface-variant">
                Cuotas cambian rápido · verificá en tu casa antes de apostar
              </span>
            </div>
            {user?.plan === "free" ? (
              <div className="empty">
                <span className="empty-icon">🔒</span>
                Los picks de partidos en vivo son una función Premium.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {livePicks.map((p, i) => (
                  <LivePickCard key={pickKey(p, i)} {...cardProps(p)} />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mb-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <h2 className="font-headline-md text-headline-md">Gold Tips — Mejor valor</h2>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 sm:flex">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">filter_alt</span>
                <span className="font-data-label text-data-label uppercase text-on-surface-variant">Filtros</span>
              </div>
              <div className="relative w-full sm:w-auto">
                <select
                  className="w-full cursor-pointer appearance-none border-none bg-transparent pr-6 font-button text-xs text-on-surface-variant outline-none focus:ring-0 sm:w-auto"
                  value={currentTab}
                  onChange={(e) => setCurrentTab(e.target.value as SportTab)}
                >
                  {SPORT_TABS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id === "todos" ? "Todos los deportes" : t.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                  expand_more
                </span>
              </div>
              <div className="mx-1 hidden h-6 w-px bg-outline-variant sm:block" />
              <div className="relative w-full sm:w-auto">
                <select
                  className="w-full cursor-pointer appearance-none border-none bg-transparent pr-6 font-button text-xs text-on-surface-variant outline-none focus:ring-0 sm:w-auto"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                >
                  <option value="fecha">Ordenar por fecha</option>
                  <option value="ventaja">Ordenar por ventaja</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                  expand_more
                </span>
              </div>
              <div className="mx-1 hidden h-6 w-px bg-outline-variant sm:block" />
              <div className="relative w-full sm:w-auto">
                <select
                  className="w-full cursor-pointer appearance-none border-none bg-transparent pr-6 font-button text-xs text-on-surface-variant outline-none focus:ring-0 sm:w-auto"
                  value={minEdge ?? minEdgeOptions[0] ?? 0}
                  onChange={(e) => setMinEdge(parseInt(e.target.value))}
                >
                  {minEdgeOptions.map((v, i) => (
                    <option key={v} value={v}>
                      Ventaja ≥ {v}%{i === 0 ? " (todas)" : ""}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading || (data?.scanning && !data.gold_tips) ? (
              <div className="empty">
                <span className="spin mb-2 block text-2xl">↻</span>
                Calculando picks…
              </div>
            ) : filteredGold.length ? (
              filteredGold.map((p, i) => (
                <ValuePickCard key={pickKey(p, i)} {...cardProps(p)} />
              ))
            ) : (
              <div className="empty">
                <span className="empty-icon">📊</span>
                Sin Gold Tips
                {currentTab !== "todos"
                  ? ` de ${SPORT_TABS.find((t) => t.id === currentTab)?.label}`
                  : ""}{" "}
                con ventaja ≥ {minEdge ?? 0}%
              </div>
            )}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-secondary">lock</span>
            <h2 className="font-headline-md text-headline-md">Alta Confianza</h2>
            <span className="text-xs text-on-surface-variant">{sureBets.length} encontradas</span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sureBets.length ? (
              sureBets.map((p, i) => (
                <SureBetCard key={pickKey(p, i)} {...cardProps(p, "sure")} />
              ))
            ) : (
              <div className="empty">
                <span className="empty-icon">🔒</span>
                Sin picks de alta confianza por ahora.
                <br />
                <span className="text-xs">El motor escanea el mercado cada ~30 min.</span>
              </div>
            )}
          </div>
        </section>

        {(futuresActive.length > 0 || futuresRef.length > 0) && (
          <section className="mb-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-amber">emoji_events</span>
              <h2 className="font-headline-md text-headline-md text-amber">Futures / Campeón</h2>
              <span className="badge b-amber">
                {futuresActive.length ? `${futuresActive.length} picks` : `${futuresRef.length} ref.`}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(futuresActive.length ? futuresActive : futuresRef).map((p, i) => (
                <FuturePickCard key={pickKey(p, i)} {...cardProps(p)} />
              ))}
            </div>
          </section>
        )}

        {(data?.discarded_picks ?? []).length > 0 && (
          <section className="opacity-70 transition-all duration-500 hover:opacity-100">
            <button
              type="button"
              className="mb-5 flex w-full flex-wrap items-center gap-2 text-left"
              onClick={() => setShowDiscarded((v) => !v)}
            >
              <span className="material-symbols-outlined text-on-surface-variant">block</span>
              <h2 className="font-headline-md text-headline-md text-on-surface-variant">
                Descartados / Baja confianza
              </h2>
              <span className="text-xs text-on-surface-variant">
                {(data?.discarded_picks ?? []).length} picks
              </span>
              <span className="material-symbols-outlined ml-auto text-on-surface-variant">
                {showDiscarded ? "expand_less" : "expand_more"}
              </span>
            </button>
            {showDiscarded && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(data?.discarded_picks ?? []).map((p, i) => (
                  <SkipCard key={pickKey(p, i)} pick={p} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="card-border rounded-xl bg-surface-container p-5">
      <p className="font-data-label text-data-label mb-2 uppercase text-on-surface-variant">{label}</p>
      <div className={`font-display-lg text-display-lg ${valueClass}`}>{value}</div>
      <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>
    </div>
  );
}

function bankrollSub(currency: string, enJuego: number, disponible: number): string {
  if (enJuego > 0) {
    const miles = (n: number) => Math.round(n).toLocaleString("es-AR");
    return `${currency} · En juego: ${miles(enJuego)} · Disponible: ${miles(disponible)}`;
  }
  return currency;
}
