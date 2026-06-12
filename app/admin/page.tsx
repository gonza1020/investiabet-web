"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { useUser } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login?from=/admin");
      return;
    }
    if (user.plan !== "admin") {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-on-surface-variant">
        Cargando…
      </div>
    );
  }

  if (!user || user.plan !== "admin") return null;

  return (
    <AppShell page="admin">
      <AdminPageContent />
    </AppShell>
  );
}
