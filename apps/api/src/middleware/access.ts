import { users } from '@kreatya/db';
import type { UserRole } from '@kreatya/shared';
import { eq } from 'drizzle-orm';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AppEnv } from '../env';

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * Autenticación del panel con Cloudflare Access: valida el JWT `Cf-Access-Jwt-Assertion`
 * y resuelve el rol propio en D1. En desarrollo admite `DEV_USER_EMAIL`.
 */
export const requireAccess = createMiddleware<AppEnv>(async (c, next) => {
  let email: string | undefined;

  if (c.env.ENVIRONMENT === 'development' && c.env.DEV_USER_EMAIL) {
    email = c.env.DEV_USER_EMAIL;
  } else {
    const token = c.req.header('Cf-Access-Jwt-Assertion');
    if (!token || !c.env.ACCESS_AUD) throw new HTTPException(401, { message: 'No autenticado' });
    const issuer = `https://${c.env.ACCESS_TEAM_DOMAIN}`;
    let jwks = jwksCache.get(issuer);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
      jwksCache.set(issuer, jwks);
    }
    try {
      const { payload } = await jwtVerify(token, jwks, { issuer, audience: c.env.ACCESS_AUD });
      email = typeof payload.email === 'string' ? payload.email : undefined;
    } catch {
      throw new HTTPException(401, { message: 'Token de Access no válido' });
    }
  }
  if (!email) throw new HTTPException(401, { message: 'No autenticado' });

  const db = c.get('db');
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user || !user.active)
    throw new HTTPException(403, { message: 'Usuario sin acceso al panel' });
  await db
    .update(users)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(users.id, user.id));
  c.set('user', { id: user.id, email: user.email, name: user.name, role: user.role });
  await next();
});

/** Restringe una ruta a ciertos roles. `admin` siempre tiene acceso. */
export const requireRole = (...roles: UserRole[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const role = c.get('user').role;
    if (role !== 'admin' && !roles.includes(role)) {
      throw new HTTPException(403, { message: 'Tu rol no tiene permiso para esta acción' });
    }
    await next();
  });
