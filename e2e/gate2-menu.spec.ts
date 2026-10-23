import { expect, test } from "@playwright/test";
import { CONSOLE, PUBLIC, phone, signIn } from "./helpers.ts";

test("Gate 2: a price edit in the admin shows on a phone right away", async ({ page, browser }) => {
  const lira = 100 + Math.floor(Math.random() * 800);

  await signIn(page, "cafe-owner");
  await page.goto(`${CONSOLE}/b/biz_cafe_lale/catalog`);
  const price = page.getByTestId("price-it_lale_09"); // Turkish coffee
  await expect(price).toBeVisible();
  await price.fill(String(lira));
  await price.press("Enter");
  await expect(page.getByTestId("saved-it_lale_09")).toBeVisible();

  const mobile = await phone(browser);
  await mobile.goto(`${PUBLIC}/m/cafe-lale?lang=en&cur=TRY`);
  const row = mobile.locator("#item-it_lale_09");
  await expect(row).toContainText(`₺${lira}`);
  await expect(row).toContainText("Turkish coffee");

  // The same edit is in the schema AI crawlers read.
  const jsonLd = await mobile.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain(`"price":"${lira}.00"`);
  await mobile.context().close();
});

test("Tourist view: language from the phone, currency switch, filters", async ({ browser }) => {
  const tr = await phone(browser, "tr-TR");
  await tr.goto(`${PUBLIC}/m/cafe-lale`);
  await expect(tr.locator("html")).toHaveAttribute("lang", "tr");
  await expect(tr.getByRole("heading", { name: "Menü" })).toBeVisible();
  await tr.context().close();

  const en = await phone(browser, "en-GB");
  await en.goto(`${PUBLIC}/m/cafe-lale?lang=en`);
  await expect(en.locator('nav[aria-label="Currency"] [aria-current="true"]')).toHaveText("GBP");
  await expect(en.locator("[data-rate-note]")).toContainText("approx.");
  await en.goto(`${PUBLIC}/m/cafe-lale?lang=en&diet=vegan&avoid=nuts`);
  const items = en.locator("[data-item]");
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(items.nth(i)).toHaveAttribute("data-diet", /vegan/);
    await expect(items.nth(i)).not.toHaveAttribute("data-allergens", /nuts/);
  }
  const wa = await en.locator("[data-whatsapp]").getAttribute("href");
  expect(wa).toMatch(/^https:\/\/wa\.me\/\d+\?text=Hi%20Caf%C3%A9%20Lale/);
  await en.context().close();
});
