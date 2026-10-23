import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../env.ts";

/** Per-IP limit using the Workers rate-limiting binding. No-op locally, where it isn't bound. */
export const rateLimit: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.req.method !== "GET" && c.env.PUBLIC_LIMIT) {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const { success } = await c.env.PUBLIC_LIMIT.limit({ key: `${ip}:${c.req.path}` });
    if (!success) return c.json({ error: "Too many requests, try again in a minute." }, 429);
  }
  await next();
};
