"use client";

import { useCallback, useLayoutEffect, useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "investiabet-sidebar-collapsed";

let cachedCollapsed: boolean | null = null;

function readSidebarCollapsed(): boolean {
  if (cachedCollapsed !== null) return cachedCollapsed;
  if (typeof window === "undefined") return false;
  try {
    cachedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    cachedCollapsed = false;
  }
  return cachedCollapsed;
}

function writeSidebarCollapsed(collapsed: boolean): void {
  cachedCollapsed = collapsed;
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  } catch {
    /* ignore */
  }
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
  }, [collapsed]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeSidebarCollapsed(next);
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
