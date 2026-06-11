"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatsPageContent } from "@/components/stats/StatsPageContent";

export default function StatsPage() {
  return (
    <AppShell page="stats">
      <StatsPageContent />
    </AppShell>
  );
}
