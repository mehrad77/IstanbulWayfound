import { createDb, schema as s } from "@wayfound/db";
import { eq } from "drizzle-orm";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AppEnv, Env, SessionUser } from "../env.ts";
import { newId, nowIso, randomToken, sha256 } from "./util.ts";

export const SESSION_COOKIE = "wf_session";
const SESSION_DAYS = 30;

export async function createSession(c: Context<AppEnv>, userId: string) {
  const token = randomToken();
  const db = createDb(c.env.DB);
  await db.insert(s.sessions).values({
    id: await sha256(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString(),
  });
  setCookie(c, SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: new URL(c.req.url).protocol === "https:",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession(c: Context<AppEnv>) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await createDb(c.env.DB)
      .delete(s.sessions)
      .where(eq(s.sessions.id, await sha256(token)));
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export async function currentUser(c: Context<AppEnv>): Promise<SessionUser | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const db = createDb(c.env.DB);
  const session = await db.query.sessions.findFirst({
    where: eq(s.sessions.id, await sha256(token)),
  });
  if (!session || session.expiresAt < nowIso()) return null;
  const user = await db.query.users.findFirst({ where: eq(s.users.id, session.userId) });
  if (!user) return null;
  const memberships =
    user.role === "agency"
      ? await db.select({ id: s.businesses.id }).from(s.businesses)
      : await db
          .select({ id: s.memberships.businessId })
          .from(s.memberships)
          .where(eq(s.memberships.userId, user.id));
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    businessIds: memberships.map((m) => m.id),
  };
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

/** In production, agency staff must also pass Cloudflare Access. Locally it's off (empty vars). */
async function verifyAccess(c: Context<AppEnv>) {
  const env: Env = c.env;
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return;
  const assertion = c.req.header("cf-access-jwt-assertion");
  if (!assertion) throw new HTTPException(403, { message: "Cloudflare Access required" });
  jwks ??= createRemoteJWKSet(new URL(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`));
  await jwtVerify(assertion, jwks, {
    issuer: `https://${env.ACCESS_TEAM_DOMAIN}`,
    audience: env.ACCESS_AUD,
  }).catch(() => {
    throw new HTTPException(403, { message: "Invalid Access token" });
  });
}

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await currentUser(c);
  if (!user) throw new HTTPException(401, { message: "Sign in required" });
  if (user.role === "agency") await verifyAccess(c);
  c.set("user", user);
  await next();
};

export const requireAgency: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.get("user").role !== "agency") throw new HTTPException(403, { message: "Agency only" });
  await next();
};

export function assertBusinessAccess(c: Context<AppEnv>, businessId: string) {
  const user = c.get("user");
  if (user.role !== "agency" && !user.businessIds.includes(businessId)) {
    throw new HTTPException(404, { message: "Not found" });
  }
}

export async function createMagicLink(env: Env, email: string): Promise<string> {
  const token = randomToken();
  await createDb(env.DB)
    .insert(s.magicLinks)
    .values({
      tokenHash: await sha256(token),
      email,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    });
  return token;
}

export async function consumeMagicLink(env: Env, token: string): Promise<string | null> {
  const db = createDb(env.DB);
  const hash = await sha256(token);
  const link = await db.query.magicLinks.findFirst({ where: eq(s.magicLinks.tokenHash, hash) });
  if (!link || link.usedAt || link.expiresAt < nowIso()) return null;
  await db.update(s.magicLinks).set({ usedAt: nowIso() }).where(eq(s.magicLinks.tokenHash, hash));
  const user = await db.query.users.findFirst({ where: eq(s.users.email, link.email) });
  return user?.id ?? null;
}

export { newId };
