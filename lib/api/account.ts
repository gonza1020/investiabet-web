import { apiFetch } from "./client";
import type { ApiOkResponse, User } from "@/lib/types/domain";

export async function getMe(): Promise<User> {
  return apiFetch<User>("/api/me");
}

export async function updateProfile(data: {
  bankroll?: number;
  currency?: string;
  risk_profile?: string;
  kelly_fraction?: number;
  max_stake_pct?: number;
}): Promise<ApiOkResponse> {
  return apiFetch<ApiOkResponse>("/api/me/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function changePassword(
  current_password: string,
  new_password: string,
): Promise<ApiOkResponse> {
  return apiFetch<ApiOkResponse>("/api/me/password", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });
}

export async function adjustBankroll(body: {
  amount: number;
  type: string;
  description?: string;
}): Promise<ApiOkResponse & { new_bankroll?: number }> {
  return apiFetch("/api/me/bankroll", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function revertBankrollAdjustment(
  historyId: number,
): Promise<ApiOkResponse & { new_bankroll?: number }> {
  return apiFetch(`/api/me/bankroll/revertir/${historyId}`, { method: "POST" });
}
