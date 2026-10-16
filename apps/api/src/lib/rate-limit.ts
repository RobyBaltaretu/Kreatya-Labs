/**
 * Limitador de ventana fija sobre KV (suficiente para formularios y demos de IA).
 * Devuelve `true` si la petición está permitida.
 */
export async function rateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now(),
): Promise<{ allowed: boolean; remaining: number }> {
  const bucket = Math.floor(now / 1000 / windowSeconds);
  const kvKey = `rl:${key}:${bucket}`;
  const current = Number((await kv.get(kvKey)) ?? 0);
  if (current >= limit) return { allowed: false, remaining: 0 };
  await kv.put(kvKey, String(current + 1), { expirationTtl: Math.max(60, windowSeconds * 2) });
  return { allowed: true, remaining: limit - current - 1 };
}
