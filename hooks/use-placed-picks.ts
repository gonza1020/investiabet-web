"use client";

import { getStats } from "@/lib/api/stats";
import { lineKey } from "@/lib/format";
import type { PlacedCache, Pick } from "@/lib/types/domain";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

function buildPlacedCache(stats: {
  pending_picks?: Pick[];
  history?: Pick[];
}): PlacedCache {
  const ahora = Date.now();
  const todos = (stats.pending_picks ?? []).concat(
    (stats.history ?? []).filter((p) => {
      if (!p.placed_at) return false;
      return ahora - new Date(p.placed_at).getTime() < 48 * 60 * 60 * 1000;
    }),
  );
  const exactos = new Set<string>();
  const events = new Set<string>();
  const opuestos = new Set<string>();
  todos.forEach((p) => {
    const ev = (p.event ?? "").toLowerCase().trim();
    const ep = (p.pick_team ?? "").toLowerCase().trim();
    exactos.add(`${ev}|${ep}`);
    events.add(ev);
    const lk = lineKey(p.pick_team ?? "");
    if (lk) opuestos.add(`${ev}|${lk}`);
  });
  return { exactos, events, opuestos, ts: ahora };
}

export function usePlacedPicks() {
  const query = useQuery({
    queryKey: ["stats", "placed"],
    queryFn: getStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const cache = useMemo(
    () => (query.data ? buildPlacedCache(query.data) : null),
    [query.data],
  );

  const getMark = (event: string, pickTeam: string) => {
    if (!cache) return "none" as const;
    const ev = event.toLowerCase().trim();
    const pick = pickTeam.toLowerCase().trim();
    const lk = lineKey(pickTeam);
    if (cache.exactos.has(`${ev}|${pick}`) || cache.events.has(ev)) {
      return "placed" as const;
    }
    if (lk && cache.opuestos.has(`${ev}|${lk}`) && !cache.exactos.has(`${ev}|${pick}`)) {
      return "opposite" as const;
    }
    return "none" as const;
  };

  return { cache, getMark, refetch: query.refetch };
}
