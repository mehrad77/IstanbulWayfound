import { BRAND, PILLARS } from "@wayfound/core";
import type { APIRoute } from "astro";
import { homeFaqs } from "../lib/copy.ts";
import { industries } from "../lib/industries.ts";
import { services } from "../lib/services.ts";

/** llms.txt: a plain summary of the agency for language models (https://llmstxt.org). */
export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "";
  const lines = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.name} is an Istanbul agency that helps local clinics, restaurants, cafés, boutiques and showrooms get found and chosen by international visitors on maps, in directories and in AI answer engines such as ChatGPT, Perplexity and Google AI Overviews. It works in English and Turkish, mostly remotely.`,
    "",
    "## Services",
    ...services.map(
      (s) => `- [${PILLARS[s.pillar].name.en}](${base}/en/services/${s.slug}/): ${s.lead.en}`,
    ),
    "",
    "## Industries",
    ...industries.map((i) => `- [${i.title.en}](${base}/en/industries/${i.slug}/): ${i.lead.en}`),
    "",
    "## Free tool",
    `- [AI Visibility Audit](${base}/en/audit/): shows whether AI engines mention a business for tourist questions about its area, who they recommend instead and which fixes would help. In the demo, engine answers are labelled sample data.`,
    "",
    "## FAQ",
    ...homeFaqs.flatMap((f) => [`### ${f.q.en}`, f.a.en, ""]),
    "## Optional",
    `- [Türkçe site](${base}/tr/)`,
    `- [How we work](${base}/en/how-we-work/)`,
    `- Contact: ${BRAND.email}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
};
