import { expect, test } from "@playwright/test";
import { CONSOLE, SITE, signIn, unique } from "./helpers.ts";

test("Gate 1: a prospect runs an audit and lands as a lead", async ({ page }) => {
  const name = unique("Gate One Kebap");
  const email = `owner+${Date.now()}@example.com`;

  await page.goto(`${SITE}/en/audit/`);
  await expect(page.locator("[data-audit-form][data-ready]")).toBeVisible();
  await page.getByLabel("Business name").fill(name);
  await page.getByLabel("Type of business").selectOption("dining");
  await page.getByLabel("District").fill("Kadıköy");
  await page.getByRole("button", { name: /Run the audit/ }).click();

  // The report is clearly labelled as sample data.
  const label = page.locator("[data-sample-label]");
  await expect(label).toBeVisible({ timeout: 20_000 });
  await expect(label).toContainText("Sample report");
  await expect(page.locator("[data-score]")).toHaveText(/^\d{1,3}$/);
  await expect(page).toHaveURL(/\/en\/audit\/\?id=aud_/);

  // Teaser until the lead form is filled.
  await expect(page.getByText(/more questions in the full report/)).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Show the full report" }).click();
  await expect(page.locator("[data-unlocked]")).toBeVisible();
  await expect(page.getByText(/more questions in the full report/)).toHaveCount(0);

  // The lead shows up in the agency console.
  await signIn(page, "agency");
  await page.goto(`${CONSOLE}/leads`);
  const lead = page.locator("[data-lead]", { hasText: name });
  await expect(lead).toBeVisible();
  await expect(lead).toContainText(email);
  await expect(lead).toContainText("Audit lead");
});

test("Seeded demo business gets its fixed answer set and a real website check", async ({
  request,
}) => {
  const res = await request.post("http://localhost:8790/api/audit", {
    data: {
      businessName: "Café Lale",
      vertical: "dining",
      district: "Şişli",
      website: "",
      languages: ["en"],
    },
  });
  expect(res.status()).toBe(201);
  const report = await res.json();
  expect(report.sample).toBe(true);
  expect(report.sources).toEqual(["seeded"]);
  const passed = report.checks
    .filter((c: { ok: boolean }) => c.ok)
    .map((c: { key: string }) => c.key);
  expect(passed).toEqual(
    expect.arrayContaining(["localBusiness", "address", "hours", "faq", "hreflang", "whatsapp"]),
  );
});
