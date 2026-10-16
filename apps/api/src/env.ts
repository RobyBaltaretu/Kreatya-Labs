import type { Db } from '@kreatya/db';
import type { UserRole } from '@kreatya/shared';

export interface Bindings {
  DB: D1Database;
  MEDIA: R2Bucket;
  KV: KVNamespace;
  ENVIRONMENT: 'production' | 'preview' | 'development';
  ALLOWED_ORIGINS: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  LEAD_NOTIFY_EMAIL: string;
  DEMO_BASE_URL: string;
  BUILD_TOKEN?: string;
  TURNSTILE_SECRET?: string;
  RESEND_API_KEY?: string;
  DEPLOY_HOOK_URL?: string;
  /** Solo en desarrollo: simula el usuario autenticado por Access. */
  DEV_USER_EMAIL?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: { db: Db; user: SessionUser };
}
