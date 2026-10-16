# Kreatya Labs: web corporativa y panel de gestión

Web comercial de desarrollo de software a medida + IA, con portfolio navegable, demos,
calculadoras, diagnóstico gratuito y un panel propio para contenidos, leads, SEO y KPIs.
Todo corre en el plan gratuito de Cloudflare; el único coste es el dominio.

## Estructura

```
apps/
  web/     Astro + islas React → Cloudflare Pages (100 % estático, SSG)
  admin/   React + Vite + TanStack Router/Query → Pages en admin.kreatya.es tras Cloudflare Access
  api/     Hono sobre Workers: leads, eventos, snapshot de contenido, API del panel, cron de KPIs
packages/
  shared/  site.config.ts (marca), esquemas zod, enums, calculadoras
  db/      Esquema Drizzle (D1), migraciones y contenido semilla
  ui/      Tokens de diseño (claro/oscuro), tema de Tailwind v4 y logo
e2e/       Playwright: HU-01 a HU-06 + SEO técnico
scripts/   build-preview.mjs (vista previa estática portable)
```

**Regla de oro:** la web pública nunca lee D1 en tiempo de petición. El panel guarda en D1,
«Publicar web» lanza un deploy y el build lee la instantánea de contenido de la API
(`GET /internal/snapshot`). Sin `CONTENT_API_URL`, el build usa el contenido semilla.

## Desarrollo local

```bash
pnpm install

# API + D1 local (miniflare)
cp apps/api/.dev.vars.example apps/api/.dev.vars
pnpm --filter @kreatya/db seed:sql
pnpm --filter @kreatya/api db:migrate:local
pnpm --filter @kreatya/api db:seed:local
pnpm --filter @kreatya/api dev            # http://localhost:8787

# Web (con contenido de la API local o semilla)
cp apps/web/.env.example apps/web/.env
pnpm --filter @kreatya/web dev            # http://localhost:4321

# Panel (sin VITE_API_URL arranca en modo demostración con datos de ejemplo)
pnpm --filter @kreatya/admin dev          # http://localhost:5173
```

Comprobaciones:

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @kreatya/web build && VITE_HASH_ROUTER=1 pnpm --filter @kreatya/admin build && pnpm e2e
pnpm preview:static                       # web + panel en preview-dist/, servible desde cualquier ruta
```

## Cambiar el esquema de base de datos

1. Edita `packages/db/src/schema/*.ts`.
2. `pnpm db:generate` crea la migración SQL en `packages/db/migrations/`.
3. El workflow de despliegue la aplica en D1 (`wrangler d1 migrations apply`).

## Puesta en producción (Cloudflare, plan gratuito)

1. Registra el dominio en Cloudflare Registrar (o apunta sus DNS a Cloudflare).
2. Crea los recursos y copia sus IDs en `apps/api/wrangler.toml`:
   ```bash
   npx wrangler d1 create kreatya-db
   npx wrangler d1 create kreatya-db-preview
   npx wrangler r2 bucket create kreatya-media
   npx wrangler kv namespace create KV
   ```
3. Secretos de la API: `wrangler secret put BUILD_TOKEN | TURNSTILE_SECRET | RESEND_API_KEY | DEPLOY_HOOK_URL`.
4. Crea los proyectos de Pages `kreatya-web` y `kreatya-admin`, y asigna los dominios
   `kreatya.es`, `admin.kreatya.es` y `api.kreatya.es` (ruta del Worker).
5. Protege `admin.kreatya.es` y `api.kreatya.es/admin/*` con Cloudflare Access (Google Workspace
   o código por email) y pon el AUD de la aplicación en `ACCESS_AUD`. Da de alta a cada persona
   en el panel, en *Configuración → Usuarios* (roles: Admin, Marketing, Comercial, Lectura).
6. En GitHub: secretos `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` y `BUILD_TOKEN`;
   variables `CLOUDFLARE_ENABLED=true`, `CONTENT_API_URL`, `PUBLIC_API_URL` y `TURNSTILE_SITE_KEY`.
7. `DEPLOY_HOOK_URL`: deploy hook de Pages (si conectas el repo a Pages) o un endpoint que dispare
   el workflow `Deploy` (`repository_dispatch` de tipo `publish`).

Entornos: `main` → producción; cualquier otra rama → preview de Pages con D1 separada.

## Estado frente a la hipótesis de solución

| Épica | Estado |
|---|---|
| E1 Sistema de diseño y layout | Hecho: tokens claro/oscuro, retícula de plano, tipografías autoalojadas, cabecera fija y menú móvil a pantalla completa |
| E2 Home | Hecho: los 10 bloques (hero «Blueprint vivo», prueba social, «¿Qué te frena hoy?», pilares, destacados, demo IA, método, calculadora, testimonios, FAQ + CTA) |
| E3 Portfolio y fichas | Hecho: filtros con estado en la URL y sin JS, ficha con plantilla de 10 bloques, NDA, lightbox |
| E4 Vistas previas | Niveles 1 (recorrido guiado) y 3 (bajo solicitud, acceso 72 h) hechos. Nivel 2 (sandbox) preparado en datos y página; falta el subdominio `demo.` |
| E5 Conversión | Hecho: diagnóstico en 5 pasos + Cal.com, calculadoras de ahorro e inversión, mini CRM |
| E6 SEO técnico | Hecho: SSG, JSON-LD por plantilla, sitemap, robots, `llms.txt`, OG por página, `_redirects` desde el panel, canonical. Lighthouse móvil local: 98–99 / 100 / 100 / 100 |
| E9 Panel y KPIs | Dashboard, leads (estados, notas, CSV), proyectos (CRUD + SEO), SEO (auditoría, redirecciones), configuración, usuarios, infraestructura. Pendiente: biblioteca de medios con subida a R2 y editor de bloques para páginas, sectores y blog |
| E10 Infra y CI/CD | `wrangler.toml` por app, migraciones, CI (lint, tipos, unit, E2E, Lighthouse ≥ 95, enlaces rotos) y despliegue a Pages/Workers |
| E7 IA (fase 2) | Demo documental con resultados pregrabados. Pendiente: Workers AI, subida propia y asistente RAG con Vectorize |
| E8 Contenido (fase 2–3) | Textos semilla de 6 sectores y 6 soluciones. Ninguna landing llega aún a las 800 palabras: la auditoría SEO del panel lo marca |

Preguntas abiertas del documento que siguen pendientes: dominio y logotipo definitivos, ciudad
o ciudades para el SEO local, lista real de proyectos publicables (los casos actuales son de
ejemplo), rangos de precio definitivos y si basta el mini CRM.
