import { createDb } from '@kreatya/db';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import { ZodError } from 'zod';
import type { AppEnv } from './env';
import { requireAccess } from './middleware/access';
import { dashboardRoutes } from './routes/admin/dashboard';
import { leadRoutes } from './routes/admin/leads';
import { projectRoutes } from './routes/admin/projects';
import { seoRoutes } from './routes/admin/seo';
import { settingsRoutes } from './routes/admin/settings';
import { internalRoutes } from './routes/internal';
import { publicRoutes } from './routes/public';

const admin = new Hono<AppEnv>()
  .use(requireAccess)
  .route('/dashboard', dashboardRoutes)
  .route('/projects', projectRoutes)
  .route('/leads', leadRoutes)
  .route('/seo', seoRoutes)
  .route('/', settingsRoutes);

export const app = new Hono<AppEnv>()
  .use(secureHeaders())
  .use('*', async (c, next) => {
    const origins = c.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    return cors({
      origin: (o) => (origins.includes('*') || origins.includes(o) ? o : null),
      allowHeaders: ['Content-Type', 'Authorization', 'Cf-Access-Jwt-Assertion'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
      maxAge: 600,
    })(c, next);
  })
  .use('*', async (c, next) => {
    c.set('db', createDb(c.env.DB));
    await next();
  })
  .get('/health', (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }))
  .route('/v1', publicRoutes)
  .route('/internal', internalRoutes)
  .route('/admin', admin);

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ ok: false, message: err.message }, err.status);
  if (err instanceof ZodError)
    return c.json({ ok: false, message: 'Datos no válidos', issues: err.issues }, 400);
  console.error(err);
  return c.json({ ok: false, message: 'Error interno' }, 500);
});

export type AppType = typeof app;
