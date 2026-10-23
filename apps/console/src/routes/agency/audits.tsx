import { useQuery } from "@tanstack/react-query";
import { Badge, Card, Empty, PageHeader, Spinner } from "../../components/ui.tsx";
import { api } from "../../lib/api.ts";
import { ago } from "../../lib/format.ts";

interface AuditRow {
  id: string;
  businessName: string;
  vertical: string;
  district: string;
  website: string | null;
  score: number;
  leadId: string | null;
  matched: string | null;
  createdAt: string;
}

const SITE_ORIGIN = import.meta.env.VITE_SITE_ORIGIN ?? "http://localhost:4321";

export function AgencyAudits() {
  const { data, isLoading } = useQuery({
    queryKey: ["audits"],
    queryFn: () => api<{ audits: AuditRow[] }>("/console/agency/audits").then((r) => r.audits),
  });
  return (
    <>
      <PageHeader
        title="Audits"
        subtitle="Every AI Visibility Audit run on the website. Engine answers are sample data until real queries ship."
      />
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <Empty>No audits yet.</Empty>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-start text-xs text-ink-soft">
              <tr>
                <th className="p-3 text-start font-semibold">Business</th>
                <th className="p-3 text-start font-semibold">Area</th>
                <th className="p-3 text-end font-semibold">Score</th>
                <th className="p-3 text-start font-semibold">Data</th>
                <th className="p-3 text-start font-semibold">Lead</th>
                <th className="p-3 text-end font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((a) => (
                <tr key={a.id}>
                  <td className="p-3">
                    <a
                      className="font-semibold text-cobalt-700"
                      href={`${SITE_ORIGIN}/en/audit/?id=${a.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.businessName}
                    </a>
                    <div className="text-xs text-ink-soft">{a.website}</div>
                  </td>
                  <td className="p-3 text-ink-soft">
                    {a.vertical} · {a.district}
                  </td>
                  <td className="p-3 text-end font-semibold tabular-nums">{a.score}</td>
                  <td className="p-3">
                    {a.matched ? (
                      <Badge tone="info">Seeded demo</Badge>
                    ) : (
                      <Badge tone="warn">Sample</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    {a.leadId ? <Badge tone="ok">Captured</Badge> : <Badge>None</Badge>}
                  </td>
                  <td className="p-3 text-end text-ink-soft">{ago(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
