# InvestiaBet Web

Frontend de [InvestiaBet](https://github.com/gonza1020/investiabet-web) en **Next.js 16** (App Router). Consume la API FastAPI desplegada en Railway.

Documentación de migración: `stakebotweb2/docs/nextjs-migration.md`.

## Requisitos

- Node.js 20+
- npm
- Backend FastAPI (repo `stakebotweb2`)

## Setup local

**Terminal 1 — Backend** (`stakebotweb2`):

```bash
docker compose up -d db
uv run alembic upgrade head
uv run python main.py
# → http://localhost:8000
```

**Terminal 2 — Frontend** (`investiabet-web`):

```bash
npm install
cp .env.example .env.local
npm run dev
# → http://localhost:3000
```

En desarrollo, las llamadas van a `/api/*` en el mismo origen (`:3000`) y Next las proxea al backend (`API_PROXY_TARGET`). No hace falta CORS para el login local.

**Backend `.env`** (stakebotweb2):

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
COOKIE_SECURE=false
```

**Frontend `.env.local`**:

```env
NEXT_PUBLIC_API_URL=
API_PROXY_TARGET=http://localhost:8000
```

Tras login, el token se guarda en `localStorage` (`sb_token`) y una cookie `sb_session=1` para el middleware de rutas.

## Rutas

| Ruta | Auth | Descripción |
|------|------|-------------|
| `/` | Sí | Dashboard — picks, polling 5 min, colocar apuestas |
| `/stats` | Sí | Estadísticas, bankroll, historial, gráfico equity |
| `/admin` | Admin | CRUD usuarios, invitaciones, settings scanner |
| `/login` | No | Login y registro con código de invitación |
| `/premium` | No | Landing de activación Premium (SSG) |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run generate:api` | Regenera `lib/types/api.d.ts` desde OpenAPI |

## Estructura

```
app/              # Rutas App Router
components/       # UI por feature (layout, picks, stats, admin, premium)
lib/api/          # Cliente HTTP y módulos por dominio
lib/auth/         # Token Bearer + cookie de sesión
lib/types/        # Tipos de dominio + OpenAPI generado
hooks/            # usePicks, useStats, usePlacedPicks
providers/        # React Query, Auth, Toast
middleware.ts     # Guard de rutas (cookie sb_session)
```

## Fase actual

**Fases 1–7 completadas** — Next.js es el único entry point UI; backend Railway solo API.

## Despliegue en Vercel

1. Importar este repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js**.
3. Variable de entorno:
   - `NEXT_PUBLIC_API_URL` = URL pública de Railway
4. En Railway, agregar la URL de Vercel a `CORS_ORIGINS`.

## Regenerar tipos de la API

Con el backend levantado:

```bash
npm run generate:api
```
