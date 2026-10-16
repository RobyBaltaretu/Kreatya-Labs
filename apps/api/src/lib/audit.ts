import { auditLog, type Db } from '@kreatya/db';

export function audit(
  db: Db,
  userId: string,
  entity: string,
  entityId: string,
  action: 'create' | 'update' | 'delete' | 'publish' | 'restore',
  before: unknown,
  after: unknown,
) {
  return db.insert(auditLog).values({ userId, entity, entityId, action, before, after });
}
