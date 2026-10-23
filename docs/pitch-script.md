# 10-minute pitch script

**Live (recommended for pitches):** site https://wayfound.shab.boo, visitor pages https://go.wayfound.shab.boo, console https://app.wayfound.shab.boo. Real phones work here: scan the QR codes from the console. Reset the data first with the GitHub Actions workflow ("Run workflow" → _Reset the demo data_).

**Local:** run `pnpm demo:reset` and `pnpm dev`. The local links all point at `localhost`, so a real phone can't open them; use the browser's device emulation (DevTools → toggle device toolbar) for the phone steps.

Set `DEMO_WHATSAPP_OVERRIDE` in `apps/public/wrangler.jsonc` (production env) to your own number if you want WhatsApp buttons to reach a real phone. The agency demo account on the live site needs the passcode you set as `AGENCY_DEMO_CODE`.

## 1. The problem (1 min) · site home

- Open **/en/**. Read the headline: "When tourists ask AI where to go, be the answer."
- Point at the engines row: ChatGPT, Perplexity, Gemini, AI Overviews, plus the maps visitors actually use (Apple, Yandex).

## 2. The audit (2 min) · /en/audit

- Type the prospect's own business name, type and district. Leave the website empty or paste theirs.
- While it runs: "We ask the questions your visitors ask, in their languages."
- On the report, **say out loud that the engine answers are a sample** (the orange label). The website check is real.
- Walk the grid, then "who gets recommended instead", then the fix list. Each fix links to a service.
- Fill your own email in the unlock form to show the full report and that it lands as a lead.

> For a scripted run, type **Café Lale**, Restaurant / café, **Şişli**: it uses the seeded answer set and checks the café's real visitor page.

## 3. The QR menu (2 min) · phone

- Scan the menu QR from the console (live) or open `/m/cafe-lale?src=qr` in device emulation (local). It opens in the phone's language.
- Switch EN / TR, then € / £ / AED. Point at "≈ approx." and the rate date.
- Filters → Vegan + avoid Tree nuts. Tap WhatsApp: the booking message is already written.

## 4. One profile, everywhere (1 min) · console

- Console → **Café Lale (owner)** → Menu. Change the Turkish coffee price and press Enter.
- Reload the phone: the new price is there. "The schema AI crawlers read changed at the same moment."
- QR & print → download the table-tent PDF.

## 5. Clinics (2 min) · /c/defne-dental/implants-6-day

- Show the at-a-glance block, the four-stage roadmap and what's included.
- Fill the inquiry: WhatsApp opens with a full summary; the lead is already in the console.
- Console → Defne → Packages: the builder with EN/TR side by side and a draft preview.

## 6. Reviews (1.5 min) · /r/defne-dental?staff=S1

- Every visitor sees every review button. "We never hide Google from unhappy guests: that breaks Google's policy."
- Console → Reviews → pick a 2-star review → Draft reply (apologetic). Show the rules check passing.
- Type "you are wrong" into the reply: the rules block it.

## 7. Close (0.5 min) · agency overview

- Console → **Wayfound agency team** → Overview: clients, leads, open reviews, map listings.
- "Pure Virtual or Full-Stack Turnkey. Pricing: let's talk about your business."

## What not to claim

- Engine answers are sample data until real queries ship.
- Reply drafts and translation suggestions are mocked templates.
- The three businesses are invented.
