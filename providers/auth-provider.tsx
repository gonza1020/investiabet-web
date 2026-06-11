"use client";

import { getMe } from "@/lib/api/account";
import { AUTH_TOKEN_CHANGED_EVENT } from "@/lib/auth/constants";
import { getToken } from "@/lib/auth/token";
import type { User } from "@/lib/types/domain";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User | undefined>;
  invalidateUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const syncToken = () => setHasToken(!!getToken());
    syncToken();
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
    return () => window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, syncToken);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getMe,
    enabled: hasToken,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const refreshUser = useCallback(async () => {
    if (!getToken()) return undefined;
    return queryClient.fetchQuery({ queryKey: ["user"], queryFn: getMe });
  }, [queryClient]);

  const invalidateUser = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isLoading: hasToken ? isLoading : false,
      isAuthenticated: !!user && !!getToken(),
      refreshUser,
      invalidateUser,
    }),
    [user, isLoading, hasToken, refreshUser, invalidateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used within AuthProvider");
  return ctx;
}
