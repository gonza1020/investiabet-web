"use client";

import { getStats } from "@/lib/api/stats";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });
}

export function useInvalidateStats() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["stats"] });
}
