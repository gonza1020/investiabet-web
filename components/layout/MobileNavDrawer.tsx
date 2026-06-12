"use client";

import {
  buildSidebarNavItems,
  HOWTO_NAV_ITEM,
  sidebarLinkClass,
  type SidebarNavItem,
} from "@/components/layout/nav-config";
import type { AppPage } from "@/components/layout/app-page";
import type { User } from "@/lib/types/domain";
import { useIsDesktop } from "@/hooks/use-media-query";
import Link from "next/link";
import { useEffect } from "react";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  page: AppPage;
  user: User;
  onHowtoOpen: () => void;
  onProfileOpen: () => void;
}

function handleButtonAction(
  item: SidebarNavItem,
  handlers: {
    onProfileOpen: () => void;
    onClose: () => void;
  },
) {
  if (item.type !== "button") return;
  if (item.action === "profile") {
    handlers.onProfileOpen();
    handlers.onClose();
  }
}

export function MobileNavDrawer({
  open,
  onClose,
  page,
  user,
  onHowtoOpen,
  onProfileOpen,
}: MobileNavDrawerProps) {
  const isDesktop = useIsDesktop();
  const items = buildSidebarNavItems(user.plan);

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

  const buttonHandlers = { onProfileOpen, onClose };

  return (
    <div className="mobile-nav-overlay" onClick={onClose} role="presentation">
      <aside
        className="mobile-nav-drawer"
        aria-label="Menú de navegación"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav-header">
          <span className="font-semibold text-on-surface">Menú</span>
          <button
            type="button"
            className="mobile-nav-close-btn navbtn"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="app-sidebar-nav">
          {items.map((item) => {
            if (item.type === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={sidebarLinkClass(page, item.page, item.adminStyle)}
                  onClick={onClose}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.action}
                type="button"
                className="sidebar-link w-full text-left"
                onClick={() => handleButtonAction(item, buttonHandlers)}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="app-sidebar-footer">
          <button
            type="button"
            className="sidebar-link w-full text-left"
            onClick={() => {
              onHowtoOpen();
              onClose();
            }}
          >
            <span className="material-symbols-outlined text-[20px]">{HOWTO_NAV_ITEM.icon}</span>
            <span>{HOWTO_NAV_ITEM.label}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
