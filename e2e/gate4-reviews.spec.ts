import { expect, test } from "@playwright/test";
import { CONSOLE, PUBLIC, phone, signIn } from "./helpers.ts";

const EXPECTED = {
  "cafe-lale": ["google", "tripadvisor"],
  "selvi-showroom": ["google", "tripadvisor"],
  "defne-dental": ["google", "tripadvisor", "realself", "whatclinic"],
} as const;

test("Gate 4: every visitor sees every public review option (no review gating)", async ({
  browser,
}) => {
  const page = await phone(browser);
  for (const [slug, platforms] of Object.entries(EXPECTED)) {
    for (const url of [
      `${PUBLIC}/r/${slug}`,
      `${PUBLIC}/r/${slug}?staff=S1&lang=tr`,
      `${PUBLIC}/r/${slug}?sent=1`,
    ]) {
      await page.goto(url);
      const buttons = page.locator("[data-review-buttons] [data-platform]");
      await expect(buttons).toHaveCount(platforms.length);
      expect(
        await buttons.evaluateAll((els) => els.map((e) => e.getAttribute("data-platform"))),
      ).toEqual([...platforms]);
    }
  }
  // Leaving private (negative) feedback never removes the public options.
  await page.goto(`${PUBLIC}/r/cafe-lale?staff=S2&lang=en`);
  await page.getByLabel("Your message").fill("The coffee was cold and we waited 30 minutes.");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status")).toContainText("went straight to the team");
  await expect(page.locator("[data-review-buttons] [data-platform]")).toHaveCount(2);

  // The staff code is tracked on the outbound tap.
  await page.goto(`${PUBLIC}/r/cafe-lale/go/google?staff=S2&lang=en`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Google review form");
  await page.context().close();
});

test("Gate 4: Reputation Desk drafts pass the reply rules and blocks rule breaks", async ({
  page,
}) => {
  await signIn(page, "clinic-owner");
  await page.goto(`${CONSOLE}/b/biz_defne/reviews`);
  await expect(page.getByTestId("review-inbox").locator("li").first()).toBeVisible();
  await page.getByTestId("review-inbox").getByText("Paul Davies").click();
  await page.getByRole("button", { name: "apologetic" }).click();
  await page.getByRole("button", { name: /Draft reply/ }).click();
  const reply = page.getByTestId("reply-text");
  await expect(reply).toHaveValue(/Paul/);
  await expect(page.getByText("Passes the reply rules")).toBeVisible();
  await expect(page.getByRole("button", { name: /Approve and copy/ })).toBeEnabled();

  await reply.fill("You are wrong, your implant treatment went fine.");
  const violations = page.getByTestId("rule-violations");
  await expect(violations).toContainText("Mentions a treatment");
  await expect(violations).toContainText("Argues");
  await expect(violations).toContainText("direct contact");
  await expect(page.getByRole("button", { name: /Approve and copy/ })).toBeDisabled();
});
