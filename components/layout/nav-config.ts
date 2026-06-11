import type { AppPage } from "@/components/layout/Topbar";

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
  action: "howto" | "profile" | "scan" | "logout";
  icon: string;
  label: string;
  scanningLabel?: string;
}

export type NavItem = NavLinkItem | NavButtonItem;

export function navClass(page: AppPage, id: AppPage): string {
  if (id === page) return "navbtn navbtn-active";
  return "navbtn";
}

export function buildNavItems(page: AppPage, userPlan: string, showScan: boolean): NavItem[] {
  const items: NavItem[] = [
    { type: "link", href: "/", page: "picks", icon: "monitoring", label: "Picks" },
    { type: "link", href: "/stats", page: "stats", icon: "query_stats", label: "Estadísticas" },
    { type: "button", action: "howto", icon: "rocket_launch", label: "Cómo usar" },
    { type: "button", action: "profile", icon: "settings", label: "Perfil" },
  ];

  if (showScan) {
    items.push({
      type: "button",
      action: "scan",
      icon: "refresh",
      label: "Escanear",
      scanningLabel: "Escaneando…",
    });
  }

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

  items.push({ type: "button", action: "logout", icon: "logout", label: "Cerrar sesión" });

  return items;
}
