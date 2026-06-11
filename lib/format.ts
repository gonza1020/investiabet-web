export function fmt(n: number | null | undefined, d = 2): string {
  return n != null ? Number(n).toFixed(d) : "—";
}

export function fmtMiles(n: number | null | undefined): string {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("es-AR");
}

export function fmtUSD(
  n: number | null | undefined,
  currency = "ARS",
  signed = false,
): string {
  if (n == null) return "—";
  const prefix = signed && n >= 0 ? "+" : signed && n < 0 ? "-" : "";
  return `${prefix}${currency} ${Math.abs(Math.round(n)).toLocaleString("es-AR")}`;
}

export function fmtPct(n: number | null | undefined): string {
  return n != null ? `${n >= 0 ? "+" : ""}${Number(n).toFixed(1)}%` : "—";
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dep(d: string | undefined): string {
  const map: Record<string, string> = {
    Fútbol: "⚽",
    Tenis: "🎾",
    Básquet: "🏀",
    Esports: "🎮",
    MMA: "🥊",
    Béisbol: "⚾",
  };
  return map[d ?? ""] ?? "🎯";
}

export function edgeColor(e: number): string {
  if (e >= 0.12) return "var(--teal)";
  if (e >= 0.07) return "var(--blue)";
  if (e >= 0.04) return "var(--violet)";
  return "var(--text2)";
}

export function confLabel(l: string | undefined): string {
  const map: Record<string, string> = {
    EXTREMA: "Extrema",
    "MUY ALTA": "Muy alta",
    ALTA: "Alta",
  };
  return map[l ?? ""] ?? l ?? "";
}

export function lineKey(equipoPick: string): string | null {
  const ep = (equipoPick || "").trim();
  let m = ep.match(/^(Over|Under)\s+([\d.]+)$/i);
  if (m) return `OU|${m[2]}`;
  m = ep.match(/\(([+-]?[\d.]+)\)$/);
  if (m) {
    const v = Math.abs(parseFloat(m[1]));
    if (!isNaN(v)) return `SPR|${v}`;
  }
  return null;
}
