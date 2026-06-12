"use client";

import {
  buildSidebarNavItems,
  HOWTO_NAV_ITEM,
  sidebarLinkClass,
  type SidebarNavItem,
} from "@/components/layout/nav-config";
import type { AppPage } from "@/components/layout/app-page";
import Link from "next/link";

interface SidebarProps {
  page: AppPage;
  userPlan: string;
  collapsed: boolean;
  onHowtoOpen: () => void;
  onProfileOpen: () => void;
}

function handleButtonAction(
  item: SidebarNavItem,
  handlers: { onProfileOpen: () => void },
) {
  if (item.type !== "button") return;
  if (item.action === "profile") handlers.onProfileOpen();
}

export function Sidebar({
  page,
  userPlan,
  collapsed,
  onHowtoOpen,
  onProfileOpen,
}: SidebarProps) {
  const items = buildSidebarNavItems(userPlan);
  const handlers = { onProfileOpen };

  return (
    <aside
      className={`app-sidebar${collapsed ? " app-sidebar-collapsed" : ""}`}
      aria-label="Navegación principal"
      aria-expanded={!collapsed}
    >
      <nav className="app-sidebar-nav">
        {items.map((item) => {
          if (item.type === "link") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={sidebarLinkClass(page, item.page, item.adminStyle)}
                title={collapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.action}
              type="button"
              className="sidebar-link w-full text-left"
              title={collapsed ? item.label : undefined}
              onClick={() => handleButtonAction(item, handlers)}
            >
              <span className="material-symbols-outlined sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar-footer">
        <button
          type="button"
          className="sidebar-link w-full text-left"
          title={collapsed ? HOWTO_NAV_ITEM.label : undefined}
          onClick={onHowtoOpen}
        >
          <span className="material-symbols-outlined sidebar-link-icon">{HOWTO_NAV_ITEM.icon}</span>
          <span className="sidebar-link-label">{HOWTO_NAV_ITEM.label}</span>
        </button>
      </div>
    </aside>
  );
}
