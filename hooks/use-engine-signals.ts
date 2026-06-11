"use client";

import { getEngineSignals, getEngineSignalStats } from "@/lib/api/admin";
import type { EngineSignalPeriod, EngineSignalType } from "@/lib/types/domain";
import { useQuery } from "@tanstack/react-query";

export function useEngineSignalStats(period: EngineSignalPeriod = "all") {
  return useQuery({
    queryKey: ["admin", "engine-signals", "stats", period],
    queryFn: () => getEngineSignalStats(period),
    refetchInterval: 60_000,
  });
}

export function useEngineSignals(params: {
  period?: EngineSignalPeriod;
  type?: EngineSignalType;
  status?: "pending" | "resolved" | "expired";
  limit?: number;
  offset?: number;
}) {
  const { period = "all", type, status, limit = 50, offset = 0 } = params;
  return useQuery({
    queryKey: [
      "admin",
      "engine-signals",
      "list",
      { period, type, status, limit, offset },
    ],
    queryFn: () =>
      getEngineSignals({ period, type, status, limit, offset }),
  });
}
