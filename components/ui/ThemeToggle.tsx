"use client";

import { useTheme } from "@/providers/theme-provider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "navbtn" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      <span className="hidden sm:inline">{isDark ? "Claro" : "Oscuro"}</span>
    </button>
  );
}
