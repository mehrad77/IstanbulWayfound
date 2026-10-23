import { expect, test } from "@playwright/test";
import { agencyApi, CONSOLE, PUBLIC, phone } from "./helpers.ts";

test("Gate 3: an inquiry opens WhatsApp with a complete summary", async ({ browser, request }) => {
  const page = await phone(browser);
  const name = `Gate Three ${Date.now().toString(36)}`;
  let waUrl = "";
  // Capture the 303 hand-off without letting the browser leave for wa.me.
  await page.route("**/inquiry", async (route) => {
    const response = await route.fetch({ maxRedirects: 0 });
    waUrl = response.headers().location ?? "";
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<p>Handed off to WhatsApp</p>",
    });
  });

  await page.goto(`${PUBLIC}/c/defne-dental/implants-6-day?lang=en`);
  await expect(page.locator("[data-stage]")).toHaveCount(4);
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Country you're travelling from").fill("United Kingdom");
  await page.getByLabel("Preferred dates").fill("first week of March");
  await page.getByRole("button", { name: "Continue on WhatsApp" }).click();
  await expect.poll(() => waUrl).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);

  const text = new URL(waUrl).searchParams.get("text") ?? "";
  expect(text).toContain("Defne Dental Clinic");
  expect(text).toContain("Dental implants, 6-day package");
  expect(text).toContain(name);
  expect(text).toContain("United Kingdom");
  expect(text).toContain("first week of March");
  expect(text).toContain("Dental implant placement");
  await page.context().close();

  // The inquiry is saved as a lead for the clinic.
  await agencyApi(request);
  const res = await request.get(`${CONSOLE}/api/console/leads`);
  const { leads } = await res.json();
  const lead = leads.find((l: { name: string }) => l.name === name);
  expect(lead?.kind).toBe("inquiry");
  expect(lead?.businessId).toBe("biz_defne");
});

test("Draft packages are hidden publicly but previewable with a token", async ({ request }) => {
  await agencyApi(request);
  const list = await (
    await request.get(`${CONSOLE}/api/console/businesses/biz_defne/packages`)
  ).json();
  const whitening = list.packages.find((p: { slug: string }) => p.slug === "whitening-2-day");
  const pkg = (
    await (
      await request.get(`${CONSOLE}/api/console/businesses/biz_defne/packages/${whitening.id}`)
    ).json()
  ).package;
  const body = (published: boolean) => ({
    ...pkg,
    published,
    id: undefined,
    updatedAt: undefined,
    steps: pkg.steps.map(({ id: _id, ...s }: { id: string }) => s),
    faqs: pkg.faqs.map(({ id: _id, ...f }: { id: string }) => f),
  });
  expect(
    (
      await request.put(`${CONSOLE}/api/console/businesses/biz_defne/packages/${whitening.id}`, {
        data: body(false),
      })
    ).ok(),
  ).toBeTruthy();
  try {
    expect((await request.get(`${PUBLIC}/c/defne-dental/whitening-2-day`)).status()).toBe(404);
    const { token } = await (
      await request.post(`${CONSOLE}/api/console/businesses/biz_defne/preview-token`)
    ).json();
    const preview = await request.get(`${PUBLIC}/c/defne-dental/whitening-2-day?preview=${token}`);
    expect(preview.status()).toBe(200);
    expect(await preview.text()).toContain('content="noindex"');
  } finally {
    await request.put(`${CONSOLE}/api/console/businesses/biz_defne/packages/${whitening.id}`, {
      data: body(true),
    });
  }
});
