"use client";

import { Badge } from "@/components/ui/Badge";
import { changeUserPlan, toggleUserActive } from "@/lib/api/admin";
import type { AdminUser } from "@/lib/types/domain";

const planBadge: Record<string, "gray" | "teal" | "violet"> = {
  free: "gray",
  premium: "teal",
  admin: "violet",
};

const planLabel: Record<string, string> = {
  free: "Free",
  premium: "Premium",
  admin: "Admin",
};

const perfilLabel: Record<string, string> = {
  conservative: "Conservador",
  smart: "Equilibrado",
  aggressive: "Agresivo",
  profesional: "Agresivo",
  pro: "Profesional",
};

function fmtARS(n?: number) {
  return `ARS ${Math.round(n ?? 0).toLocaleString("es-AR")}`;
}

interface UserCardProps {
  user: AdminUser;
  onChanged: () => void;
}

export function UserCard({ user, onChanged }: UserCardProps) {
  return (
    <div
      className="rounded-xl border border-outline-variant bg-surface-container p-4"
      style={{ opacity: user.active === false ? 0.5 : 1 }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{user.username}</span>
            <Badge variant={planBadge[user.plan]}>{planLabel[user.plan]}</Badge>
            {user.active === false && <Badge variant="red">Inactivo</Badge>}
          </div>
          <div className="mt-1 truncate text-xs text-on-surface-variant">{user.email}</div>
        </div>
        {user.tg_active && <Badge variant="teal">TG ✓</Badge>}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Bankroll</div>
          <div>{fmtARS(user.bankroll)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Perfil</div>
          <div>{perfilLabel[user.risk_profile ?? ""] ?? "—"}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10px] uppercase text-on-surface-variant">Registro</div>
          <div className="text-xs">{user.registered_at?.substring(0, 10) ?? "—"}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          className="mini-select w-full"
          defaultValue={user.plan}
          onChange={async (e) => {
            e.target.disabled = true;
            const d = await changeUserPlan(user.id, e.target.value);
            e.target.disabled = false;
            if (!d.ok) alert(d.error ?? "No se pudo cambiar el plan");
            onChanged();
          }}
        >
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          className="btn min-h-11 w-full text-[11px] sm:w-auto"
          style={{ color: user.active !== false ? "var(--red)" : "var(--teal)" }}
          onClick={async () => {
            await toggleUserActive(user.id, user.active === false);
            onChanged();
          }}
        >
          {user.active !== false ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  );
}
