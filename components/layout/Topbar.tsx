"use client";

import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { buildNavItems, navClass } from "@/components/layout/nav-config";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
  const navItems = buildNavItems(page, user.plan, showScan);

  return (
    <>
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

          <button
            type="button"
            className="navbtn md:hidden"
            aria-label="Abrir menú"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <div className="app-topbar-right hidden md:flex">
            {navItems.map((item) => {
              if (item.type === "link") {
                const cls = item.adminStyle
                  ? `navbtn navbtn-admin ${page === item.page ? "navbtn-active" : ""}`
                  : navClass(page, item.page);
                return (
                  <Link key={item.href} href={item.href} className={cls}>
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              }

              if (item.action === "logout") {
                return (
                  <button
                    key={item.action}
                    type="button"
                    className="navbtn"
                    onClick={() => logout()}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  </button>
                );
              }

              const onClick =
                item.action === "howto"
                  ? onHowtoOpen
                  : item.action === "profile"
                    ? onProfileOpen
                    : handleScan;

              const label =
                item.action === "scan" && scanning
                  ? (item.scanningLabel ?? item.label)
                  : item.label;

              return (
                <button
                  key={item.action}
                  type="button"
                  className="navbtn"
                  disabled={item.action === "scan" && scanning}
                  onClick={onClick}
                >
                  <span
                    className={`material-symbols-outlined text-[18px]${item.action === "scan" && scanning ? " spin" : ""}`}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <MobileNavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        page={page}
        userPlan={user.plan}
        showScan={showScan}
        scanning={scanning}
        onHowtoOpen={onHowtoOpen}
        onProfileOpen={onProfileOpen}
        onScan={handleScan}
        onLogout={() => logout()}
      />
    </>
  );
}
