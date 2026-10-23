#!/usr/bin/env node
// CI: seed the production database once, on the first deploy. Never wipes existing data.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const api = join(root, "apps/api");
const wrangler = (...args) =>
  spawnSync("pnpm", ["exec", "wrangler", ...args], { cwd: api, encoding: "utf8" });

const probe = wrangler(
  "d1",
  "execute",
  "wayfound",
  "--remote",
  "--env",
  "production",
  "--json",
  "--command",
  "SELECT count(*) AS n FROM businesses",
);
if (probe.status !== 0) {
  console.error(probe.stderr || probe.stdout);
  process.exit(1);
}
const n = JSON.parse(probe.stdout)[0]?.results?.[0]?.n ?? 0;
if (n > 0) {
  console.log(`Database already has ${n} businesses; leaving it alone.`);
  process.exit(0);
}
console.log("Empty production database: loading the demo seed.");
const gen = spawnSync(
  "pnpm",
  ["--filter", "@wayfound/db", "seed:sql", join(root, ".wrangler/seed.sql")],
  { cwd: root, stdio: "inherit" },
);
if (gen.status !== 0) process.exit(gen.status ?? 1);
const load = wrangler(
  "d1",
  "execute",
  "wayfound",
  "--remote",
  "--env",
  "production",
  "--yes",
  "--file",
  join(root, ".wrangler/seed.sql"),
);
process.stdout.write(load.stdout ?? "");
process.stderr.write(load.stderr ?? "");
process.exit(load.status ?? 1);
