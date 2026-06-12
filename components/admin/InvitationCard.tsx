import { Badge } from "@/components/ui/Badge";
import type { Invitation } from "@/lib/types/domain";

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

interface InvitationCardProps {
  invitation: Invitation;
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <div className="mb-2 font-mono text-sm tracking-wide text-secondary">{invitation.code}</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Plan</div>
          <Badge variant={planBadge[invitation.plan]}>{planLabel[invitation.plan]}</Badge>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Usos</div>
          <div>
            {invitation.current_uses}/{invitation.max_uses}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Estado</div>
          {invitation.used ? (
            <Badge variant="gray">Agotado</Badge>
          ) : (
            <Badge variant="teal">Disponible</Badge>
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase text-on-surface-variant">Fecha</div>
          <div className="text-xs">{invitation.created_at?.substring(0, 10) ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
