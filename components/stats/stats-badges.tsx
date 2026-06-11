import { Badge } from "@/components/ui/Badge";

export function typeBadge(type?: string, gold?: boolean) {
  if (gold) return <Badge variant="violet">⭐ Gold</Badge>;
  if (type === "sure") return <Badge variant="teal">🔒 Alta confianza</Badge>;
  return <Badge variant="blue">📊 Valor</Badge>;
}

export function statusBadge(status?: string) {
  const map: Record<string, { v: "teal" | "red" | "amber" | "gray" | "violet"; l: string }> = {
    won: { v: "teal", l: "✓ Ganó" },
    lost: { v: "red", l: "✗ Perdió" },
    pending: { v: "amber", l: "⏳ Pendiente" },
    void: { v: "gray", l: "— Anulada" },
    cashout: { v: "violet", l: "💸 Cobro anticipado" },
  };
  const m = map[status ?? ""] ?? { v: "gray" as const, l: status ?? "" };
  return <Badge variant={m.v}>{m.l}</Badge>;
}
