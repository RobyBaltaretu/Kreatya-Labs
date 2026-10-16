import { Logo } from '@kreatya/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { api, isDemo } from '../lib/api';
import type { Me } from '../lib/types';
import { Button } from './ui';

const NAV = [
  { to: '/', label: 'Resumen', roles: null },
  { to: '/leads', label: 'Leads', roles: ['comercial'] },
  { to: '/proyectos', label: 'Proyectos', roles: ['marketing'] },
  { to: '/seo', label: 'SEO', roles: ['marketing'] },
  { to: '/configuracion', label: 'Configuración', roles: [] },
  { to: '/infraestructura', label: 'Infraestructura', roles: [] },
] as const;

export function Layout() {
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/me') });
  const [msg, setMsg] = useState('');
  const publish = useMutation({
    mutationFn: () => api<{ ok: boolean; message?: string }>('/publish', { method: 'POST' }),
    onSuccess: (r) =>
      setMsg(
        r.ok
          ? 'Publicando: la web se regenera en menos de 2 minutos.'
          : (r.message ?? 'No se pudo publicar.'),
      ),
    onError: (e) => setMsg((e as Error).message),
  });
  const can = (roles: readonly string[] | null) =>
    roles === null || me?.role === 'admin' || (me && roles.includes(me.role));

  return (
    <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-raised lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 lg:py-5"
          style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))' }}
        >
          <span className="flex items-center gap-2 font-display font-semibold">
            <Logo className="h-7 w-7" /> Panel Kreatya
          </span>
        </div>
        <nav aria-label="Panel" className="overflow-x-auto px-2 pb-2 lg:pb-0">
          <ul className="flex gap-1 lg:grid">
            {NAV.filter((n) => can(n.roles)).map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  activeOptions={{ exact: n.to === '/' }}
                  className="block whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-bg [&.active]:bg-ink [&.active]:font-semibold [&.active]:text-paper"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {me && (
          <p className="hidden px-5 pt-6 text-xs text-muted lg:block">
            {me.name}
            <br />
            {me.email} · {me.role}
          </p>
        )}
      </aside>
      <div className="min-w-0">
        <header
          className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-8"
          style={{ paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
        >
          {isDemo ? (
            <p className="rounded-md bg-signal/15 px-2 py-1 text-xs font-medium">
              Modo demostración · datos de ejemplo, los cambios no se guardan
            </p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            {msg && (
              <p role="status" className="text-sm text-muted">
                {msg}
              </p>
            )}
            <Button variant="primary" onClick={() => publish.mutate()} disabled={publish.isPending}>
              {publish.isPending ? 'Publicando…' : 'Publicar web'}
            </Button>
          </div>
        </header>
        <main
          className="px-4 py-6 lg:px-8"
          style={{
            paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
