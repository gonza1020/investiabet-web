import { clearToken, getToken } from "@/lib/auth/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    body: string,
  ) {
    super(`API ${status}: ${body}`);
    this.name = "ApiError";
  }
}

type FetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
  skipAdminRedirect?: boolean;
};

export async function apiFetch<T>(
  path: string,
  init: FetchOptions = {},
): Promise<T> {
  const { skipAuthRedirect, skipAdminRedirect, ...fetchInit } = init;
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchInit,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchInit.headers ?? {}),
    },
  });

  if (res.status === 401 && !skipAuthRedirect) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  if (res.status === 403 && !skipAdminRedirect) {
    if (typeof window !== "undefined" && path.startsWith("/api/admin")) {
      window.location.href = "/";
    }
    const body = await res.text();
    throw new ApiError(403, body);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
