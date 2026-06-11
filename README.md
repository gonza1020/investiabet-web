# InvestiaBet Web

Frontend de [InvestiaBet](https://github.com/gonza1020/investiabet-web) en **Next.js** (App Router). Consume la API FastAPI desplegada en Railway.

Documentación de migración: ver `stakebotweb2/docs/nextjs-migration.md`.

## Requisitos

- Node.js 20+
- npm
- Backend FastAPI corriendo en `http://localhost:8000` (repo `stakebotweb2`)

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Editar si el backend usa otro puerto

# 3. Backend: CORS debe incluir http://localhost:3000
# En stakebotweb2/.env:
#   CORS_ORIGINS=http://localhost:3000
#   COOKIE_SECURE=false

# 4. Levantar frontend
npm run dev
# → http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run generate:api` | Regenera `lib/types/api.d.ts` desde OpenAPI (backend en `:8000`) |

## Regenerar tipos de la API

Con el backend levantado:

```bash
npm run generate:api
```

## Despliegue en Vercel

1. Importar este repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js**.
3. Variable de entorno:
   - `NEXT_PUBLIC_API_URL` = URL pública de Railway (ej. `https://stakebotweb2-production.up.railway.app`)
4. En Railway, agregar la URL de Vercel a `CORS_ORIGINS`.

## Estructura (objetivo)

```
app/           # Rutas App Router
components/    # UI por feature (fases 1+)
lib/api/       # Cliente HTTP (fase 1)
lib/types/     # Tipos OpenAPI generados
hooks/         # Custom hooks
providers/     # React Query, auth, toast
```

## Fase actual

**Fase 0** — Tooling, design tokens, tipos OpenAPI y entorno local listos.
