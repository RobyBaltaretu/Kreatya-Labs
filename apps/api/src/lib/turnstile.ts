export async function verifyTurnstile(
  secret: string | undefined,
  token: string | undefined,
  ip?: string | null,
) {
  // Sin secreto configurado (desarrollo) se omite la verificación.
  if (!secret) return true;
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}
