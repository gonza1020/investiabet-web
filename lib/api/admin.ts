import { apiFetch } from "./client";
import type {
  AdminSettings,
  AdminUser,
  ApiOkResponse,
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
