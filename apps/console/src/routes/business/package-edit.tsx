import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { INCLUSIONS, type Localized, STAGES, STEP_OWNERS } from "@wayfound/core";
import { t } from "@wayfound/i18n";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  ErrorNote,
  Field,
  Input,
  LocalizedField,
  Spinner,
} from "../../components/ui.tsx";
import { api, PUBLIC_ORIGIN } from "../../lib/api.ts";
import { useBusiness } from "../../lib/session.ts";
import type { EditablePackage } from "../../lib/types.ts";

const L = (): Localized => ({ en: "", tr: "" });
const LANGS = ["en", "tr", "ar", "de", "ru", "fr"];

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

export function PackageEditPage() {
  const { bid, pid } = useParams({ from: "/app/b/$bid/packages/$pid" });
  const biz = useBusiness(bid)!;
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["package", bid, pid],
    queryFn: () =>
      api<{ package: EditablePackage }>(`/console/businesses/${bid}/packages/${pid}`).then(
        (r) => r.package,
      ),
  });
  const [pkg, setPkg] = useState<EditablePackage | null>(null);
  const [preview, setPreview] = useState<"en" | "tr" | null>(null);
  const token = useQuery({
    queryKey: ["preview-token", bid],
    queryFn: () =>
      api<{ token: string }>(`/console/businesses/${bid}/preview-token`, { method: "POST" }).then(
        (r) => r.token,
      ),
    enabled: preview !== null,
    staleTime: 5 * 60_000,
  });
  useEffect(() => {
    if (data) setPkg(data);
  }, [data]);

  const save = useMutation({
    mutationFn: (p: EditablePackage) => {
      const { id: _id, updatedAt: _u, ...rest } = p;
      return api(`/console/businesses/${bid}/packages/${pid}`, {
        method: "PUT",
        json: {
          ...rest,
          steps: rest.steps.map(({ id: _s, ...s }) => s),
          faqs: rest.faqs.map(({ id: _f, ...f }) => f),
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["package", bid, pid] });
      qc.invalidateQueries({ queryKey: ["packages", bid] });
      setPreview((v) => v);
    },
  });

  if (!pkg) return <Spinner />;
  const set = <K extends keyof EditablePackage>(k: K, v: EditablePackage[K]) =>
    setPkg({ ...pkg, [k]: v });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="grid gap-5">
        <Link
          to="/b/$bid/packages"
          params={{ bid }}
          className="text-sm font-semibold text-cobalt-700"
        >
          ← All packages
        </Link>
        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold text-ink">Package</h2>
          <LocalizedField label="Name" value={pkg.name} onChange={(v) => set("name", v)} />
          <LocalizedField
            label="Summary"
            value={pkg.summary}
            multiline
            onChange={(v) => set("summary", v)}
          />
          <LocalizedField
            label="Procedure name (for schema)"
            value={pkg.procedureName}
            onChange={(v) => set("procedureName", v)}
          />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="URL slug">
              <Input
                value={pkg.slug}
                onChange={(e) =>
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                }
              />
            </Field>
            <Field label="Days in Istanbul">
              <Input
                type="number"
                min={1}
                value={pkg.daysInIstanbul}
                onChange={(e) => set("daysInIstanbul", Number(e.target.value))}
              />
            </Field>
            <Field label="Clinic visits">
              <Input
                type="number"
                min={1}
                value={pkg.visits}
                onChange={(e) => set("visits", Number(e.target.value))}
              />
            </Field>
            <Field label="From price (₺)">
              <Input
                type="number"
                min={0}
                value={pkg.priceFromKurus / 100}
                onChange={(e) => set("priceFromKurus", Math.round(Number(e.target.value) * 100))}
              />
            </Field>
          </div>
          <LocalizedField
            label="What changes the price"
            value={pkg.priceFactors}
            multiline
            onChange={(v) => set("priceFactors", v)}
          />
          <div>
            <p className="label">Languages spoken</p>
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              {LANGS.map((l) => (
                <label key={l} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={pkg.languages.includes(l)}
                    onChange={(e) =>
                      set(
                        "languages",
                        e.target.checked
                          ? [...pkg.languages, l]
                          : pkg.languages.filter((x) => x !== l),
                      )
                    }
                  />
                  {l.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="label">What's included</p>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              {INCLUSIONS.map((key) => {
                const inc = pkg.inclusions.find((i) => i.key === key);
                return (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={inc?.included ?? false}
                      onChange={(e) =>
                        set("inclusions", [
                          ...INCLUSIONS.map((k) => ({
                            key: k,
                            included:
                              k === key
                                ? e.target.checked
                                : (pkg.inclusions.find((i) => i.key === k)?.included ?? false),
                          })),
                        ])
                      }
                    />
                    {t("en", `clinic.inclusions.${key}`)}
                  </label>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="grid gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Roadmap steps</h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                set("steps", [
                  ...pkg.steps,
                  { stage: "treatment", owner: "clinic", dayLabel: L(), title: L(), detail: L() },
                ])
              }
            >
              <Plus className="size-3.5" /> Add step
            </Button>
          </div>
          {pkg.steps.map((s, i) => (
            <div key={s.id ?? `new-${i}`} className="grid gap-2 rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Stage"
                  className="field w-auto py-1"
                  value={s.stage}
                  onChange={(e) =>
                    set(
                      "steps",
                      pkg.steps.map((x, j) => (j === i ? { ...x, stage: e.target.value } : x)),
                    )
                  }
                >
                  {STAGES.map((st) => (
                    <option key={st} value={st}>
                      {t("en", `clinic.stages.${st}`)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Who"
                  className="field w-auto py-1"
                  value={s.owner}
                  onChange={(e) =>
                    set(
                      "steps",
                      pkg.steps.map((x, j) => (j === i ? { ...x, owner: e.target.value } : x)),
                    )
                  }
                >
                  {STEP_OWNERS.map((o) => (
                    <option key={o} value={o}>
                      {t("en", `clinic.who.${o}`)}
                    </option>
                  ))}
                </select>
                <span className="ms-auto flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Move up"
                    onClick={() => set("steps", move(pkg.steps, i, -1))}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Move down"
                    onClick={() => set("steps", move(pkg.steps, i, 1))}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label="Remove step"
                    onClick={() =>
                      set(
                        "steps",
                        pkg.steps.filter((_, j) => j !== i),
                      )
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </span>
              </div>
              <LocalizedField
                label="When"
                value={s.dayLabel}
                onChange={(v) =>
                  set(
                    "steps",
                    pkg.steps.map((x, j) => (j === i ? { ...x, dayLabel: v } : x)),
                  )
                }
              />
              <LocalizedField
                label="Step"
                value={s.title}
                onChange={(v) =>
                  set(
                    "steps",
                    pkg.steps.map((x, j) => (j === i ? { ...x, title: v } : x)),
                  )
                }
              />
              <LocalizedField
                label="Detail"
                value={s.detail}
                multiline
                onChange={(v) =>
                  set(
                    "steps",
                    pkg.steps.map((x, j) => (j === i ? { ...x, detail: v } : x)),
                  )
                }
              />
            </div>
          ))}
        </Card>

        <Card className="grid gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Package FAQ</h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => set("faqs", [...pkg.faqs, { question: L(), answer: L() }])}
            >
              <Plus className="size-3.5" /> Add question
            </Button>
          </div>
          {pkg.faqs.map((f, i) => (
            <div key={f.id ?? `new-${i}`} className="grid gap-2 rounded-xl border border-line p-3">
              <LocalizedField
                label="Question"
                value={f.question}
                onChange={(v) =>
                  set(
                    "faqs",
                    pkg.faqs.map((x, j) => (j === i ? { ...x, question: v } : x)),
                  )
                }
              />
              <LocalizedField
                label="Answer"
                value={f.answer}
                multiline
                onChange={(v) =>
                  set(
                    "faqs",
                    pkg.faqs.map((x, j) => (j === i ? { ...x, answer: v } : x)),
                  )
                }
              />
              <Button
                size="sm"
                variant="danger"
                className="justify-self-start"
                onClick={() =>
                  set(
                    "faqs",
                    pkg.faqs.filter((_, j) => j !== i),
                  )
                }
              >
                <Trash2 className="size-3.5" /> Remove
              </Button>
            </div>
          ))}
        </Card>

        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white/95 p-3 shadow-[var(--shadow-card)] backdrop-blur">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={pkg.published}
              onChange={(e) => set("published", e.target.checked)}
            />{" "}
            Published
          </label>
          <Button onClick={() => save.mutate(pkg)} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save package"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              save.mutate(pkg);
              setPreview("en");
            }}
          >
            Save and preview
          </Button>
          {save.isSuccess ? <span className="text-sm text-ok">Saved</span> : null}
          <ErrorNote error={save.error} />
        </div>
      </div>

      <aside className="xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)]">
        <Card className="flex h-full min-h-[600px] flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line p-2 text-sm">
            <span className="font-semibold">Preview</span>
            {(["en", "tr"] as const).map((l) => (
              <Button
                key={l}
                size="sm"
                variant={preview === l ? "primary" : "secondary"}
                onClick={() => setPreview(l)}
              >
                {l.toUpperCase()}
              </Button>
            ))}
            {!pkg.published ? (
              <span className="ms-auto text-xs text-warn">Draft: visible only here</span>
            ) : null}
          </div>
          {preview && token.data ? (
            <iframe
              key={`${preview}-${save.submittedAt}`}
              title="Package preview"
              className="w-full flex-1"
              src={`${PUBLIC_ORIGIN}/c/${biz.slug}/${data?.slug ?? pkg.slug}?lang=${preview}&preview=${token.data}`}
            />
          ) : (
            <p className="p-6 text-sm text-ink-soft">
              Save, then preview the public page in English or Turkish.
            </p>
          )}
        </Card>
      </aside>
    </div>
  );
}
