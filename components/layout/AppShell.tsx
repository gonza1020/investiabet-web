"use client";

import { HowtoModal } from "@/components/layout/HowtoModal";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { ProfileModal } from "@/components/layout/ProfileModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar, type AppPage } from "@/components/layout/Topbar";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } = useSidebarCollapsed();

  const handleMenuClick = useCallback(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      toggleSidebar();
      return;
    }
    setDrawerOpen((open) => !open);
  }, [toggleSidebar]);

  useEffect(() => {
    document.body.classList.add("has-app-shell");
    return () => document.body.classList.remove("has-app-shell");
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
      <div className="app-shell">
        <Topbar
          page={page}
          user={user}
          scanBadge={scanBadge}
          lastScan={lastScan}
          onScanComplete={onScanComplete}
          sidebarCollapsed={sidebarCollapsed}
          mobileMenuOpen={drawerOpen}
          onMenuClick={handleMenuClick}
        />

        <div className="app-shell-body">
          <Sidebar
            page={page}
            userPlan={user.plan}
            collapsed={sidebarCollapsed}
            onHowtoOpen={() => setHowtoOpen(true)}
            onProfileOpen={() => setProfileOpen(true)}
          />
          <div className="app-shell-content custom-scrollbar">{children}</div>
        </div>
      </div>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        page={page}
        user={user}
        onHowtoOpen={() => setHowtoOpen(true)}
        onProfileOpen={() => setProfileOpen(true)}
      />

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
