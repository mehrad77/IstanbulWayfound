#!/usr/bin/env node
// Runs every app locally with prefixed output. Seeds the local database on first run.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const only = process.argv.slice(2);

if (!existsSync(join(root, "apps/api/.wrangler/state/v3/d1"))) {
  console.log("First run: creating and seeding the local database…");
  const r = spawnSync("node", ["scripts/demo-reset.mjs"], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const apps = [
  { name: "api", color: 35, cmd: ["pnpm", "--filter", "@wayfound/api", "dev"] },
  { name: "css", color: 90, cmd: ["pnpm", "--filter", "@wayfound/public", "css:watch"] },
  {
    name: "public",
    color: 36,
    cmd: [
      "pnpm",
      "--filter",
      "@wayfound/public",
      "exec",
      "wrangler",
      "dev",
      "--port",
      "8791",
      "--inspector-port",
      "9291",
    ],
  },
  { name: "site", color: 33, cmd: ["pnpm", "--filter", "@wayfound/site", "dev"] },
  { name: "console", color: 32, cmd: ["pnpm", "--filter", "@wayfound/console", "dev"] },
].filter((a) => !only.length || only.includes(a.name));

const children = apps.map((app) => {
  const child = spawn(app.cmd[0], app.cmd.slice(1), {
    cwd: root,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  const prefix = `\x1b[${app.color}m${app.name.padEnd(7)}\x1b[0m│ `;
  const pipe = (stream, out) => {
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk;
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) out.write(`${prefix}${line}\n`);
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on("exit", (code) => console.log(`${prefix}exited with ${code}`));
  return child;
});

console.log(`
  Site     http://localhost:4321
  Console  http://localhost:5173
  Public   http://localhost:8791
  API      http://localhost:8790/api/health
`);

const stop = () => {
  for (const c of children) c.kill("SIGINT");
  setTimeout(() => process.exit(0), 500);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
