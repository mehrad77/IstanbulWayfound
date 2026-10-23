#!/usr/bin/env node
// Reseeds D1 (and clears uploaded media) so every pitch starts from the same clean state.
// Local by default. `--remote` touches the real Cloudflare resources and asks first.
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const root = new URL("..", import.meta.url).pathname;
const api = join(root, "apps/api");
const args = process.argv.slice(2);
const remote = args.includes("--remote");
const where = remote ? "--remote" : "--local";
// `--env production` targets the production bindings in apps/api/wrangler.jsonc.
const envIdx = args.indexOf("--env");
const envArgs = envIdx >= 0 && args[envIdx + 1] ? ["--env", args[envIdx + 1]] : [];
// Only an explicit --yes (CI's "reset demo" button) skips the remote confirmation.
const confirmed = args.includes("--yes");

function run(cmd, args, cwd = api) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\n✘ ${cmd} ${args.join(" ")} failed`);
    process.exit(r.status ?? 1);
  }
}

if (remote && !confirmed) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    "This wipes the REMOTE demo database. Type RESET REMOTE to continue: ",
  );
  rl.close();
  if (answer.trim() !== "RESET REMOTE") {
    console.log("Cancelled.");
    process.exit(1);
  }
}

console.log(`→ Applying migrations (${where})`);
run("pnpm", ["exec", "wrangler", "d1", "migrations", "apply", "wayfound", where, ...envArgs]);

console.log("→ Generating seed SQL");
run("pnpm", ["--filter", "@wayfound/db", "seed:sql", join(root, ".wrangler/seed.sql")], root);

console.log(`→ Loading demo data (${where})`);
run("pnpm", [
  "exec",
  "wrangler",
  "d1",
  "execute",
  "wayfound",
  where,
  ...envArgs,
  "--yes",
  "--file",
  join(root, ".wrangler/seed.sql"),
]);

if (!remote) {
  // Local R2 state only: uploaded photos from earlier pitches.
  rmSync(join(api, ".wrangler/state/v3/r2"), { recursive: true, force: true });
  console.log("→ Cleared local uploaded media");
}

console.log(
  "\n✓ Demo reset. Three demo businesses, seeded reviews, traffic and audit fixtures are ready.",
);
