import { apiFetch } from "./client";
import type { ApiOkResponse, Pick, PicksResponse } from "@/lib/types/domain";

export async function getPicks(): Promise<PicksResponse> {
  return apiFetch<PicksResponse>("/api/picks");
}

export async function placePick(pick: Pick & { type?: string }): Promise<
  ApiOkResponse & { en_juego?: number; disponible?: number; error?: string }
> {
  return apiFetch("/api/picks/place", {
    method: "POST",
    body: JSON.stringify(pick),
  });
}

export async function triggerScan(): Promise<Response> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("sb_token") || sessionStorage.getItem("sb_token")
      : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  return fetch(`${API_URL}/api/scan`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function createManualPick(data: Record<string, unknown>): Promise<
  ApiOkResponse & { pnl?: number; new_bankroll?: number }
> {
  return apiFetch("/api/picks/manual", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markPickResult(
  pickId: number,
  data: Record<string, unknown>,
): Promise<ApiOkResponse & { pnl?: number; new_bankroll?: number }> {
  return apiFetch(`/api/picks/${pickId}/result`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function editPickResult(
  pickId: number,
  data: Record<string, unknown>,
): Promise<
  ApiOkResponse & { new_pnl?: number; new_bankroll?: number }
> {
  return apiFetch(`/api/picks/${pickId}/edit`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePick(
  pickId: number,
): Promise<ApiOkResponse & { disponible?: number; new_bankroll?: number }> {
  return apiFetch(`/api/picks/${pickId}`, { method: "DELETE" });
}

export async function autoResults(): Promise<
  ApiOkResponse & {
    suggestions?: Array<{
      pick_db_id: number;
      suggested: string;
      score_home?: number;
      score_away?: number;
      reason?: string;
    }>;
    message?: string;
    errores?: string[];
  }
> {
  return apiFetch("/api/picks/auto-results", { method: "POST" });
}
