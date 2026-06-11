"use client";

import { getPicks } from "@/lib/api/picks";
import { useQuery } from "@tanstack/react-query";

export function usePicks(enabled = true) {
  return useQuery({
    queryKey: ["picks"],
    queryFn: getPicks,
    enabled,
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}
