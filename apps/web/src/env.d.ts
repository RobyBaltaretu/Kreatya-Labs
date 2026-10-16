/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly CONTENT_API_URL?: string;
  readonly CONTENT_API_TOKEN?: string;
  readonly PUBLIC_API_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
declare module '*.woff2?url' {
  const url: string;
  export default url;
}
