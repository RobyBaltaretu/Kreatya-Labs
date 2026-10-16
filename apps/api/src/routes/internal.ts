import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../env';
import { safeEqual } from '../lib/crypto';
import { loadSnapshot } from '../lib/snapshot';

/** Endpoints para el build de la web. Nunca se llaman en tiempo de petición pública. */
export const internalRoutes = new Hono<AppEnv>().get('/snapshot', async (c) => {
  const auth = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!c.env.BUILD_TOKEN || !safeEqual(auth, c.env.BUILD_TOKEN))
    throw new HTTPException(401, { message: 'Token de build no válido' });
  return c.json(await loadSnapshot(c.get('db')));
});
