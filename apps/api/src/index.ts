import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { AppEnv, Env } from "./env.ts";
import { requireUser } from "./lib/auth.ts";
import { refreshRates } from "./lib/fx.ts";
import { rateLimit } from "./lib/rate-limit.ts";
import { audit } from "./routes/audit.ts";
import { auth } from "./routes/auth.ts";
import { agency, leads, listings, templates } from "./routes/console/agency.ts";
import { business } from "./routes/console/business.ts";
import { catalog, translate } from "./routes/console/catalog.ts";
import { packages } from "./routes/console/packages.ts";
import { reviews } from "./routes/console/reviews.ts";
import { media, publicApi } from "./routes/public.ts";

const app = new Hono<AppEnv>().basePath("/api");

// The marketing site is a separate origin; only its anonymous audit calls need CORS.
// Signed-in surfaces (console) reach the API same-origin through a service binding.
app.use("/audit/*", async (c, next) =>
  cors({
    origin: [c.env.SITE_ORIGIN],
    allowMethods: ["GET", "POST"],
    allowHeaders: ["content-type"],
    maxAge: 600,
  })(c, next),
);
app.use("/audit", async (c, next) =>
  cors({
    origin: [c.env.SITE_ORIGIN],
    allowMethods: ["GET", "POST"],
    allowHeaders: ["content-type"],
    maxAge: 600,
  })(c, next),
);

app.use("/audit/*", rateLimit);
app.use("/audit", rateLimit);
app.use("/auth/*", rateLimit);

app.get("/health", (c) => c.json({ ok: true, service: "wayfound-api" }));
app.route("/public", publicApi);
app.route("/media", media);
app.route("/audit", audit);
app.route("/auth", auth);

const consoleApi = new Hono<AppEnv>();
consoleApi.use(requireUser);
consoleApi.route("/businesses", business);
consoleApi.route("/businesses", catalog);
consoleApi.route("/businesses", packages);
consoleApi.route("/businesses", reviews);
consoleApi.route("/businesses", listings);
consoleApi.route("/leads", leads);
consoleApi.route("/templates", templates);
consoleApi.route("/translate", translate);
consoleApi.route("/agency", agency);
app.route("/console", consoleApi);

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "Something went wrong" }, 500);
});
app.notFound((c) => c.json({ error: "Not found" }, 404));

export default {
  fetch: app.fetch,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refreshRates(env).then((r) => console.log(`FX refreshed for ${r.date}`)));
  },
} satisfies ExportedHandler<Env>;
