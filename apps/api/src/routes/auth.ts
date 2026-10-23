import { zValidator } from "@hono/zod-validator";
import { validators } from "@wayfound/core";
import { createDb, schema as s } from "@wayfound/db";
import { DEMO_ACCOUNTS } from "@wayfound/db/seed";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { type AppEnv, isDemo, isProduction } from "../env.ts";
import {
  consumeMagicLink,
  createMagicLink,
  createSession,
  currentUser,
  destroySession,
} from "../lib/auth.ts";
import { ConsoleMailer } from "../lib/mailer.ts";

export const auth = new Hono<AppEnv>()
  .get("/demo-accounts", (c) =>
    c.json({
      enabled: isDemo(c.env),
      accounts: isDemo(c.env) ? DEMO_ACCOUNTS : [],
      // The agency view holds real prospects' leads, so on a public deploy it needs a passcode.
      agencyNeedsCode: Boolean(c.env.AGENCY_DEMO_CODE) || isProduction(c.env),
    }),
  )
  .post("/demo", zValidator("json", validators.demoSignInInput), async (c) => {
    if (!isDemo(c.env)) return c.json({ error: "Demo sign-in is off" }, 403);
    const { account, code } = c.req.valid("json");
    if (account === "agency" && (c.env.AGENCY_DEMO_CODE || isProduction(c.env))) {
      const expected = c.env.AGENCY_DEMO_CODE ?? "";
      if (!expected || !code || !(await timingSafeEqual(code, expected))) {
        return c.json({ error: "Wrong passcode" }, 401);
      }
    }
    const user = await createDb(c.env.DB).query.users.findFirst({
      where: eq(s.users.demoAccount, account),
    });
    if (!user) return c.json({ error: "Unknown demo account" }, 404);
    await createSession(c, user.id);
    return c.json({ ok: true });
  })
  .post("/magic", zValidator("json", validators.magicLinkInput), async (c) => {
    const { email } = c.req.valid("json");
    const user = await createDb(c.env.DB).query.users.findFirst({
      where: eq(s.users.email, email.toLowerCase()),
    });
    let devLink: string | undefined;
    if (user) {
      const token = await createMagicLink(c.env, user.email);
      // Always the configured console origin: never trust a request header for where a sign-in link points.
      const link = `${c.env.CONSOLE_ORIGIN}/api/auth/verify?token=${encodeURIComponent(token)}`;
      await new ConsoleMailer().sendMagicLink(user.email, link);
      // Email isn't wired up yet: show the link locally only, never on a public deploy.
      if (isDemo(c.env) && !isProduction(c.env)) devLink = link;
    }
    // Same answer whether or not the address exists.
    return c.json({ ok: true, devLink });
  })
  .get("/verify", async (c) => {
    const token = c.req.query("token") ?? "";
    const userId = await consumeMagicLink(c.env, token);
    if (!userId) return c.redirect("/login?error=link");
    await createSession(c, userId);
    return c.redirect("/");
  })
  .get("/me", async (c) => {
    const user = await currentUser(c);
    return c.json({ user });
  })
  .post("/logout", async (c) => {
    await destroySession(c);
    return c.json({ ok: true });
  });

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i]! ^ y[i]!;
  return diff === 0;
}
