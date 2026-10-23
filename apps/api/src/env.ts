export interface Env {
  ENVIRONMENT: "development" | "production";
  /** Passcode for the agency demo sign-in. Set as a secret in production. */
  AGENCY_DEMO_CODE?: string;
  /** Per-IP rate limit for public writes (production only). */
  PUBLIC_LIMIT?: RateLimit;
  DB: D1Database;
  MEDIA: R2Bucket;
  KV: KVNamespace;
  DEMO_MODE: string;
  ALLOW_PRIVATE_FETCH: string;
  SITE_ORIGIN: string;
  PUBLIC_ORIGIN: string;
  CONSOLE_ORIGIN: string;
  /** Cloudflare Access for agency staff in production, e.g. "wayfound.cloudflareaccess.com". */
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "agency";
  businessIds: string[];
}

export type AppEnv = { Bindings: Env; Variables: { user: SessionUser } };

export const isDemo = (env: Env) => env.DEMO_MODE === "true";
export const isProduction = (env: Env) => env.ENVIRONMENT === "production";
