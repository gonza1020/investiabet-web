import type { AppPage } from "@/components/layout/app-page";

export interface NavLinkItem {
  type: "link";
  href: string;
  page: AppPage;
  icon: string;
  label: string;
  adminStyle?: boolean;
}

export interface NavButtonItem {
  type: "button";
  action: "howto" | "profile";
  icon: string;
  label: string;
}

export type SidebarNavItem = NavLinkItem | NavButtonItem;

export function sidebarLinkClass(page: AppPage, id: AppPage, adminStyle?: boolean): string {
  const base = "sidebar-link";
  if (page !== id) return base;
  return adminStyle ? `${base} sidebar-link-admin-active` : `${base} sidebar-link-active`;
}

export function buildSidebarNavItems(userPlan: string): SidebarNavItem[] {
  const items: SidebarNavItem[] = [
    { type: "link", href: "/", page: "picks", icon: "monitoring", label: "Picks" },
    { type: "link", href: "/stats", page: "stats", icon: "query_stats", label: "Estadísticas" },
    { type: "button", action: "profile", icon: "person", label: "Perfil" },
  ];

  if (userPlan === "admin") {
    items.push({
      type: "link",
      href: "/admin",
      page: "admin",
      icon: "admin_panel_settings",
      label: "Admin",
      adminStyle: true,
    });
  }

  return items;
}

export const HOWTO_NAV_ITEM: NavButtonItem = {
  type: "button",
  action: "howto",
  icon: "rocket_launch",
  label: "Cómo usar",
};
