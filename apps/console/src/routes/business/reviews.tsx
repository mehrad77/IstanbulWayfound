import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { REPLY_TONES, type ReplyTone } from "@wayfound/core";
import clsx from "clsx";
import { Check, Copy, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Card, ErrorNote, Spinner, Stat, Textarea } from "../../components/ui.tsx";
import { ApiError, api } from "../../lib/api.ts";
import { ago } from "../../lib/format.ts";
import type { Review } from "../../lib/types.ts";

interface ReviewsResponse {
  reviews: Review[];
  metrics: {
    average: number | null;
    count: number;
    perWeek: number;
    replyRate: number;
    medianReplyHours: number | null;
  };
}

const RULE_TEXT: Record<string, string> = {
  mentionsTreatment: "Mentions a treatment or confirms someone is a patient",
  argues: "Argues with the reviewer",
  noDirectContact: "Doesn't offer a direct contact",
};
const LANG = { en: "English", tr: "Turkish", de: "German", ar: "Arabic", ru: "Russian" } as Record<
  string,
  string
>;

function ReviewDetail({
  review,
  bid,
  onDone,
}: {
  review: Review;
  bid: string;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [tone, setTone] = useState<ReplyTone>(review.rating >= 4 ? "warm" : "apologetic");
  const [text, setText] = useState(review.draft?.text ?? review.replyText ?? "");
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const violations = useQuery({
    queryKey: ["rules", bid, text],
    queryFn: () =>
      api<{ violations: string[] }>(`/console/businesses/${bid}/reviews/${review.id}/check`, {
        method: "POST",
        json: { text },
      }).then((r) => r.violations),
    enabled: text.trim().length > 1,
  });
  const draft = useMutation({
    mutationFn: () =>
      api<{ draft: { text: string }; fallbackLang: boolean }>(
        `/console/businesses/${bid}/reviews/${review.id}/draft`,
        { method: "POST", json: { tone } },
      ),
    onSuccess: (r) => {
      setText(r.draft.text);
      setNote(
        r.fallbackLang
          ? `Drafted in English: ${LANG[review.lang] ?? review.lang} replies come after the demo.`
          : null,
      );
      qc.invalidateQueries({ queryKey: ["reviews", bid] });
    },
  });
  const approve = useMutation({
    mutationFn: async () => {
      await api(`/console/businesses/${bid}/reviews/${review.id}/reply`, {
        method: "POST",
        json: { text },
      });
      await navigator.clipboard.writeText(text).catch(() => {});
    },
    onSuccess: () => {
      setCopied(true);
      qc.invalidateQueries({ queryKey: ["reviews", bid] });
      setTimeout(onDone, 1200);
    },
  });
  const blocking = violations.data ?? [];

  return (
    <Card className="grid content-start gap-4 p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-terracotta-500">{"★".repeat(review.rating)}</span>
          <span className="text-line">{"★".repeat(5 - review.rating)}</span>
          <span className="font-semibold">{review.author}</span>
          <Badge>{review.platform}</Badge>
          <Badge tone="info">{LANG[review.lang] ?? review.lang}</Badge>
          <span className="text-xs text-ink-soft">{ago(review.postedAt)}</span>
        </div>
        <p
          className="mt-2 text-ink"
          lang={review.lang}
          dir={review.lang === "ar" ? "rtl" : undefined}
        >
          {review.text}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {review.topics.map((t) => (
            <Badge key={t}>{t.replace("_", " ")}</Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label">Tone</span>
          {REPLY_TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                tone === t
                  ? "border-cobalt-700 bg-cobalt-700 text-white"
                  : "border-line bg-white text-ink-soft",
              )}
            >
              {t}
            </button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            className="ms-auto"
            onClick={() => draft.mutate()}
            disabled={draft.isPending}
          >
            <Sparkles className="size-3.5" /> {draft.isPending ? "Drafting…" : "Draft reply"}
          </Button>
        </div>
        <p className="text-xs text-ink-soft">
          Drafts are mocked in the demo (templates, not a language model). They follow the same
          rules a real model will.
        </p>
        <Textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Draft a reply, or write your own"
          lang={review.lang}
          data-testid="reply-text"
        />
        {note ? <p className="text-xs text-warn">{note}</p> : null}
        {text.trim().length > 1 ? (
          blocking.length ? (
            <ul
              className="grid gap-1 rounded-lg bg-bad-soft p-3 text-sm text-bad"
              data-testid="rule-violations"
            >
              {blocking.map((v) => (
                <li key={v}>✕ {RULE_TEXT[v] ?? v}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ok">
              ✓ Passes the reply rules: no treatment details, no arguing, offers a direct contact.
            </p>
          )
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => approve.mutate()}
            disabled={!text.trim() || blocking.length > 0 || approve.isPending}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{" "}
            {copied ? "Copied, marked as replied" : "Approve and copy"}
          </Button>
          <span className="text-xs text-ink-soft">
            Then paste it on {review.platform}. Posting through platform APIs comes later.
          </span>
        </div>
        <ErrorNote error={approve.error instanceof ApiError ? approve.error : null} />
      </div>
    </Card>
  );
}

export function ReviewsPage() {
  const { bid } = useParams({ from: "/app/b/$bid/reviews" });
  const [filter, setFilter] = useState<"open" | "all" | "replied">("open");
  const [selected, setSelected] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", bid],
    queryFn: () => api<ReviewsResponse>(`/console/businesses/${bid}/reviews`),
  });
  const list = useMemo(
    () =>
      (data?.reviews ?? []).filter((r) =>
        filter === "all"
          ? true
          : filter === "open"
            ? r.status !== "replied"
            : r.status === "replied",
      ),
    [data, filter],
  );
  if (isLoading || !data) return <Spinner />;
  const current = data.reviews.find((r) => r.id === (selected ?? list[0]?.id));
  const m = data.metrics;
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Average rating"
          value={m.average?.toFixed(2) ?? "—"}
          hint={`${m.count} reviews`}
        />
        <Stat label="Reviews per week" value={m.perWeek.toFixed(1)} hint="last 4 weeks" />
        <Stat label="Reply rate" value={`${Math.round(m.replyRate * 100)}%`} />
        <Stat
          label="Median reply time"
          value={m.medianReplyHours !== null ? `${Math.round(m.medianReplyHours)} h` : "—"}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="grid content-start gap-2">
          <div className="flex gap-1">
            {(["open", "all", "replied"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "primary" : "secondary"}
                onClick={() => setFilter(f)}
              >
                {f === "open" ? "To answer" : f === "all" ? "All" : "Replied"}
              </Button>
            ))}
          </div>
          <ul
            className="card max-h-[70dvh] divide-y divide-line overflow-y-auto"
            data-testid="review-inbox"
          >
            {list.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={clsx(
                    "w-full p-3 text-start hover:bg-paper",
                    current?.id === r.id && "bg-cobalt-50",
                  )}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className={r.rating <= 2 ? "text-bad" : "text-terracotta-500"}>
                      {"★".repeat(r.rating)}
                    </span>
                    <span className="truncate font-semibold">{r.author}</span>
                    <span className="ms-auto text-xs text-ink-soft">{ago(r.postedAt)}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{r.text}</p>
                  <div className="mt-1 flex gap-1">
                    <Badge>{r.platform}</Badge>
                    <Badge tone="info">{r.lang}</Badge>
                    {r.status === "drafted" ? (
                      <Badge tone="warn">draft</Badge>
                    ) : r.status === "replied" ? (
                      <Badge tone="ok">replied</Badge>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {current ? (
          <ReviewDetail
            key={current.id}
            review={current}
            bid={bid}
            onDone={() => setSelected(null)}
          />
        ) : (
          <p className="text-ink-soft">All caught up.</p>
        )}
      </div>
    </div>
  );
}
