import type { Seo } from '@kreatya/shared';
import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/sqlite-core';

/** ULID-like: ordenable por tiempo y sin dependencias. */
export function newId(): string {
  const time = Date.now().toString(36).padStart(9, '0');
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) =>
    (b % 36).toString(36),
  ).join('');
  return `${time}${rand}`;
}

export const id = () => text('id').primaryKey().$defaultFn(newId);
export const timestamps = {
  createdAt: text('created_at').notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`)
    .$onUpdateFn(() => new Date().toISOString()),
};
export const json = <T>(name: string) => text(name, { mode: 'json' }).$type<T>();
export const seo = () => json<Seo>('seo').notNull().default({});
export const bool = (name: string) => integer(name, { mode: 'boolean' });
