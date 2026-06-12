import type { EngineSignal } from "@/lib/types/domain";

export type MarketKind =
  | "h2h"
  | "totals"
  | "spreads"
  | "btts"
  | "outright"
  | "other";

export function detectMarketKind(market?: string): MarketKind {
  const m = (market ?? "").toLowerCase();
  if (m.includes("outright") || m.includes("campeón") || m.includes("campeon")) {
    return "outright";
  }
  if (m.includes("over/under") || m.includes("totals")) return "totals";
  if (m.includes("hándicap") || m.includes("handicap") || m.includes("spreads")) {
    return "spreads";
  }
  if (m.includes("ambos") || m.includes("btts")) return "btts";
  if (m.includes("resultado") || m.includes("h2h") || !m) return "h2h";
  return "other";
}

export function scoreLabelsForSport(sport?: string): {
  home: string;
  away: string;
} {
  const s = (sport ?? "").toLowerCase();
  if (s.includes("básquet") || s.includes("basquet") || s.includes("basketball")) {
    return { home: "Puntos local", away: "Puntos visit." };
  }
  if (s.includes("béisbol") || s.includes("beisbol") || s.includes("baseball")) {
    return { home: "Runs local", away: "Runs visit." };
  }
  if (s.includes("tenis") || s.includes("tennis")) {
    return { home: "Games local", away: "Games visit." };
  }
  return { home: "Goles local", away: "Goles visit." };
}

function effectiveScores(signal: EngineSignal): {
  score_home?: number;
  score_away?: number;
} {
  if (
    signal.status === "expired" &&
    signal.hypothetical_score_home != null &&
    signal.hypothetical_score_away != null
  ) {
    return {
      score_home: signal.hypothetical_score_home,
      score_away: signal.hypothetical_score_away,
    };
  }
  return { score_home: signal.score_home, score_away: signal.score_away };
}

export function formatSignalScore(signal: EngineSignal): string {
  const kind = detectMarketKind(signal.market);
  const { score_home: sh, score_away: sa } = effectiveScores(signal);

  if (sh == null || sa == null) {
    if (kind === "btts" && signal.status && signal.status !== "pending") {
      return signal.pick_team ?? "—";
    }
    return "—";
  }

  if (kind === "totals" && signal.total_point != null) {
    const total = sh + sa;
    const line = Number(signal.total_point);
    const side = (signal.pick_team ?? "").toLowerCase().startsWith("over")
      ? "O"
      : "U";
    return `${total} (${side}${line}) · ${sh}-${sa}`;
  }

  return `${sh}-${sa}`;
}

export function marketKindShowsScores(kind: MarketKind): boolean {
  return kind !== "outright";
}

export function marketKindSupportsSuggestion(kind: MarketKind): boolean {
  return kind === "h2h" || kind === "totals" || kind === "spreads" || kind === "btts";
}
