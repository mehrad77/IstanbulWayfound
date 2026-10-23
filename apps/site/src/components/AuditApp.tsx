import {
  BRAND,
  ENGINES,
  type Fix,
  PILLARS,
  type Tally,
  type WebsiteCheck,
  whatsappUrl,
} from "@wayfound/core";
import { type Locale, t } from "@wayfound/i18n";
import { useEffect, useState } from "react";

interface Report {
  id: string;
  input: {
    businessName: string;
    vertical: string;
    district: string;
    website: string | null;
    languages: string[];
  };
  unlocked: boolean;
  sample: boolean;
  sources: string[];
  score: number;
  visibility: number;
  website: number;
  checks: WebsiteCheck[];
  signals: {
    error: string | null;
    finalUrl: string | null;
    responseMs: number | null;
    bytes: number | null;
  };
  competitors: Tally[];
  citedSources: Tally[];
  fixes: Fix[];
  totals: { prompts: number; fixes: number; competitors: number };
  grid: {
    prompt: string;
    lang: string;
    cells: { engine: string; outcome: "linked" | "mentioned" | "absent" }[];
  }[];
}

const SERVICE_SLUG = {
  1: "geo",
  2: "discovery",
  3: "funnels",
  4: "visual",
  5: "reputation",
} as const;

const copy = {
  en: {
    name: "Business name",
    vertical: "Type of business",
    district: "District",
    website: "Website",
    websiteHint: "Optional. We check it for the data AI engines read.",
    languages: "Visitor languages",
    run: "Run the audit",
    running: [
      "Writing tourist questions for your area",
      "Checking your website",
      "Reading engine answers",
      "Scoring and matching fixes",
    ],
    outOf: "out of 100",
    fromEngines: "from engine answers",
    fromSite: "from your website",
    more: (n: number) => `+ ${n} more questions in the full report`,
    unlock: "Show the full report",
    email: "Email",
    whatsapp: "or WhatsApp number",
    yourName: "Your name",
    sent: "Full report unlocked. We'll follow up within a working day.",
    talk: "Talk it through with us",
    again: "Audit another business",
    service: "Service",
    notChecked: "No website given, so only the engine answers were scored.",
    privacy: "We use your details only to send this report and follow up once.",
  },
  tr: {
    name: "İşletme adı",
    vertical: "Sektör",
    district: "Semt",
    website: "Web sitesi",
    websiteHint: "İsteğe bağlı. Yapay zekâ motorlarının okuduğu verileri kontrol ederiz.",
    languages: "Ziyaretçi dilleri",
    run: "Denetimi başlat",
    running: [
      "Bölgeniz için turist soruları yazılıyor",
      "Web siteniz kontrol ediliyor",
      "Motor yanıtları okunuyor",
      "Puanlanıyor ve düzeltmeler eşleştiriliyor",
    ],
    outOf: "100 üzerinden",
    fromEngines: "motor yanıtlarından",
    fromSite: "web sitenizden",
    more: (n: number) => `+ tam raporda ${n} soru daha`,
    unlock: "Raporun tamamını göster",
    email: "E-posta",
    whatsapp: "veya WhatsApp numarası",
    yourName: "Adınız",
    sent: "Raporun tamamı açıldı. Bir iş günü içinde size döneceğiz.",
    talk: "Bizimle konuşun",
    again: "Başka bir işletmeyi denetleyin",
    service: "Hizmet",
    notChecked: "Web sitesi verilmediği için yalnızca motor yanıtları puanlandı.",
    privacy: "Bilgilerinizi yalnızca bu raporu göndermek ve bir kez dönüş yapmak için kullanırız.",
  },
};

function Outcome({ o, lang }: { o: "linked" | "mentioned" | "absent"; lang: Locale }) {
  const label = t(
    lang,
    o === "linked" ? "audit.linked" : o === "mentioned" ? "audit.mentioned" : "audit.absent",
  );
  const cls =
    o === "linked"
      ? "bg-ok text-white"
      : o === "mentioned"
        ? "bg-ok-soft text-ok"
        : "bg-bad-soft text-bad";
  const icon = o === "linked" ? "🔗" : o === "mentioned" ? "✓" : "✕";
  return (
    <span
      className={`inline-flex size-8 items-center justify-center rounded-lg text-sm font-bold ${cls}`}
      title={label}
      role="img"
      aria-label={label}
      data-outcome={o}
    >
      {icon}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color =
    score >= 60 ? "var(--color-ok)" : score >= 35 ? "var(--color-warn)" : "var(--color-bad)";
  return (
    <svg viewBox="0 0 120 120" className="size-36" role="img" aria-label={`${score} / 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-paper-deep)" strokeWidth="12" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontSize="32"
        fontWeight="700"
        fill="var(--color-ink)"
        data-score
      >
        {score}
      </text>
    </svg>
  );
}

export default function AuditApp({ lang, apiUrl }: { lang: Locale; apiUrl: string }) {
  const c = copy[lang];
  const [form, setForm] = useState({
    businessName: "",
    vertical: "dining",
    district: "",
    website: "",
    languages: [lang === "tr" ? "tr" : "en"] as ("en" | "tr")[],
  });
  const [phase, setPhase] = useState<"form" | "running" | "report">("form");
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState({ name: "", email: "", whatsapp: "" });
  const [unlocking, setUnlocking] = useState(false);
  const [ready, setReady] = useState(false);

  async function call<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${apiUrl}/api${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok)
      throw new Error(json?.error?.issues?.[0]?.message ?? json?.error ?? "Request failed");
    return json as T;
  }

  function showReport(r: Report) {
    setReport(r);
    setPhase("report");
    const url = new URL(location.href);
    url.search = `?id=${r.id}`;
    history.replaceState(null, "", url);
  }

  async function run(input = form) {
    setError(null);
    setPhase("running");
    setStep(0);
    const ticker = setInterval(() => setStep((s) => Math.min(s + 1, c.running.length - 1)), 550);
    try {
      const [r] = await Promise.all([
        call<Report>("/audit", input),
        new Promise((res) => setTimeout(res, 2200)),
      ]);
      showReport(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("form");
    } finally {
      clearInterval(ticker);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on load to read the URL
  useEffect(() => {
    setReady(true);
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      call<Report>(`/audit/${encodeURIComponent(id)}`)
        .then(showReport)
        .catch(() => setPhase("form"));
      return;
    }
    const name = params.get("name");
    if (name) {
      const next = {
        ...form,
        businessName: name,
        vertical: params.get("vertical") ?? form.vertical,
        district: params.get("district") ?? "",
      };
      setForm(next);
      if (next.district) run(next);
    }
  }, []);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!report) return;
    setUnlocking(true);
    setError(null);
    try {
      setReport(await call<Report>(`/audit/${report.id}/unlock?lang=${lang}`, lead));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUnlocking(false);
    }
  }

  if (phase === "running") {
    return (
      <div className="card p-8" aria-live="polite">
        <ol className="grid gap-3">
          {c.running.map((label, i) => (
            <li
              key={label}
              className={`flex items-center gap-3 ${i <= step ? "text-ink" : "text-ink-soft/50"}`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${i < step ? "bg-ok text-white" : i === step ? "animate-pulse bg-cobalt-700 text-white" : "bg-paper-deep"}`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              {label}…
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (phase === "report" && report) {
    const hello = `${lang === "tr" ? "Merhaba Wayfound, denetim raporum hakkında konuşmak istiyorum" : "Hi Wayfound, I'd like to talk about my audit report"}: ${report.input.businessName} (${report.score}/100)`;
    return (
      <div className="grid gap-6" data-report={report.id}>
        {report.sample ? (
          <div
            className="rounded-2xl border-2 border-warn/40 bg-warn-soft p-4"
            role="note"
            data-sample-label
          >
            <p className="font-bold text-warn">⚠ {t(lang, "audit.sampleBadge")}</p>
            <p className="mt-1 text-sm text-ink">{t(lang, "audit.sampleExplain")}</p>
          </div>
        ) : null}

        <div className="card grid items-center gap-6 p-6 md:grid-cols-[auto_1fr]">
          <div className="text-center">
            <ScoreRing score={report.score} />
            <p className="text-sm text-ink-soft">{t(lang, "audit.score")}</p>
          </div>
          <div>
            <h2 className="font-serif text-3xl font-semibold text-cobalt-900">
              {report.input.businessName}
            </h2>
            <p className="text-ink-soft">
              {t(lang, `verticals.${report.input.vertical as "dining"}`)} · {report.input.district}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-paper-deep p-3">
                <dt className="text-ink-soft">{c.fromEngines}</dt>
                <dd className="text-xl font-semibold tabular-nums">{report.visibility} / 70</dd>
              </div>
              <div className="rounded-xl bg-paper-deep p-3">
                <dt className="text-ink-soft">{c.fromSite}</dt>
                <dd className="text-xl font-semibold tabular-nums">{report.website} / 30</dd>
              </div>
            </dl>
          </div>
        </div>

        <section className="card overflow-x-auto p-6">
          <h3 className="font-serif text-xl font-semibold text-cobalt-900">
            {t(lang, "audit.grid")}
          </h3>
          <table className="mt-4 w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-xs text-ink-soft">
                <th className="pb-2 text-start font-semibold"> </th>
                {ENGINES.map((e) => (
                  <th key={e} className="pb-2 text-center font-semibold">
                    {t(lang, `engines.${e}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.grid.map((row) => (
                <tr key={`${row.prompt}-${row.lang}`}>
                  <td className="py-2 pe-3 text-ink" lang={row.lang}>
                    “{row.prompt}”
                  </td>
                  {ENGINES.map((e) => {
                    const cell = row.cells.find((x) => x.engine === e);
                    return (
                      <td key={e} className="py-2 text-center">
                        {cell ? <Outcome o={cell.outcome} lang={lang} /> : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {!report.unlocked && report.totals.prompts > report.grid.length ? (
            <p className="mt-3 text-sm font-semibold text-cobalt-700">
              {c.more(report.totals.prompts - report.grid.length)}
            </p>
          ) : null}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="card p-6">
            <h3 className="font-semibold text-ink">{t(lang, "audit.recommendedInstead")}</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {report.competitors.map((x) => (
                <li key={x.name} className="flex justify-between gap-3">
                  <span>{x.name}</span>
                  <span className="tabular-nums text-ink-soft">×{x.count}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-6">
            <h3 className="font-semibold text-ink">{t(lang, "audit.citedSources")}</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {report.citedSources.map((x) => (
                <li key={x.name} className="flex justify-between gap-3">
                  <span>{x.name}</span>
                  <span className="tabular-nums text-ink-soft">×{x.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="card p-6">
          <h3 className="font-semibold text-ink">{t(lang, "audit.websiteCheck")}</h3>
          {report.input.website ? (
            <>
              <p className="mt-1 break-all text-xs text-ink-soft">
                {report.signals.finalUrl ?? report.input.website}
                {report.signals.responseMs !== null
                  ? ` · ${report.signals.responseMs} ms · ${Math.round((report.signals.bytes ?? 0) / 1024)} KB`
                  : ""}
                {report.signals.error ? ` · ${report.signals.error}` : ""}
              </p>
              <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2" data-website-checks>
                {report.checks.map((ch) => (
                  <li
                    key={ch.key}
                    className="flex items-center gap-2"
                    data-check={ch.key}
                    data-ok={ch.ok}
                  >
                    <span className={ch.ok ? "text-ok" : "text-bad"}>{ch.ok ? "✓" : "✕"}</span>
                    {ch.label[lang]}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">{c.notChecked}</p>
          )}
        </section>

        <section className="card p-6">
          <h3 className="font-serif text-xl font-semibold text-cobalt-900">
            {t(lang, "audit.fixList")}
          </h3>
          <ol className="mt-4 grid gap-3">
            {report.fixes.map((f) => (
              <li key={f.key} className="rounded-xl border border-line p-4" data-fix={f.key}>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-bold ${f.priority === "high" ? "bg-bad-soft text-bad" : f.priority === "medium" ? "bg-warn-soft text-warn" : "bg-paper-deep text-ink-soft"}`}
                  >
                    {f.priority}
                  </span>
                  <p className="font-semibold text-ink">{f.title[lang]}</p>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{f.why[lang]}</p>
                <a
                  className="mt-2 inline-block text-sm font-semibold text-cobalt-700"
                  href={`/${lang}/services/${SERVICE_SLUG[f.pillar]}/`}
                >
                  {c.service} {f.pillar}: {PILLARS[f.pillar].name[lang]} →
                </a>
              </li>
            ))}
          </ol>
          {!report.unlocked && report.totals.fixes > report.fixes.length ? (
            <p className="mt-3 text-sm font-semibold text-cobalt-700">
              + {report.totals.fixes - report.fixes.length}
            </p>
          ) : null}
        </section>

        {!report.unlocked ? (
          <form
            onSubmit={unlock}
            className="card grid gap-3 border-cobalt-300 p-6 sm:grid-cols-3"
            data-unlock-form
          >
            <div className="sm:col-span-3">
              <h3 className="font-serif text-xl font-semibold text-cobalt-900">
                {t(lang, "audit.unlockTitle")}
              </h3>
              <p className="text-sm text-ink-soft">{t(lang, "audit.unlockLead")}</p>
            </div>
            <label className="grid gap-1 text-sm font-medium">
              {c.yourName}
              <input
                className="field"
                name="name"
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              {c.email}
              <input
                className="field"
                type="email"
                name="email"
                value={lead.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              {c.whatsapp}
              <input
                className="field"
                type="tel"
                name="whatsapp"
                value={lead.whatsapp}
                onChange={(e) => setLead({ ...lead, whatsapp: e.target.value })}
              />
            </label>
            {error ? <p className="text-sm text-bad sm:col-span-3">{error}</p> : null}
            <button
              className="btn-primary sm:col-span-3"
              type="submit"
              disabled={unlocking || (!lead.email && !lead.whatsapp)}
            >
              {unlocking ? "…" : c.unlock}
            </button>
            <p className="text-xs text-ink-soft sm:col-span-3">{c.privacy}</p>
          </form>
        ) : (
          <div className="rounded-2xl bg-ok-soft p-4 text-sm text-ok" role="status" data-unlocked>
            {c.sent}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a className="btn-primary" href={whatsappUrl(BRAND.whatsapp, hello)}>
            {c.talk}
          </a>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setReport(null);
              setPhase("form");
              history.replaceState(null, "", location.pathname);
            }}
          >
            {c.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="card grid gap-4 p-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
      data-audit-form
      data-ready={ready ? "" : undefined}
    >
      <label className="grid gap-1 text-sm font-medium sm:col-span-2">
        {c.name}
        <input
          className="field"
          name="businessName"
          required
          minLength={2}
          value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {c.vertical}
        <select
          className="field"
          name="vertical"
          value={form.vertical}
          onChange={(e) => setForm({ ...form, vertical: e.target.value })}
        >
          <option value="dining">{t(lang, "verticals.dining")}</option>
          <option value="clinic">{t(lang, "verticals.clinic")}</option>
          <option value="retail">{t(lang, "verticals.retail")}</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        {c.district}
        <input
          className="field"
          name="district"
          required
          minLength={2}
          placeholder="Şişli, Osmanbey…"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium sm:col-span-2">
        {c.website}
        <input
          className="field"
          name="website"
          inputMode="url"
          placeholder="https://"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
        <span className="text-xs font-normal text-ink-soft">{c.websiteHint}</span>
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium">{c.languages}</legend>
        <div className="mt-2 flex gap-4 text-sm">
          {(["en", "tr"] as const).map((l) => (
            <label key={l} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="languages"
                value={l}
                checked={form.languages.includes(l)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...form.languages, l]
                    : form.languages.filter((x) => x !== l);
                  if (next.length) setForm({ ...form, languages: next });
                }}
              />
              {l === "en" ? "English" : "Türkçe"}
            </label>
          ))}
          <span className="text-xs text-ink-soft">
            {lang === "tr" ? "Arapça ve Rusça demodan sonra" : "Arabic and Russian after the demo"}
          </span>
        </div>
      </fieldset>
      {error ? <p className="text-sm text-bad sm:col-span-2">{error}</p> : null}
      <button className="btn-primary sm:col-span-2" type="submit">
        {c.run} →
      </button>
    </form>
  );
}
