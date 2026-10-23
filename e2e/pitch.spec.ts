import { execSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import { CONSOLE, PUBLIC, phone, SITE, signIn } from "./helpers.ts";

// The 10-minute pitch from docs/pitch-script.md, end to end, from a clean reset.
test.describe.configure({ mode: "serial" });

test("Pitch walk-through after demo:reset", async ({ page, browser }) => {
  test.setTimeout(120_000);
  execSync("node scripts/demo-reset.mjs", { stdio: "pipe" });

  // 1. The site and the audit hook.
  await page.goto(`${SITE}/en/`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "When tourists ask AI where to go, be the answer",
  );
  await page.getByLabel("Your business name").fill("Café Lale");
  await page.getByLabel("District").fill("Şişli");
  await page.getByRole("button", { name: /Run the free audit/ }).click();
  await expect(page.locator("[data-sample-label]")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("[data-fix]").first()).toBeVisible();
  await page.getByLabel("Email").fill("pitch@example.com");
  await page.getByRole("button", { name: "Show the full report" }).click();
  await expect(page.locator("[data-unlocked]")).toBeVisible();

  // 2. The QR menu on a phone, in Turkish then English, with euros.
  const mobile = await phone(browser, "tr-TR");
  await mobile.goto(`${PUBLIC}/m/cafe-lale?src=qr`);
  await expect(mobile.getByRole("heading", { name: "Menü" })).toBeVisible();
  await mobile.getByRole("link", { name: "EN" }).click();
  await mobile.getByRole("link", { name: "EUR" }).click();
  await expect(mobile.locator("#item-it_lale_09")).toContainText("€");

  // 3. Owner edits a price; the phone shows it on reload.
  await signIn(page, "cafe-owner");
  await page.goto(`${CONSOLE}/b/biz_cafe_lale/catalog`);
  await page.getByTestId("price-it_lale_09").fill("150");
  await page.getByTestId("price-it_lale_09").press("Enter");
  await expect(page.getByTestId("saved-it_lale_09")).toBeVisible();
  await mobile.goto(`${PUBLIC}/m/cafe-lale?cur=TRY`);
  await expect(mobile.locator("#item-it_lale_09")).toContainText("₺150");

  // 4. Clinic package roadmap and inquiry hand-off.
  let wa = "";
  await mobile.route("**/inquiry", async (route) => {
    wa = (await route.fetch({ maxRedirects: 0 })).headers().location ?? "";
    await route.fulfill({ status: 200, body: "ok" });
  });
  await mobile.goto(`${PUBLIC}/c/defne-dental/implants-6-day?lang=en`);
  await mobile.getByLabel("Your name").fill("Pitch Patient");
  await mobile.getByLabel("Country you're travelling from").fill("Germany");
  await mobile.getByLabel("Preferred dates").fill("April");
  await mobile.getByRole("button", { name: "Continue on WhatsApp" }).click();
  await expect.poll(() => wa).toContain("wa.me");

  // 5. Review funnel, then the Reputation Desk.
  await mobile.goto(`${PUBLIC}/r/defne-dental?staff=S1`);
  await expect(mobile.locator("[data-review-buttons] [data-platform]")).toHaveCount(4);
  await mobile.context().close();

  // 6. Agency console: both leads arrived.
  await signIn(page, "agency");
  await page.goto(`${CONSOLE}/leads`);
  await expect(page.locator("[data-lead]", { hasText: "Café Lale" })).toBeVisible();
  await expect(page.locator("[data-lead]", { hasText: "Pitch Patient" })).toBeVisible();
  await page.goto(`${CONSOLE}/agency`);
  await expect(page.getByRole("heading", { name: "Agency overview" })).toBeVisible();
});
