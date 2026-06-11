import { apiFetch } from "./client";
import type {
  AdminSettings,
  AdminUser,
  ApiOkResponse,
  EngineSignalOverrideResultResponse,
  EngineSignalPeriod,
  EngineSignalsListResponse,
  EngineSignalsStatsResponse,
  EngineSignalStatus,
  EngineSignalSuggestResultResponse,
  EngineSignalType,
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

export async function getEngineSignals(params: {
  period?: EngineSignalPeriod;
  type?: EngineSignalType;
  status?: "pending" | "resolved" | "expired";
  limit?: number;
  offset?: number;
}): Promise<EngineSignalsListResponse> {
  const qs = new URLSearchParams();
  qs.set("period", params.period ?? "all");
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));
  return apiFetch<EngineSignalsListResponse>(
    `/api/admin/engine-signals?${qs.toString()}`,
  );
}

export async function suggestEngineSignalResult(
  signalId: number,
  body: { score_home: number; score_away: number },
): Promise<EngineSignalSuggestResultResponse> {
  return apiFetch(`/api/admin/engine-signals/${signalId}/suggest-result`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function overrideEngineSignalResult(
  signalId: number,
  body: {
    status: EngineSignalStatus;
    score_home?: number;
    score_away?: number;
    reason?: string;
  },
): Promise<EngineSignalOverrideResultResponse> {
  return apiFetch(`/api/admin/engine-signals/${signalId}/result`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
