import type { BankrollHistoryEntry, Pick } from "@/lib/types/domain";

const EXTERNAL_FLOW_TYPES = new Set(["deposit", "withdraw", "adjustment"]);

export interface MonthlyPerformanceRow {
  key: string;
  label: string;
  count: number;
  pnl: number;
  stake: number;
  yieldPct: number;
  growthRoiPct: number;
}

function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function pickTime(p: Pick): number {
  return new Date(p.placed_at ?? p.resulted_at ?? 0).getTime();
}

export function buildMonthlyPerformance(
  history: Pick[],
  currentBankroll: number,
  bankrollHist: BankrollHistoryEntry[] = [],
  maxRows = 8,
): MonthlyPerformanceRow[] {
  const resolved = history.filter((p) => p.status && p.status !== "pending");
  if (!resolved.length) return [];

  const groups: Record<string, { label: string; count: number; pnl: number; stake: number }> = {};
  const picksByMonth: Record<string, Pick[]> = {};

  for (const p of resolved) {
    const d = new Date(p.resulted_at ?? p.placed_at ?? Date.now());
    const key = monthKeyFromDate(d);
    const label = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = { label, count: 0, pnl: 0, stake: 0 };
    groups[key].count++;
    groups[key].pnl += p.pnl ?? 0;
    groups[key].stake += p.stake_usd ?? 0;
    (picksByMonth[key] ??= []).push(p);
  }

  const flowByMonth: Record<string, number> = {};
  for (const h of bankrollHist) {
    if (!EXTERNAL_FLOW_TYPES.has(h.type) || !h.created_at) continue;
    const key = monthKeyFromDate(new Date(h.created_at));
    flowByMonth[key] = (flowByMonth[key] ?? 0) + h.amount;
  }

  const activityMonths = new Set(Object.keys(groups));
  for (const key of Object.keys(flowByMonth)) activityMonths.add(key);

  const fallbackInitial: Record<string, number> = {};
  let endBankroll = currentBankroll;
  for (const key of [...activityMonths].sort().reverse()) {
    const pnl = groups[key]?.pnl ?? 0;
    const flows = flowByMonth[key] ?? 0;
    const initial = endBankroll - pnl - flows;
    fallbackInitial[key] = initial;
    endBankroll = initial;
  }

  return Object.keys(groups)
    .sort()
    .reverse()
    .slice(0, maxRows)
    .map((key) => {
      const g = groups[key];
      const earliest = [...(picksByMonth[key] ?? [])].sort((a, b) => pickTime(a) - pickTime(b));
      const bankrollBefore = earliest.find((p) => (p.bankroll_before ?? 0) > 0)?.bankroll_before;
      const initial =
        bankrollBefore != null && bankrollBefore > 0 ? bankrollBefore : (fallbackInitial[key] ?? 0);
      const yieldPct = g.stake > 0 ? (g.pnl / g.stake) * 100 : 0;
      const growthRoiPct = initial > 0 ? (g.pnl / initial) * 100 : 0;

      return {
        key,
        label: g.label,
        count: g.count,
        pnl: g.pnl,
        stake: g.stake,
        yieldPct,
        growthRoiPct,
      };
    });
}
