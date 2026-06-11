"use client";

import { Badge } from "@/components/ui/Badge";
import {
  changeUserPlan,
  createAdminUser,
  generateInvitation,
  getAdminSettings,
  getAdminUsers,
  getInvitations,
  saveWindowHours,
  toggleUserActive,
} from "@/lib/api/admin";
import type { AdminUser, Invitation } from "@/lib/types/domain";
import { useToast } from "@/providers/toast-provider";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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

export function AdminPageContent() {
  const { showToast } = useToast();
  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: getAdminUsers,
    refetchInterval: 30_000,
  });
  const invQuery = useQuery({
    queryKey: ["admin", "invitations"],
    queryFn: getInvitations,
    refetchInterval: 30_000,
  });
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getAdminSettings,
  });

  const users = usersQuery.data ?? [];
  const invitations = invQuery.data ?? [];
  const settings = settingsQuery.data;

  const [whHours, setWhHours] = useState<string | null>(null);
  const effectiveWh = whHours ?? String(settings?.window_hours ?? 24);

  const [nuEmail, setNuEmail] = useState("");
  const [nuUser, setNuUser] = useState("");
  const [nuPass, setNuPass] = useState("");
  const [nuPlan, setNuPlan] = useState("free");
  const [nuResult, setNuResult] = useState<React.ReactNode>(null);

  const [invPlan, setInvPlan] = useState("free");
  const [invMax, setInvMax] = useState("1");
  const [invResult, setInvResult] = useState<React.ReactNode>(null);

  const refresh = () => {
    usersQuery.refetch();
    invQuery.refetch();
    settingsQuery.refetch();
  };

  const saveWindow = async () => {
    const hours = parseInt(effectiveWh);
    const d = await saveWindowHours(hours);
    if (d.ok) {
      showToast(`✓ Ventana en ${hours} hs — aplica desde el próximo escaneo`);
      settingsQuery.refetch();
    } else {
      showToast(`✗ ${d.error ?? "No se pudo guardar"}`, true);
    }
  };

  const createUser = async () => {
    const d = await createAdminUser({
      email: nuEmail.trim(),
      username: nuUser.trim(),
      password: nuPass,
      plan: nuPlan,
    });
    if (d.ok) {
      setNuResult(
        <div className="admin-result-box">
          <div>
            <div className="mb-1.5 text-[11px] text-[var(--text2)]">
              Usuario creado — plan <Badge variant={planBadge[d.plan ?? "free"]}>{planLabel[d.plan ?? ""]}</Badge>
            </div>
            <div className="text-[13px]">
              <strong>{d.email}</strong>
              {d.password && <> · contraseña: <span className="admin-code-text text-sm">{d.password}</span></>}
            </div>
          </div>
        </div>,
      );
      setNuEmail("");
      setNuUser("");
      setNuPass("");
      refresh();
    } else {
      setNuResult(
        <div className="admin-result-box" style={{ borderColor: "rgba(239,68,68,.4)" }}>
          <span className="text-[13px] text-[var(--red)]">✗ {d.error ?? "Error al crear el usuario"}</span>
        </div>,
      );
    }
  };

  const genInvitation = async () => {
    const d = await generateInvitation({
      plan: invPlan,
      max_uses: parseInt(invMax) || 1,
    });
    if (d.ok && d.code) {
      setInvResult(
        <div className="admin-result-box">
          <div>
            <div className="mb-1 text-[11px] text-[var(--text2)]">Código generado:</div>
            <div className="admin-code-text">{d.code}</div>
          </div>
          <button type="button" className="btn" onClick={() => navigator.clipboard.writeText(d.code!)}>
            Copiar
          </button>
        </div>,
      );
      refresh();
    }
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-6">
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AdminKpi label="Usuarios" value={users.length} />
        <AdminKpi label="Free" value={users.filter((x) => x.plan === "free").length} muted />
        <AdminKpi label="Premium" value={users.filter((x) => x.plan === "premium").length} className="text-secondary" />
        <AdminKpi label="Admins" value={users.filter((x) => x.plan === "admin").length} className="text-violet" />
        <AdminKpi
          label="Invitaciones usadas"
          value={`${invitations.filter((x) => x.used).length}/${invitations.length}`}
          className="text-blue"
        />
      </section>

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber">tune</span>
          <h2 className="font-headline-md text-headline-md">Scanner</h2>
          <Badge variant="amber">
            {settings?.window_hours ?? "—"} hs{settings?.overridden === false ? " (default)" : ""}
          </Badge>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="field max-w-[260px]">
            <label>Ventana de análisis</label>
            <select className="w-full" value={effectiveWh} onChange={(e) => setWhHours(e.target.value)}>
              {[24, 48, 72, 120, 168, 240, 336].map((h) => (
                <option key={h} value={h}>{h} hs</option>
              ))}
            </select>
          </div>
          <button type="button" className="btn-grad" onClick={saveWindow}>Guardar</button>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Hasta cuántas horas en el futuro el motor analiza partidos. Se aplica desde el próximo escaneo.
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">person_add</span>
          <h2 className="font-headline-md text-headline-md">Crear usuario</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="field"><label>Email</label><input type="email" value={nuEmail} onChange={(e) => setNuEmail(e.target.value)} placeholder="usuario@mail.com" /></div>
          <div className="field"><label>Usuario</label><input value={nuUser} onChange={(e) => setNuUser(e.target.value)} placeholder="nombre de usuario" /></div>
          <div className="field"><label>Contraseña</label><input value={nuPass} onChange={(e) => setNuPass(e.target.value)} placeholder="vacío = generar una" /></div>
          <div className="field max-w-[160px]">
            <label>Plan</label>
            <select value={nuPlan} onChange={(e) => setNuPlan(e.target.value)}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="button" className="btn-grad" onClick={createUser}>Crear usuario</button>
        </div>
        {nuResult}
      </section>

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue">confirmation_number</span>
          <h2 className="font-headline-md text-headline-md">Códigos de invitación</h2>
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="field max-w-[160px]">
            <label>Plan del código</label>
            <select value={invPlan} onChange={(e) => setInvPlan(e.target.value)}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="field max-w-[120px]">
            <label>Usos máximos</label>
            <input type="number" min={1} value={invMax} onChange={(e) => setInvMax(e.target.value)} />
          </div>
          <button type="button" className="btn-grad" onClick={genInvitation}>Generar código</button>
        </div>
        {invResult}
        <InvitationsTable invitations={invitations} />
      </section>

      <section className="mb-6 rounded-xl border border-outline-variant bg-surface-container p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-violet">group</span>
          <h2 className="font-headline-md text-headline-md">Usuarios registrados</h2>
          <span className="text-xs text-on-surface-variant">{users.length} en total</span>
        </div>
        <UsersTable users={users} onChanged={refresh} />
      </section>
    </main>
  );
}

function AdminKpi({
  label,
  value,
  className = "",
  muted,
}: {
  label: string;
  value: string | number;
  className?: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-5">
      <p className="font-data-label text-data-label mb-2 uppercase text-on-surface-variant">{label}</p>
      <div className={`font-display-lg text-display-lg ${muted ? "text-on-surface-variant" : className}`}>{value}</div>
    </div>
  );
}

function UsersTable({ users, onChanged }: { users: AdminUser[]; onChanged: () => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Usuario</th><th>Email</th><th>Plan</th><th>Bankroll</th><th>Perfil</th><th>Telegram</th><th>Registro</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((x) => (
            <tr key={x.id} style={{ opacity: x.active === false ? 0.5 : 1 }}>
              <td>
                <strong>{x.username}</strong>
                {x.active === false && <Badge variant="red">Inactivo</Badge>}
              </td>
              <td className="text-xs text-[var(--text2)]">{x.email}</td>
              <td><Badge variant={planBadge[x.plan]}>{planLabel[x.plan]}</Badge></td>
              <td className="text-xs">{fmtARS(x.bankroll)}</td>
              <td className="text-xs text-[var(--text2)]">{perfilLabel[x.risk_profile ?? ""] ?? "—"}</td>
              <td>{x.tg_active ? <Badge variant="teal">✓</Badge> : "—"}</td>
              <td className="text-[11px] text-[var(--text2)]">{x.registered_at?.substring(0, 10) ?? ""}</td>
              <td>
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    className="mini-select"
                    defaultValue={x.plan}
                    onChange={async (e) => {
                      e.target.disabled = true;
                      const d = await changeUserPlan(x.id, e.target.value);
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
                    className="btn text-[11px]"
                    style={{ color: x.active !== false ? "var(--red)" : "var(--teal)" }}
                    onClick={async () => {
                      await toggleUserActive(x.id, x.active === false);
                      onChanged();
                    }}
                  >
                    {x.active !== false ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvitationsTable({ invitations }: { invitations: Invitation[] }) {
  if (!invitations.length) {
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="admin-table">
          <tbody>
            <tr><td colSpan={5} className="py-6 text-center text-[var(--text2)]">Sin códigos generados.</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr><th>Código</th><th>Plan</th><th>Usos</th><th>Estado</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {invitations.map((x) => (
            <tr key={x.code}>
              <td><code className="font-mono text-[13px] tracking-wide text-[var(--teal)]">{x.code}</code></td>
              <td><Badge variant={planBadge[x.plan]}>{planLabel[x.plan]}</Badge></td>
              <td className="text-xs">{x.current_uses}/{x.max_uses}</td>
              <td>{x.used ? <Badge variant="gray">Agotado</Badge> : <Badge variant="teal">Disponible</Badge>}</td>
              <td className="text-[11px] text-[var(--text2)]">{x.created_at?.substring(0, 10) ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
