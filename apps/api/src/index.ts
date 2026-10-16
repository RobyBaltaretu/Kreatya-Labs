import { createDb } from '@kreatya/db';
import { app } from './app';
import { aggregateDay } from './cron/aggregate';
import type { Bindings } from './env';

export default {
  fetch: app.fetch,
  /** Cron nocturno: agrega KPIs del día anterior en `kpi_daily`. */
  async scheduled(_event, env, ctx) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    ctx.waitUntil(
      aggregateDay(createDb(env.DB), yesterday).then((n) =>
        console.log(`[cron] ${n} métricas agregadas para ${yesterday}`),
      ),
    );
  },
} satisfies ExportedHandler<Bindings>;
