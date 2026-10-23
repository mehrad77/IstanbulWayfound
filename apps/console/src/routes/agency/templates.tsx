import { useQuery } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, PageHeader, Spinner } from "../../components/ui.tsx";
import { api } from "../../lib/api.ts";

interface Template {
  id: string;
  key: string;
  category: string;
  vertical: string | null;
  lang: string;
  title: string;
  body: string;
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{" "}
      {done ? "Copied" : "Copy"}
    </Button>
  );
}

export function TemplatesPage() {
  const [lang, setLang] = useState<"en" | "tr">("en");
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => api<{ templates: Template[] }>("/console/templates").then((r) => r.templates),
  });
  if (isLoading || !data) return <Spinner />;
  const shown = data.filter((t) => t.lang === lang);
  return (
    <>
      <PageHeader
        title="WhatsApp templates"
        subtitle="Ready-to-paste replies for bookings, price objections and follow-ups. Replace the {placeholders} before sending. Arabic comes after the demo."
        actions={
          <div className="flex rounded-lg border border-line bg-white p-0.5 text-sm">
            {(["en", "tr"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-md px-3 py-1 font-semibold ${lang === l ? "bg-cobalt-700 text-white" : "text-ink-soft"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((t) => (
          <Card key={t.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-ink">{t.title}</p>
              <div className="flex gap-1">
                <Badge>{t.category}</Badge>
                {t.vertical ? <Badge tone="info">{t.vertical}</Badge> : null}
              </div>
            </div>
            <p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-ink-soft" lang={t.lang}>
              {t.body}
            </p>
            <div className="mt-3">
              <CopyButton text={t.body} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
