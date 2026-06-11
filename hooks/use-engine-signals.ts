"use client";

import {
  getEngineSignalStats,
  getEngineSignals,
  overrideEngineSignalResult,
  type GetEngineSignalsParams,
} from "@/lib/api/admin";
import type {
  EngineSignalPeriod,
  EngineSignalStatus,
} from "@/lib/types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEngineSignalStats(period: EngineSignalPeriod = "all") {
  return useQuery({
    queryKey: ["admin", "engine-signals", "stats", period],
    queryFn: () => getEngineSignalStats(period),
  });
}

export function useEngineSignals(filters: GetEngineSignalsParams = {}) {
  return useQuery({
    queryKey: ["admin", "engine-signals", "list", filters],
    queryFn: () => getEngineSignals(filters),
  });
}

export function useOverrideEngineSignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: number;
      status: EngineSignalStatus;
      score_home?: number;
      score_away?: number;
      reason?: string;
    }) => overrideEngineSignalResult(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "engine-signals", "stats"] });
      void qc.invalidateQueries({ queryKey: ["admin", "engine-signals", "list"] });
    },
  });
}
