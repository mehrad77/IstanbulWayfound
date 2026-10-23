export interface Env {
  API: Fetcher;
  ASSETS: Fetcher;
  PUBLIC_ORIGIN: string;
  SITE_ORIGIN: string;
  DEMO_WHATSAPP_OVERRIDE: string;
}
export type AppEnv = { Bindings: Env };
