"use client";

import { Badge } from "@/components/ui/Badge";
import {
  buildSidebarNavItems,
  HOWTO_NAV_ITEM,
  sidebarLinkClass,
  type SidebarNavItem,
} from "@/components/layout/nav-config";
import type { AppPage } from "@/components/layout/app-page";
import type { User } from "@/lib/types/domain";
import Link from "next/link";

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

interface SidebarProps {
  page: AppPage;
  user: User;
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

export function Sidebar({ page, user, onHowtoOpen, onProfileOpen }: SidebarProps) {
  const items = buildSidebarNavItems(user.plan);
  const handlers = { onProfileOpen };

  return (
    <aside className="app-sidebar" aria-label="Navegación principal">
      <div className="app-sidebar-brand">
        <span className="app-sidebar-title">InvestiaBet</span>
        <Badge variant={planVariants[user.plan] ?? "gray"}>
          {planLabels[user.plan] ?? user.plan}
        </Badge>
      </div>

      <nav className="app-sidebar-nav">
        {items.map((item) => {
          if (item.type === "link") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={sidebarLinkClass(page, item.page, item.adminStyle)}
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
              onClick={() => handleButtonAction(item, handlers)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar-footer">
        <button type="button" className="sidebar-link w-full text-left" onClick={onHowtoOpen}>
          <span className="material-symbols-outlined text-[20px]">{HOWTO_NAV_ITEM.icon}</span>
          <span>{HOWTO_NAV_ITEM.label}</span>
        </button>
      </div>
    </aside>
  );
}
