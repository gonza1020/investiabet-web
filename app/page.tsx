export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
      <h1 className="text-display-lg text-on-surface">InvestiaBet</h1>
      <p className="text-on-surface-variant text-center text-sm">
        Frontend Next.js — Fase 0 lista. API:{" "}
        {process.env.NEXT_PUBLIC_API_URL ?? "no configurada"}
      </p>
      <span className="badge mt-2 inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
        <span className="material-symbols-outlined text-sm">check_circle</span>
        Tooling inicializado
      </span>
    </main>
  );
}
