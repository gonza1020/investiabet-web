"use client";

import { HowtoModal } from "@/components/layout/HowtoModal";
import { ProfileModal } from "@/components/layout/ProfileModal";
import { Topbar, type AppPage } from "@/components/layout/Topbar";
import { useUser } from "@/providers/auth-provider";
import type { User } from "@/lib/types/domain";
import { useCallback, useEffect, useState, type ReactNode } from "react";

interface AppShellProps {
  page: AppPage;
  children: ReactNode;
  scanBadge?: { className: string; text: string };
  lastScan?: string;
  onScanComplete?: () => void;
  onProfileSaved?: (user: User) => void;
}

export function AppShell({
  page,
  children,
  scanBadge,
  lastScan,
  onScanComplete,
  onProfileSaved,
}: AppShellProps) {
  const { user, isLoading, refreshUser } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [howtoOpen, setHowtoOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("has-app-topbar");
    return () => document.body.classList.remove("has-app-topbar");
  }, []);

  const handleSaved = useCallback(
    async (updated: User) => {
      await refreshUser();
      onProfileSaved?.(updated);
    },
    [refreshUser, onProfileSaved],
  );

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined spin mr-2">progress_activity</span>
        Cargando…
      </div>
    );
  }

  return (
    <>
      <Topbar
        page={page}
        user={user}
        scanBadge={scanBadge}
        lastScan={lastScan}
        onProfileOpen={() => setProfileOpen(true)}
        onHowtoOpen={() => setHowtoOpen(true)}
        onScanComplete={onScanComplete}
      />
      {children}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onSaved={handleSaved}
      />
      <HowtoModal open={howtoOpen} onClose={() => setHowtoOpen(false)} />
    </>
  );
}
