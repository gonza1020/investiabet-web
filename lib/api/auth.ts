import { apiFetch } from "./client";
import { setToken, clearToken } from "@/lib/auth/token";
import type { ApiOkResponse, LoginResponse } from "@/lib/types/domain";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    skipAuthRedirect: true,
  });
  if (data.ok && data.token) {
    setToken(data.token);
  }
  return data;
}

export async function register(body: {
  email: string;
  username: string;
  password: string;
  code: string;
}): Promise<ApiOkResponse> {
  return apiFetch<ApiOkResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: body.email.trim(),
      username: body.username.trim(),
      password: body.password,
      code: body.code.toUpperCase().trim(),
    }),
    skipAuthRedirect: true,
  });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}
