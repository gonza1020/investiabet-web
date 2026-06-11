"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  buildNavItems,
  navClass,
  type NavItem,
} from "@/components/layout/nav-config";
import type { AppPage } from "@/components/layout/Topbar";
import { useIsDesktop } from "@/hooks/use-media-query";
import Link from "next/link";
import { useEffect } from "react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  page: AppPage;
  userPlan: string;
  showScan: boolean;
  scanning: boolean;
  onHowtoOpen: () => void;
  onProfileOpen: () => void;
  onScan: () => void;
  onLogout: () => void;
}

function handleButtonAction(
  item: NavItem,
  handlers: {
    onHowtoOpen: () => void;
    onProfileOpen: () => void;
    onScan: () => void;
    onLogout: () => void;
    onClose: () => void;
  }
) {
  if (item.type !== "button") return;
  switch (item.action) {
    case "howto":
      handlers.onHowtoOpen();
      handlers.onClose();
      break;
    case "profile":
      handlers.onProfileOpen();
      handlers.onClose();
      break;
    case "scan":
      handlers.onScan();
      break;
    case "logout":
      handlers.onLogout();
      break;
  }
}

export function MobileNavDrawer({
  open,
  onClose,
  page,
  userPlan,
  showScan,
  scanning,
  onHowtoOpen,
  onProfileOpen,
  onScan,
  onLogout,
}: MobileNavDrawerProps) {
  const isDesktop = useIsDesktop();
  const items = buildNavItems(page, userPlan, showScan);

  useEffect(() => {
    if (isDesktop && open) onClose();
  }, [isDesktop, open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const buttonHandlers = { onHowtoOpen, onProfileOpen, onScan, onLogout, onClose };

  return (
    <div className="mobile-nav-overlay" onClick={onClose} role="presentation">
      <nav
        className="mobile-nav-drawer"
        aria-label="Menú de navegación"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav-header">
          <span className="font-semibold text-on-surface">Menú</span>
          <button
            type="button"
            className="navbtn"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mobile-nav-items">
          {items.map((item) => {
            if (item.type === "link") {
              const cls = item.adminStyle
                ? `navbtn navbtn-admin w-full justify-start ${page === item.page ? "navbtn-active" : ""}`
                : `${navClass(page, item.page)} w-full justify-start`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cls}
                  onClick={onClose}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            }

            const label =
              item.action === "scan" && scanning
                ? (item.scanningLabel ?? item.label)
                : item.label;

            return (
              <button
                key={item.action}
                type="button"
                className="navbtn w-full justify-start"
                disabled={item.action === "scan" && scanning}
                onClick={() => handleButtonAction(item, buttonHandlers)}
              >
                <span
                  className={`material-symbols-outlined text-[18px]${item.action === "scan" && scanning ? " spin" : ""}`}
                >
                  {item.icon}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        <div className="mobile-nav-footer">
          <span className="text-xs text-on-surface-variant">Tema</span>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
