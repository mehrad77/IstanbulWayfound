import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { Button, Card, Field, Input } from "../../components/ui.tsx";
import { PUBLIC_ORIGIN } from "../../lib/api.ts";
import { CATALOG_LABEL } from "../../lib/format.ts";
import { download, printKitPdf, qrPng, qrSvg, tableTentPdf } from "../../lib/print.ts";
import { useBusiness } from "../../lib/session.ts";

function QrCard({
  title,
  url,
  file,
  children,
}: {
  title: string;
  url: string;
  file: string;
  children?: React.ReactNode;
}) {
  const preview = useQuery({ queryKey: ["qr", url], queryFn: () => qrPng(url, 512) });
  return (
    <Card className="grid gap-3 p-5">
      <div>
        <h2 className="font-semibold text-ink">{title}</h2>
        <a
          className="break-all text-xs text-cobalt-700"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {url}
        </a>
      </div>
      {preview.data ? (
        <img src={preview.data} alt={`QR code for ${url}`} className="mx-auto w-44" />
      ) : (
        <div className="mx-auto size-44" />
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => download(`${file}.png`, await qrPng(url, 2048))}
        >
          <Download className="size-3.5" /> PNG
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={async () =>
            download(`${file}.svg`, new Blob([await qrSvg(url)], { type: "image/svg+xml" }))
          }
        >
          <Download className="size-3.5" /> SVG
        </Button>
        {children}
      </div>
    </Card>
  );
}

export function QrPage() {
  const { bid } = useParams({ from: "/app/b/$bid/qr" });
  const biz = useBusiness(bid)!;
  const [staff, setStaff] = useState("S1");
  const [busy, setBusy] = useState<string | null>(null);
  const menuUrl = `${PUBLIC_ORIGIN}/m/${biz.slug}?src=qr`;
  const reviewUrl = `${PUBLIC_ORIGIN}/r/${biz.slug}${staff ? `?staff=${encodeURIComponent(staff)}` : ""}`;
  const what = CATALOG_LABEL[biz.vertical];
  const whatTr = { dining: "menü", retail: "katalog", clinic: "fiyat listesi" }[biz.vertical];

  async function run(key: string, fn: () => Promise<Blob>, name: string) {
    setBusy(key);
    try {
      download(name, await fn());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid max-w-5xl gap-4">
      <p className="text-sm text-ink-soft">
        QR codes point at the live page, so you never reprint when a price changes. Menu codes add{" "}
        <code>?src=qr</code> so scans show up in Stats.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <QrCard title={`${what} QR`} url={menuUrl} file={`${biz.slug}-menu-qr`}>
          <Button
            size="sm"
            onClick={() =>
              run(
                "tent",
                () =>
                  tableTentPdf({
                    name: biz.name,
                    url: menuUrl,
                    en: {
                      title: biz.name,
                      lines: [
                        `Scan for the ${what.toLowerCase()}`,
                        "English · Türkçe · prices in €, $, £",
                      ],
                      qrUrl: menuUrl,
                      footer: "Prices charged in Turkish lira",
                    },
                    tr: {
                      title: biz.name,
                      lines: [
                        `${whatTr[0]!.toUpperCase()}${whatTr.slice(1)} için okutun`,
                        "Türkçe · English",
                      ],
                      qrUrl: menuUrl,
                      footer: "Fiyatlar Türk lirası ile alınır",
                      accent: "#c4623a",
                    },
                  }),
                `${biz.slug}-table-tent.pdf`,
              )
            }
            disabled={busy !== null}
          >
            <FileText className="size-3.5" /> {busy === "tent" ? "Building…" : "Table-tent PDF"}
          </Button>
        </QrCard>
        <QrCard title="Review stand / NFC card" url={reviewUrl} file={`${biz.slug}-review-qr`}>
          <Button
            size="sm"
            onClick={() =>
              run(
                "kit",
                () =>
                  printKitPdf({
                    name: biz.name,
                    reviewUrl,
                    nfcUrl: reviewUrl,
                    en: {
                      title: "Enjoyed your visit?",
                      lines: [biz.name, "Tap or scan to leave a review"],
                      qrUrl: reviewUrl,
                      footer: "Takes a minute · helps other travellers",
                    },
                    tr: {
                      title: "Memnun kaldınız mı?",
                      lines: [biz.name, "Yorum bırakmak için dokunun ya da okutun"],
                      qrUrl: reviewUrl,
                      footer: "Bir dakikanızı alır",
                      accent: "#c4623a",
                    },
                    card: {
                      title: biz.name,
                      lines: [],
                      qrUrl: reviewUrl,
                      footer: "Tap here · NFC",
                    },
                  }),
                `${biz.slug}-review-print-kit.pdf`,
              )
            }
            disabled={busy !== null}
          >
            <FileText className="size-3.5" /> {busy === "kit" ? "Building…" : "Print kit PDF"}
          </Button>
        </QrCard>
      </div>
      <Card className="grid gap-3 p-5 sm:grid-cols-[200px_1fr]">
        <Field
          label="Staff station code"
          hint="Shows which station a tap came from. For tracking only, never for paying for reviews."
        >
          <Input
            value={staff}
            onChange={(e) => setStaff(e.target.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20))}
          />
        </Field>
        <div className="text-sm text-ink-soft">
          <p className="font-semibold text-ink">For the print vendor</p>
          <p className="mt-1">
            Program this URL into the NFC tag (NTAG213 or larger), then print the stand insert (A6)
            and tap card (85×55 mm) from the kit:
          </p>
          <code className="mt-1 block break-all rounded bg-paper-deep p-2 text-xs">
            {reviewUrl}
          </code>
        </div>
      </Card>
    </div>
  );
}
