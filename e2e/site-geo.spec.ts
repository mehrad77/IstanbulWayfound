import { expect, test } from "@playwright/test";
import { SITE } from "./helpers.ts";

const PAGES = [
  "/en/",
  "/tr/",
  "/en/services/geo/",
  "/tr/industries/clinics/",
  "/en/how-we-work/",
  "/en/audit/",
];

test("Site pages ship JSON-LD and EN/TR hreflang in the HTML (no client rendering needed)", async ({
  request,
}) => {
  for (const path of PAGES) {
    const html = await (await request.get(`${SITE}${path}`)).text();
    const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
    expect(json, path).toBeTruthy();
    const graph = JSON.parse(json!)["@graph"] as { "@type": string }[];
    const types = graph.map((n) => n["@type"]);
    expect(types, path).toEqual(expect.arrayContaining(["Organization", "ProfessionalService"]));
    if (path !== "/en/" && path !== "/tr/") expect(types, path).toContain("BreadcrumbList");
    for (const lang of ["en", "tr", "x-default"])
      expect(html, `${path} ${lang}`).toContain(`hreflang="${lang}"`);
  }
  const home = await (await request.get(`${SITE}/en/`)).text();
  expect(home).toContain('"FAQPage"');
  expect(home).toContain("When tourists ask AI where to go, be the answer");
});

test("Crawler files: robots.txt welcomes AI bots, llms.txt summarises the agency", async ({
  request,
}) => {
  const robots = await (await request.get(`${SITE}/robots.txt`)).text();
  for (const bot of ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"])
    expect(robots).toContain(`User-agent: ${bot}`);
  expect(robots).toContain("Sitemap:");
  const llms = await (await request.get(`${SITE}/llms.txt`)).text();
  expect(llms).toMatch(/^# Wayfound/);
  expect(llms).toContain("## Services");
});
