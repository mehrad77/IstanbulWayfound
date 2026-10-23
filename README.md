# Wayfound demo

A clickable demo for an Istanbul agency that helps clinics, cafés and showrooms get found by international visitors and AI answer engines. Built from the _Foundational Demo Proposal_ doc.

**Scope:** a bilingual (EN/TR) marketing site and four apps: the AI Visibility Audit, the QR Menu / Catalog with an owner admin, the Clinic Package Portal, and the Review Funnel with a Reputation Desk. One **Business Profile** per client feeds all of them. Everything runs on Cloudflare Workers, D1, R2 and KV, locally for now.

## Run it

```bash
pnpm install
pnpm dev          # first run creates and seeds the local database
```

| App           | URL                              | What                                      |
| ------------- | -------------------------------- | ----------------------------------------- |
| Site          | http://localhost:4321            | Astro, static, EN/TR, JSON-LD, llms.txt   |
| Console       | http://localhost:5173            | React owner admin + agency views          |
| Visitor pages | http://localhost:8791            | Worker, server-rendered `/m`, `/c`, `/r`  |
| API           | http://localhost:8790/api/health | Worker (Hono), the only owner of D1/R2/KV |

On the console's login page, sign in with one of the demo accounts: Café Lale owner, Selvi Textile Showroom owner, Defne Dental Clinic owner, or the agency team.

```bash
pnpm demo:reset   # reseed local D1 and clear uploaded photos (local only; --remote asks first)
pnpm test         # unit tests: JSON-LD (Gate 0), scoring, FX, reply rules, no review gating
pnpm e2e          # Playwright gates 1–4 and the pitch walk-through (needs pnpm dev; wipes the local database)
pnpm typecheck && pnpm lint
```

## Layout

```
apps/site      Astro marketing site (static) + the audit React island
apps/public    Visitor pages Worker (Hono JSX), calls the API over a service binding
apps/console   React SPA + a thin Worker that proxies /api/* to the API (same-origin cookies)
apps/api       Hono API Worker: auth, Business Profile, audit engine, leads, events, FX cron
packages/core  Domain types, audit scoring and fix rules, FX, WhatsApp links, AiProvider seam
packages/db    Drizzle schema, migrations, profile queries, seed data → SQL
packages/schema  JSON-LD builders
packages/i18n  EN/TR UI strings, locale negotiation, dir helper (RTL-ready)
packages/ui    Design tokens and Tailwind theme
docs/pitch-script.md   The 10-minute demo script
```

## What's real and what's sample

| Part                                           | In the demo                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| Business Profile, admin, public pages, JSON-LD | Real                                                              |
| Website check in the audit                     | Real (fetch + HTMLRewriter; http(s) only, 8 s, 3 redirects, 2 MB) |
| Exchange rates                                 | Real (Frankfurter daily, AED from the USD peg)                    |
| Engine answers in the audit                    | **Sample**, labelled from each result's `source` field            |
| Reply drafts, translation suggestions          | Mocked behind `AiProvider` (`packages/core/src/ai.ts`)            |
| Magic-link email                               | Stubbed: the link is logged and shown in demo mode                |
| The three businesses                           | Invented                                                          |

## Deploy

Live at **https://wayfound.shab.boo** (site), **go.**, **app.** and **api.wayfound.shab.boo**. Each app has an `env.production` block in its `wrangler.jsonc`; `pnpm deploy` deploys all four in order (API first).

`.github/workflows/deploy.yml` runs typecheck, lint, unit tests and builds on every PR, and on `main` it also migrates D1, seeds it on the first deploy only, deploys the four Workers and smoke-tests them. "Run workflow" with _Reset the demo data_ wipes and reseeds production.

Repository secrets it needs:

| Secret                 | What                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | API token from the "Edit Cloudflare Workers" template, plus **D1: Edit**, scoped to the account and the `shab.boo` zone |
| `AGENCY_DEMO_CODE`     | Passcode for the agency demo sign-in on the live site. Without it the agency account can't sign in there                |

Production differences from local: `ALLOW_PRIVATE_FETCH` is off, sign-in links are never shown on screen, the agency account needs the passcode (it holds real prospects' leads), audits and sign-ins are rate limited per IP, and there's no cron (the account is on Workers Free with all 5 crons in use), so FX rates refresh on the first request after the daily cache expires.
