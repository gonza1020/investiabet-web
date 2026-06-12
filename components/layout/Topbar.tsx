"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { AppPage } from "@/components/layout/app-page";
import { logout } from "@/lib/api/auth";
import { triggerScan } from "@/lib/api/picks";
import type { User } from "@/lib/types/domain";
import { useCallback, useEffect, useRef, useState } from "react";

export type { AppPage } from "@/components/layout/app-page";

interface TopbarProps {
  page: AppPage;
  user: User;
  scanBadge?: { className: string; text: string };
  lastScan?: string;
  onScanComplete?: () => void;
  onMenuOpen?: () => void;
}

export function Topbar({
  page,
  user,
  scanBadge,
  lastScan,
  onScanComplete,
  onMenuOpen,
}: TopbarProps) {
  const barRef = useRef<HTMLElement>(null);
  const [scanning, setScanning] = useState(false);

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

  return (
    <header className="app-topbar" id="app-topbar" ref={barRef}>
      <div className="app-topbar-inner">
        <button
          type="button"
          className="app-topbar-menu-btn navbtn"
          aria-label="Abrir menú"
          onClick={onMenuOpen}
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

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
              className="app-topbar-action-btn"
              disabled={scanning}
              onClick={handleScan}
            >
              <span
                className={`material-symbols-outlined text-[20px]${scanning ? " spin" : ""}`}
              >
                refresh
              </span>
              <span>{scanning ? "Escaneando…" : "Escanear"}</span>
            </button>
          )}
          <ThemeToggle className="app-topbar-action-btn" />
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
    </header>
  );
}
