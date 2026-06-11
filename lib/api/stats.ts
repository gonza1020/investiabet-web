import { apiFetch } from "./client";
import type { StatsResponse } from "@/lib/types/domain";

export async function getStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>("/api/stats");
}
