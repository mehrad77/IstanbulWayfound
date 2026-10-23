import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { seedSql } from "../src/seed/sql.ts";

const target = resolve(process.argv[2] ?? "../../.wrangler/seed.sql");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, seedSql());
console.log(`Wrote ${target}`);
