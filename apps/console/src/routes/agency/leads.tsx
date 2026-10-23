import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { whatsappUrl } from "@wayfound/core";
import { Badge, Card, Empty, PageHeader, Spinner } from "../../components/ui.tsx";
import { api } from "../../lib/api.ts";
import { ago, dateTime } from "../../lib/format.ts";
import { useBusinesses } from "../../lib/session.ts";
import type { Lead } from "../../lib/types.ts";

const STATUS_TONE = { new: "info", contacted: "warn", won: "ok", lost: "neutral" } as const;

export function LeadsPage() {
  const { user } = useRouteContext({ from: "/app" });
  const qc = useQueryClient();
  const { data: businesses = [] } = useBusinesses();
  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api<{ leads: Lead[] }>("/console/leads").then((r) => r.leads),
    refetchInterval: 5000,
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead["status"] }) =>
      api(`/console/leads/${id}`, { method: "PATCH", json: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  return (
    <>
      <PageHeader
        title={user.role === "agency" ? "Leads" : "Inquiries"}
        subtitle={
          user.role === "agency"
            ? "Audit sign-ups from the website and inquiries from clients' public pages. Updates live."
            : "Inquiries from your public pages."
        }
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <Empty>No leads yet. Run an audit on the website to create one.</Empty>
      ) : (
        <div className="grid gap-3" data-testid="leads">
          {data.map((lead) => {
            const p = lead.payload as Record<string, string | number | undefined>;
            const biz = businesses.find((b) => b.id === lead.businessId);
            const contact = lead.email ?? lead.whatsapp;
            return (
              <Card key={lead.id} className="p-4">
                <div
                  className="flex flex-wrap items-start justify-between gap-3"
                  data-lead={lead.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={lead.kind === "audit" ? "info" : "warn"}>
                        {lead.kind === "audit" ? "Audit lead" : "Inquiry"}
                      </Badge>
                      <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                      <span className="text-xs text-ink-soft" title={dateTime(lead.createdAt)}>
                        {ago(lead.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-ink">
                      {lead.kind === "audit"
                        ? String(p.businessName ?? "Unknown business")
                        : (lead.name ?? "Unnamed")}
                      {lead.kind === "audit" && p.score !== undefined ? (
                        <span className="ms-2 text-sm font-normal text-ink-soft">
                          score {p.score}/100
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {lead.kind === "audit"
                        ? [p.vertical, p.district, p.website].filter(Boolean).join(" · ")
                        : [biz?.name, p.packageName, lead.country, p.dates]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                    {contact ? (
                      <p className="mt-1 text-sm text-ink">
                        {[lead.name, lead.email, lead.whatsapp].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                    {p.summary ? (
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-paper-deep p-2 font-sans text-xs text-ink-soft">
                        {String(p.summary)}
                      </pre>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {lead.whatsapp ? (
                      <a
                        className="text-sm font-semibold text-terracotta-600"
                        href={whatsappUrl(lead.whatsapp, "")}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp →
                      </a>
                    ) : null}
                    {lead.email ? (
                      <a
                        className="text-sm font-semibold text-cobalt-700"
                        href={`mailto:${lead.email}`}
                      >
                        Email →
                      </a>
                    ) : null}
                    <select
                      aria-label="Lead status"
                      className="field w-auto py-1"
                      value={lead.status}
                      onChange={(e) =>
                        setStatus.mutate({ id: lead.id, status: e.target.value as Lead["status"] })
                      }
                    >
                      {["new", "contacted", "won", "lost"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
