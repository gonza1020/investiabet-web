"use client";

import { Badge } from "@/components/ui/Badge";
import { logout } from "@/lib/api/auth";
import { triggerScan } from "@/lib/api/picks";
import type { User } from "@/lib/types/domain";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type AppPage = "picks" | "stats" | "admin";

interface TopbarProps {
  page: AppPage;
  user: User;
  scanBadge?: { className: string; text: string };
  lastScan?: string;
  onProfileOpen: () => void;
  onHowtoOpen: () => void;
  onScanComplete?: () => void;
}

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

export function Topbar({
  page,
  user,
  scanBadge,
  lastScan,
  onProfileOpen,
  onHowtoOpen,
  onScanComplete,
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

  const navClass = (id: AppPage) => (id === page ? "navbtn navbtn-active" : "navbtn");

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
        <div className="app-topbar-left">
          <span className="app-topbar-brand">InvestiaBet</span>
          <Badge variant={planVariants[user.plan] ?? "gray"}>
            {planLabels[user.plan] ?? user.plan}
          </Badge>
          {page === "picks" && scanBadge && (
            <>
              <span className={scanBadge.className}>{scanBadge.text}</span>
              {lastScan && (
                <span className="hidden text-xs text-on-surface-variant lg:inline">
                  {lastScan}
                </span>
              )}
            </>
          )}
        </div>
        <div className="app-topbar-right">
          <Link href="/" className={navClass("picks")}>
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            <span className="hidden sm:inline">Picks</span>
          </Link>
          <Link href="/stats" className={navClass("stats")}>
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
            <span className="hidden sm:inline">Estadísticas</span>
          </Link>
          <button type="button" className="navbtn" onClick={onHowtoOpen}>
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span className="hidden sm:inline">Cómo usar</span>
          </button>
          <button type="button" className="navbtn" onClick={onProfileOpen}>
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span className="hidden sm:inline">Perfil</span>
          </button>
          {showScan && (
            <button type="button" className="navbtn" disabled={scanning} onClick={handleScan}>
              <span className={`material-symbols-outlined text-[18px]${scanning ? " spin" : ""}`}>
                refresh
              </span>
              <span className="hidden sm:inline">{scanning ? "Escaneando…" : "Escanear"}</span>
            </button>
          )}
          {user.plan === "admin" && (
            <Link
              href="/admin"
              className={`navbtn navbtn-admin ${page === "admin" ? "navbtn-active" : ""}`}
            >
              Admin
            </Link>
          )}
          <button type="button" className="navbtn" onClick={() => logout()}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
