import { type ProfileBundle, publicReviewButtons } from "@wayfound/core";
import { type Locale, type MessageKey, t } from "@wayfound/i18n";
import { Footer, Icon, LangSwitch } from "../layout.tsx";

/**
 * The page behind the NFC tap card / QR stand. Every visitor sees every public review
 * button. There is no rating step and no branch on sentiment: hiding public options from
 * unhappy visitors ("review gating") breaks Google's review policy.
 */
export function ReviewPage(p: {
  bundle: ProfileBundle;
  locale: Locale;
  staff: string;
  sent: boolean;
  hrefLang: (l: Locale) => string;
}) {
  const { bundle, locale } = p;
  const b = bundle.business;
  const tt = (k: MessageKey, v?: Record<string, string | number>) => t(locale, k, v);
  const buttons = publicReviewButtons(b.vertical, b.reviewLinks);
  const staffQ = p.staff ? `?staff=${encodeURIComponent(p.staff)}` : "";
  return (
    <>
      <div class="mx-auto flex max-w-md justify-end px-4 pt-3">
        <LangSwitch locale={locale} hrefFor={p.hrefLang} />
      </div>
      <main class="mx-auto max-w-md px-4 pt-6">
        <p class="text-center text-4xl text-terracotta-500" aria-hidden="true">
          ★★★★★
        </p>
        <h1 class="mt-3 text-center font-serif text-3xl font-semibold text-cobalt-900">
          {tt("review.title", { name: b.name })}
        </h1>
        <p class="mt-2 text-center text-ink-soft">{tt("review.lead")}</p>

        <ul class="mt-6 grid gap-3" data-review-buttons>
          {buttons.map((btn) => (
            <li>
              <a
                href={`/r/${b.slug}/go/${btn.platform}${staffQ}`}
                class="btn-secondary w-full py-4 text-lg"
                data-platform={btn.platform}
              >
                <span class="text-terracotta-500">
                  <Icon.star />
                </span>
                {tt("review.leaveOn", { platform: btn.label })}
              </a>
            </li>
          ))}
        </ul>

        <section class="card mt-8 p-5" aria-labelledby="private-title">
          <h2 id="private-title" class="font-semibold text-ink">
            {tt("review.privateTitle")}
          </h2>
          {p.sent ? (
            <p class="mt-2 rounded-lg bg-ok-soft p-3 text-sm text-ok" role="status">
              {tt("review.sent")}
            </p>
          ) : (
            <>
              <p class="mt-1 text-sm text-ink-soft">{tt("review.privateLead")}</p>
              <form method="post" action={`/r/${b.slug}/feedback`} class="mt-3 grid gap-3">
                <input type="hidden" name="lang" value={locale} />
                <input type="hidden" name="staff" value={p.staff} />
                <label class="grid gap-1 text-sm font-medium">
                  {tt("review.message")}
                  <textarea name="message" required rows={3} maxlength={2000} class="field" />
                </label>
                <label class="grid gap-1 text-sm font-medium">
                  <span>
                    {tt("review.contact")}{" "}
                    <span class="font-normal text-ink-soft">({tt("common.optional")})</span>
                  </span>
                  <input name="contact" maxlength={200} class="field" />
                </label>
                <button class="btn-secondary" type="submit">
                  {tt("common.send")}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
      <Footer locale={locale} isDemo={b.isDemo} />
    </>
  );
}

export function DemoRedirectPage(p: {
  locale: Locale;
  businessName: string;
  platform: string;
  target: string;
  back: string;
}) {
  const en = p.locale !== "tr";
  return (
    <main class="mx-auto max-w-md px-4 py-16 text-center">
      <p class="inline-block rounded-full bg-warn-soft px-3 py-1 text-xs font-medium text-warn">
        Demo
      </p>
      <h1 class="mt-4 font-serif text-2xl font-semibold text-cobalt-900">
        {en
          ? `This would open the ${p.platform} review form`
          : `Burada ${p.platform} yorum formu açılırdı`}
      </h1>
      <p class="mt-3 text-ink-soft">
        {en
          ? `${p.businessName} is an invented demo business, so there's no real ${p.platform} page to review. For a real client, this button goes straight to their review form.`
          : `${p.businessName} demo için uydurulmuş bir işletme; bu yüzden yorum yapılacak gerçek bir ${p.platform} sayfası yok. Gerçek bir müşteride bu buton doğrudan yorum formuna gider.`}
      </p>
      <p class="mt-2 break-all text-xs text-ink-soft">{p.target}</p>
      <a href={p.back} class="btn-secondary mt-6">
        ← {en ? "Back" : "Geri"}
      </a>
    </main>
  );
}
