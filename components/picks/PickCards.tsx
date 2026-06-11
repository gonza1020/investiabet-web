"use client";

import { Badge } from "@/components/ui/Badge";
import {
  confLabel,
  dep,
  edgeColor,
  fmt,
  fmtMiles,
} from "@/lib/format";
import type { Pick } from "@/lib/types/domain";

export type PlacedMark = "none" | "placed" | "opposite";

interface BaseCardProps {
  pick: Pick;
  currency?: string;
  showStake: boolean;
  mark: PlacedMark;
  onPlace: () => void;
  placing?: boolean;
  onPlaceFree?: () => void;
}

function DateBadge({ localTime }: { localTime?: string }) {
  if (!localTime) return null;
  return <Badge variant="blue">🕐 {localTime}</Badge>;
}

function BetFooter({
  pick,
  label,
  currency,
  mark,
  onPlace,
  placing,
  variant = "default",
}: {
  pick: Pick;
  label: string;
  currency: string;
  mark: PlacedMark;
  onPlace: () => void;
  placing?: boolean;
  variant?: "default" | "sure" | "live";
}) {
  const ret = pick.odds_ref && pick.odds_ref > 1 ? ((pick.odds_ref - 1) * 100).toFixed(0) : "0";

  const btnStyle =
    variant === "live"
      ? { color: "var(--red)", borderColor: "rgba(239,68,68,.4)", background: "rgba(239,68,68,.1)" }
      : variant === "sure"
        ? { color: "var(--teal)", borderColor: "var(--teal-border)" }
        : undefined;

  const btnLabel =
    mark === "placed"
      ? "✓ Ya colocado"
      : mark === "opposite"
        ? "⚠ Opuesto ya colocado"
        : variant === "live"
          ? placing
            ? "Guardando..."
            : "⚡ Colocar ahora"
          : variant === "sure"
            ? placing
              ? "Guardando..."
              : "✓ Registrar apuesta"
            : placing
              ? "Guardando..."
              : "Registrar apuesta →";

  return (
    <div className="mt-auto border-t border-outline-variant/40 pt-3">
      <span className="font-data-label mb-1 block text-[10px] text-on-surface-variant">{label}</span>
      <div className="text-stat-lg font-bold leading-snug">
        {pick.pick_team}{" "}
        <span className="text-secondary">@{fmt(pick.odds_ref, 2)}</span>
      </div>
      <div className="mb-2 text-xs text-on-surface-variant">{pick.market || "Resultado"}</div>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-1 py-2.5">
          <div className="font-data-label text-[10px] uppercase text-on-surface-variant">Apostar</div>
          <div className="text-stat-lg font-bold">{fmtMiles(pick.stake_usd)}</div>
          <div className="text-[10px] text-on-surface-variant">{currency}</div>
        </div>
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-1 py-2.5">
          <div className="font-data-label text-[10px] uppercase text-on-surface-variant">Ganás</div>
          <div className="text-stat-lg font-bold text-secondary">+{fmtMiles(pick.potential_profit)}</div>
          <div className="text-[10px] text-on-surface-variant">{currency}</div>
        </div>
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-1 py-2.5">
          <div className="font-data-label text-[10px] uppercase text-on-surface-variant">Retorno</div>
          <div className="text-stat-lg font-bold text-blue">+{ret}%</div>
          <div className="text-[10px] text-on-surface-variant">sobre lo apostado</div>
        </div>
      </div>
      <button
        type="button"
        className="btn-colocar w-full justify-center"
        style={mark !== "none" ? btnStyle : btnStyle}
        disabled={mark !== "none" || placing}
        title={mark === "opposite" ? "Ya tenés el lado contrario de esta línea colocado." : ""}
        onClick={onPlace}
      >
        {btnLabel}
      </button>
    </div>
  );
}

function LockedFooter({
  pick,
  mark,
  onPlaceFree,
  placing,
}: {
  pick: Pick;
  mark: PlacedMark;
  onPlaceFree: () => void;
  placing?: boolean;
}) {
  return (
    <div className="mt-auto border-t border-outline-variant/40 pt-3">
      <span className="font-data-label mb-1 block text-[10px] text-on-surface-variant">APUESTA SUGERIDA</span>
      <div className="text-stat-lg font-bold leading-snug">
        {pick.pick_team} <span className="text-secondary">@{fmt(pick.odds_ref, 2)}</span>
      </div>
      <div className="mb-1 text-xs text-on-surface-variant">{pick.market || "Resultado"}</div>
      <p className="mb-3 text-xs" style={{ color: "var(--amber)" }}>
        🔒 Monto sugerido por el motor: Premium
      </p>
      <button
        type="button"
        className="btn-colocar w-full justify-center"
        disabled={mark !== "none" || placing}
        onClick={onPlaceFree}
      >
        {mark === "placed" ? "✓ Ya colocado" : "Registrar apuesta →"}
      </button>
    </div>
  );
}

export function SureBetCard({ pick, currency = "ARS", showStake, mark, onPlace, placing }: BaseCardProps) {
  const conf = Math.round(pick.confidence_pct ?? 0);
  const nc = pick.confidence_level ?? "ALTA";

  return (
    <div className="flex flex-col rounded-xl border border-secondary/20 bg-surface-container p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-data-label text-data-label mb-1 block truncate uppercase text-on-surface-variant">
            {dep(pick.sport)} {pick.sport} • {pick.league ?? ""}
          </span>
          <h3 className="text-stat-lg font-bold leading-snug">{pick.event}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DateBadge localTime={pick.local_time} />
            <Badge variant="teal">🔒 Alta confianza</Badge>
            <Badge variant="gray">{pick.market ?? "Resultado"}</Badge>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data-label text-data-label uppercase text-secondary">Confianza</p>
          <p className="font-display-lg text-display-lg text-secondary">{conf}%</p>
          <p className="text-[10px] text-on-surface-variant">{confLabel(nc)}</p>
        </div>
      </div>
      <div className="mb-4 space-y-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
          <div className="confidence-gradient h-full" style={{ width: `${conf}%` }} />
        </div>
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3">
          <p className="text-xs leading-relaxed text-on-surface-variant">
            <span className="font-bold text-on-surface">Señales:</span>{" "}
            {pick.signals || pick.senales || "Consenso de mercado fuerte."}
          </p>
        </div>
        {showStake && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-surface-container-lowest py-2">
              <div className="text-[10px] text-on-surface-variant">Pinnacle</div>
              <div className="font-bold">{fmt((pick.prob_pinnacle ?? 0) * 100, 0)}%</div>
            </div>
            <div className="rounded-lg bg-surface-container-lowest py-2">
              <div className="text-[10px] text-on-surface-variant">Consenso</div>
              <div className="font-bold">{fmt((pick.prob_consensus ?? 0) * 100, 0)}%</div>
            </div>
            <div className="rounded-lg bg-surface-container-lowest py-2">
              <div className="text-[10px] text-on-surface-variant">Modelo</div>
              <div className="font-bold text-secondary">{fmt((pick.model_prob ?? 0) * 100, 0)}%</div>
            </div>
          </div>
        )}
      </div>
      {showStake ? (
        <BetFooter
          pick={pick}
          label="APUESTA SUGERIDA"
          currency={currency}
          mark={mark}
          onPlace={onPlace}
          placing={placing}
          variant="sure"
        />
      ) : (
        <LockedFooter pick={pick} mark={mark} onPlaceFree={onPlace} placing={placing} />
      )}
    </div>
  );
}

export function ValuePickCard({ pick, currency = "ARS", showStake, mark, onPlace, placing, onPlaceFree }: BaseCardProps) {
  const conf = Math.round((pick.adjusted_prob ?? 0) * 100);
  const edgePct = ((pick.edge ?? 0) * 100).toFixed(1);
  const reason = `La cuota está pagando de más para las chances reales de esta apuesta. Por eso la marcamos como oportunidad de valor.${pick.context_desc && pick.context_desc !== "Sin alertas" ? ` ${pick.context_desc}.` : ""}`;

  return (
    <div
      className={`flex flex-col rounded-xl card-border bg-surface-container p-5 transition-all duration-300 hover:border-secondary/50${pick.is_gold ? " ring-1 ring-violet/20" : ""}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-data-label text-data-label mb-1 block truncate uppercase text-on-surface-variant">
            {dep(pick.sport)} {pick.sport} • {pick.league ?? ""}
          </span>
          <h3 className="text-stat-lg font-bold leading-snug">{pick.event}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DateBadge localTime={pick.local_time} />
            {pick.is_gold && <Badge variant="violet">⭐ Gold</Badge>}
            {pick.categoria === "high_value" && <Badge variant="blue">📈 Alto valor</Badge>}
            {pick.categoria === "seguro" && <Badge variant="teal">✓ Seguro</Badge>}
            {pick.has_pinnacle && <Badge variant="violet">📌 Pinnacle</Badge>}
            <Badge variant="gray">{pick.market ?? "1X2"}</Badge>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data-label uppercase" style={{ color: edgeColor(pick.edge ?? 0) }}>
            Ventaja
          </p>
          <p className="font-display-lg text-display-lg" style={{ color: edgeColor(pick.edge ?? 0) }}>
            +{edgePct}%
          </p>
        </div>
      </div>
      <div className="mb-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Prob. del modelo</span>
          <span className="font-bold text-secondary">{conf}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
          <div className="confidence-gradient h-full" style={{ width: `${conf}%` }} />
        </div>
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3">
          <p className="text-xs leading-relaxed text-on-surface-variant">
            <span className="font-bold text-on-surface">Análisis:</span> {reason}
          </p>
        </div>
      </div>
      {showStake ? (
        <BetFooter pick={pick} label="APUESTA SUGERIDA" currency={currency} mark={mark} onPlace={onPlace} placing={placing} />
      ) : (
        <LockedFooter pick={pick} mark={mark} onPlaceFree={onPlaceFree ?? onPlace} placing={placing} />
      )}
    </div>
  );
}

export function LivePickCard({ pick, currency = "ARS", showStake, mark, onPlace, placing }: BaseCardProps) {
  const conf = Math.round((pick.adjusted_prob ?? 0) * 100);
  const edgePct = ((pick.edge ?? 0) * 100).toFixed(1);
  const impl = pick.odds_ref ? (1 / pick.odds_ref * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col rounded-xl bg-surface-container p-5" style={{ border: "1px solid rgba(239,68,68,.3)" }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-data-label text-data-label mb-1 block truncate uppercase text-on-surface-variant">
            {dep(pick.sport)} {pick.sport} • {pick.league ?? ""}
          </span>
          <h3 className="text-stat-lg font-bold leading-snug">{pick.event}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="red">🔴 VIVO</Badge>
            <DateBadge localTime={pick.local_time} />
            <Badge variant="gray">{pick.market ?? "1X2"}</Badge>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data-label uppercase text-error">Ventaja</p>
          <p className="font-display-lg text-display-lg text-error">+{edgePct}%</p>
        </div>
      </div>
      <div className="mb-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Prob. del modelo</span>
          <span className="font-bold">{conf}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
          <div className="h-full bg-error" style={{ width: `${conf}%` }} />
        </div>
        <p className="text-xs text-on-surface-variant">
          Cuota @{fmt(pick.odds_ref, 2)} implica {impl}%. Verificá la cuota antes de apostar — en vivo cambia rápido.
        </p>
      </div>
      {showStake && (
        <BetFooter pick={pick} label="APUESTA SUGERIDA" currency={currency} mark={mark} onPlace={onPlace} placing={placing} variant="live" />
      )}
    </div>
  );
}

export function FuturePickCard({ pick, currency = "ARS", showStake, mark, onPlace, placing, onPlaceFree }: BaseCardProps) {
  const conf = Math.round((pick.adjusted_prob ?? 0) * 100);
  const edgePct = ((pick.edge ?? 0) * 100).toFixed(1);

  return (
    <div
      className="flex flex-col rounded-xl bg-surface-container p-5"
      style={{
        border: "1px solid rgba(245,158,11,.35)",
        opacity: pick.discarded ? 0.6 : 1,
        borderStyle: pick.discarded ? "dashed" : "solid",
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-data-label text-data-label mb-1 block truncate uppercase text-on-surface-variant">
            {dep(pick.sport)} {pick.sport} • {pick.league ?? ""}
          </span>
          <h3 className="text-stat-lg font-bold leading-snug">{pick.event}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DateBadge localTime={pick.local_time} />
            <Badge variant="amber">🏆 Future</Badge>
            {pick.discarded && <Badge variant="gray">Referencia</Badge>}
            <Badge variant="gray">{pick.market ?? "Campeón"}</Badge>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-data-label uppercase" style={{ color: edgeColor(pick.edge ?? 0) }}>
            Ventaja
          </p>
          <p className="font-display-lg text-display-lg" style={{ color: edgeColor(pick.edge ?? 0) }}>
            +{edgePct}%
          </p>
        </div>
      </div>
      <div className="mb-4 space-y-3">
        <div className={`rounded-lg border bg-surface-container-lowest p-3 ${pick.discarded ? "border-outline-variant/50" : "border-amber/30"}`}>
          <span className="font-data-label mb-1 block text-[10px] text-on-surface-variant">
            {pick.discarded ? "EQUIPO (referencia)" : "🏆 PICK — A CAMPEÓN"}
          </span>
          <span className={`block truncate font-bold ${pick.discarded ? "text-on-surface-variant" : "text-amber"}`}>
            {pick.pick_team} · @{fmt(pick.odds_ref, 2)}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
          <div className="confidence-gradient h-full" style={{ width: `${conf}%` }} />
        </div>
        {pick.discarded ? (
          <p className="text-xs text-error/90">✗ {pick.discard_reason ?? "Sin ventaja suficiente"}</p>
        ) : (
          <p className="text-xs text-on-surface-variant">
            Prob. modelo {conf}% · cuota @{fmt(pick.odds_ref, 2)}.
          </p>
        )}
      </div>
      {!pick.discarded &&
        (showStake ? (
          <BetFooter pick={pick} label="TU ELECCIÓN" currency={currency} mark={mark} onPlace={onPlace} placing={placing} />
        ) : (
          <LockedFooter pick={pick} mark={mark} onPlaceFree={onPlaceFree ?? onPlace} placing={placing} />
        ))}
    </div>
  );
}

export function SkipCard({ pick }: { pick: Pick }) {
  const conf = Math.round((pick.adjusted_prob ?? 0) * 100);
  const ctxMap: Record<string, [string, string]> = {
    champion_early: ["ctx-warn", "⚠ Campeón"],
    relegated: ["ctx-warn", "⬇ Desc."],
    esport: ["ctx-esport", "🎮 Esports"],
    clean: ["ctx-clean", "✓ OK"],
  };
  const [cls, lbl] = ctxMap[pick.context_id ?? ""] ?? ["ctx-warn", pick.context_id ?? ""];

  return (
    <div className="flex flex-col rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-data-label mb-0.5 block text-[10px] text-on-surface-variant">
            <span className={`ctx-tag ${cls}`}>{lbl}</span> {(pick.sport ?? "").toUpperCase()}
          </span>
          <h4 className="truncate text-sm font-bold">{pick.event}</h4>
        </div>
        <span className="shrink-0 font-data-label text-[10px] font-bold uppercase text-error">Skip</span>
      </div>
      <div className="mb-2 truncate text-xs text-on-surface-variant">
        {pick.pick_team} · @{fmt(pick.odds_ref, 2)} · {pick.market ?? "1X2"}
      </div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-on-surface-variant">Prob. modelo</span>
        <span className="font-data-label">{conf}%</span>
      </div>
      <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-surface-variant">
        <div className="h-full bg-error" style={{ width: `${conf}%` }} />
      </div>
      <div className="text-[11px] text-error/90">✗ {pick.discard_reason ?? "Descartado"}</div>
    </div>
  );
}

function sortPicks(arr: Pick[], sortMode: "fecha" | "ventaja"): Pick[] {
  const a = [...arr];
  if (sortMode === "ventaja") {
    a.sort(
      (x, y) =>
        (y.edge ?? y.gold_score ?? y.model_prob ?? 0) -
        (x.edge ?? x.gold_score ?? x.model_prob ?? 0),
    );
  } else {
    a.sort((x, y) => (x.hours_until_start ?? 999) - (y.hours_until_start ?? 999));
  }
  return a;
}

export { sortPicks };
