import type { Bindings } from '../env';

/** Envío transaccional con Resend (plan gratuito). Si no hay clave, se registra en consola. */
export async function sendEmail(env: Bindings, msg: { to: string; subject: string; html: string }) {
  if (!env.RESEND_API_KEY) {
    console.log('[email:dev]', msg.to, msg.subject);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Kreatya Labs <noreply@kreatya.es>', ...msg }),
  });
  if (!res.ok) console.error('[email] error', res.status, await res.text());
}

export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
