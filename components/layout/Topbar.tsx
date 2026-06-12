"use client";

import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { AppPage } from "@/components/layout/app-page";
import { logout } from "@/lib/api/auth";
import { triggerScan } from "@/lib/api/picks";
import type { User } from "@/lib/types/domain";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useCallback, useEffect, useRef, useState } from "react";

export type { AppPage } from "@/components/layout/app-page";

const planLabels: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  admin: "Admin",
};

const planVariants: Record<string, "gray" | "teal" | "violet"> = {
  free: "gray",
  premium: "teal",
  admin: "violet",
};

interface TopbarProps {
  page: AppPage;
  user: User;
  scanBadge?: { className: string; text: string };
  lastScan?: string;
  onScanComplete?: () => void;
  sidebarCollapsed?: boolean;
  mobileMenuOpen?: boolean;
  onMenuClick?: () => void;
}

export function Topbar({
  page,
  user,
  scanBadge,
  lastScan,
  onScanComplete,
  sidebarCollapsed = false,
  mobileMenuOpen = false,
  onMenuClick,
}: TopbarProps) {
  const barRef = useRef<HTMLElement>(null);
  const [scanning, setScanning] = useState(false);
  const isDesktop = useIsDesktop();

  const syncHeight = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    document.documentElement.style.setProperty("--app-topbar-h", `${bar.offsetHeight}px`);
  }, []);

  useEffect(() => {
    syncHeight();
    window.addEventListener("resize", syncHeight);
    return () => window.removeEventListener("resize", syncHeight);
  }, [syncHeight, scanBadge, lastScan]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const r = await triggerScan();
      if (r.status === 403) return;
      window.setTimeout(() => onScanComplete?.(), 3000);
    } finally {
      setScanning(false);
    }
  };

  const showScan = user.plan !== "free";
  const menuOpen = isDesktop ? !sidebarCollapsed : mobileMenuOpen;
  const menuLabel = menuOpen ? "Cerrar menú" : "Abrir menú";
  const menuIcon = menuOpen ? "close" : "menu";

  return (
    <header className="app-topbar" id="app-topbar" ref={barRef}>
      <div className="app-topbar-menu-slot">
        <button
          type="button"
          className="app-topbar-menu-btn navbtn"
          aria-label={menuLabel}
          aria-expanded={menuOpen}
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined text-[22px]">{menuIcon}</span>
        </button>
      </div>

      <div className="app-topbar-inner">
        <div className="app-topbar-main">
          <div className="app-topbar-start">
            <span className="app-topbar-brand">InvestiaBet</span>
            <Badge variant={planVariants[user.plan] ?? "gray"}>
              {planLabels[user.plan] ?? user.plan}
            </Badge>
          </div>

          {page === "picks" && scanBadge && (
            <div className="app-topbar-status">
              <div className="app-topbar-status-row">
                <span
                  className={`app-topbar-status-dot${scanBadge.className.includes("b-amber") ? " app-topbar-status-dot-pending" : ""}`}
                />
                <span className="app-topbar-status-label">
                  {scanBadge.text.replace(/^●\s*/, "")}
                </span>
              </div>
              {lastScan && <span className="app-topbar-last-scan">{lastScan}</span>}
            </div>
          )}

          <div className="app-topbar-actions">
            {showScan && (
              <button
                type="button"
                className="app-topbar-icon-btn"
                disabled={scanning}
                onClick={handleScan}
                aria-label={scanning ? "Escaneando…" : "Escanear"}
                title={scanning ? "Escaneando…" : "Escanear"}
              >
                <span
                  className={`material-symbols-outlined text-[20px]${scanning ? " spin" : ""}`}
                >
                  refresh
                </span>
              </button>
            )}
            <ThemeToggle />
            <button
              type="button"
              className="app-topbar-logout-btn"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={() => logout()}
            >
              <span className="material-symbols-outlined text-[24px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
