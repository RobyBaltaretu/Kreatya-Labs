/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly CONTENT_API_URL?: string;
  readonly CONTENT_API_TOKEN?: string;
  readonly PUBLIC_API_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
