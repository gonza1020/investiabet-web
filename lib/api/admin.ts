import { apiFetch } from "./client";
import type {
  AdminSettings,
  AdminUser,
  ApiOkResponse,
  EngineSignalOverrideResultResponse,
  EngineSignalPeriod,
  EngineSignalStatus,
  EngineSignalSuggestResultResponse,
  EngineSignalType,
  EngineSignalsListResponse,
  EngineSignalsStatsResponse,
  Invitation,
} from "@/lib/types/domain";

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/admin/users");
}

export async function createAdminUser(body: {
  email: string;
  username: string;
  password: string;
  plan: string;
}): Promise<
  ApiOkResponse & {
    email?: string;
    password?: string;
    plan?: string;
  }
> {
  return apiFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function changeUserPlan(
  userId: number,
  plan: string,
): Promise<ApiOkResponse> {
  return apiFetch(`/api/admin/user/${userId}/plan`, {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

export async function toggleUserActive(
  userId: number,
  active: boolean,
): Promise<ApiOkResponse> {
  return apiFetch(`/api/admin/user/${userId}/active`, {
    method: "POST",
    body: JSON.stringify({ active }),
  });
}

export async function getInvitations(): Promise<Invitation[]> {
  return apiFetch<Invitation[]>("/api/admin/invitations");
}

export async function generateInvitation(body: {
  plan: string;
  max_uses: number;
}): Promise<ApiOkResponse & { code?: string }> {
  return apiFetch("/api/admin/invitation", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAdminSettings(): Promise<AdminSettings> {
  return apiFetch<AdminSettings>("/api/admin/settings");
}

export async function saveWindowHours(hours: number): Promise<ApiOkResponse> {
  return apiFetch("/api/admin/settings/window-hours", {
    method: "POST",
    body: JSON.stringify({ hours }),
  });
}

export async function getEngineSignalStats(
  period: EngineSignalPeriod = "all",
): Promise<EngineSignalsStatsResponse> {
  return apiFetch<EngineSignalsStatsResponse>(
    `/api/admin/engine-signals/stats?period=${period}`,
  );
}

export interface GetEngineSignalsParams {
  period?: EngineSignalPeriod;
  type?: EngineSignalType;
  status?: "pending" | "resolved" | "expired";
  limit?: number;
  offset?: number;
}

export async function getEngineSignals(
  params: GetEngineSignalsParams = {},
): Promise<EngineSignalsListResponse> {
  const search = new URLSearchParams();
  search.set("period", params.period ?? "all");
  if (params.type) search.set("type", params.type);
  if (params.status) search.set("status", params.status);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  return apiFetch<EngineSignalsListResponse>(
    `/api/admin/engine-signals?${search.toString()}`,
  );
}

export async function suggestEngineSignalResult(
  id: number,
  body: { score_home: number; score_away: number },
): Promise<EngineSignalSuggestResultResponse> {
  return apiFetch(`/api/admin/engine-signals/${id}/suggest-result`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function overrideEngineSignalResult(
  id: number,
  body: {
    status: EngineSignalStatus;
    score_home?: number;
    score_away?: number;
    reason?: string;
  },
): Promise<EngineSignalOverrideResultResponse> {
  return apiFetch(`/api/admin/engine-signals/${id}/result`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
