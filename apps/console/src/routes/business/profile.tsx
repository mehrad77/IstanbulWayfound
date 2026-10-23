import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import type { Localized } from "@wayfound/core";
import { Plus, Trash2 } from "lucide-react";
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
import { api } from "../../lib/api.ts";

interface Profile {
  business: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    website: string | null;
    tagline: Localized;
    description: Localized;
    howToFindUs: Localized;
  };
  location: { street: string; district: string; city: string } | null;
}

export function ProfilePage() {
  const { bid } = useParams({ from: "/app/b/$bid/profile" });
  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: ["profile", bid],
    queryFn: () => api<Profile>(`/console/businesses/${bid}`),
  });
  const faqsQ = useQuery({
    queryKey: ["faqs", bid],
    queryFn: () =>
      api<{ faqs: { id?: string; question: Localized; answer: Localized }[] }>(
        `/console/businesses/${bid}/faqs`,
      ).then((r) => r.faqs),
  });
  const [form, setForm] = useState<Profile["business"] | null>(null);
  const [faqs, setFaqs] = useState<
    { id?: string; question: Localized; answer: Localized }[] | null
  >(null);
  useEffect(() => {
    if (profile.data && !form) setForm(profile.data.business);
  }, [profile.data, form]);
  useEffect(() => {
    if (faqsQ.data && !faqs) setFaqs(faqsQ.data);
  }, [faqsQ.data, faqs]);

  const save = useMutation({
    mutationFn: async () => {
      if (form) {
        const { name, phone, whatsapp, email, website, tagline, description, howToFindUs } = form;
        await api(`/console/businesses/${bid}`, {
          method: "PATCH",
          json: { name, phone, whatsapp, email, website, tagline, description, howToFindUs },
        });
      }
      if (faqs) await api(`/console/businesses/${bid}/faqs`, { method: "PUT", json: { faqs } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", bid] });
      qc.invalidateQueries({ queryKey: ["businesses"] });
    },
  });

  if (!form || !faqs) return <Spinner />;
  const set = <K extends keyof Profile["business"]>(k: K, v: Profile["business"][K]) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="grid max-w-4xl gap-6">
      <Card className="grid gap-4 p-5">
        <h2 className="font-semibold text-ink">Business Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Website" hint="Leave empty to use the public page">
            <Input
              value={form.website ?? ""}
              onChange={(e) => set("website", e.target.value || null)}
            />
          </Field>
          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Address">
            <Input
              value={
                profile.data?.location
                  ? `${profile.data.location.street}, ${profile.data.location.district}`
                  : ""
              }
              disabled
            />
          </Field>
        </div>
        <LocalizedField label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
        <LocalizedField
          label="Description"
          value={form.description}
          onChange={(v) => set("description", v)}
          multiline
        />
        <LocalizedField
          label="How to find us"
          value={form.howToFindUs}
          onChange={(v) => set("howToFindUs", v)}
          multiline
        />
      </Card>

      <Card className="grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-ink">FAQ</h2>
            <p className="text-sm text-ink-soft">
              Short answers (40–60 words) that AI engines can quote. Published with FAQPage schema.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFaqs([...faqs, { question: { en: "", tr: "" }, answer: { en: "", tr: "" } }])
            }
          >
            <Plus className="size-3.5" /> Add question
          </Button>
        </div>
        {faqs.map((f, i) => (
          <div key={f.id ?? i} className="grid gap-2 rounded-xl border border-line p-3">
            <LocalizedField
              label={`Question ${i + 1}`}
              value={f.question}
              onChange={(v) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, question: v } : x)))}
            />
            <LocalizedField
              label="Answer"
              value={f.answer}
              multiline
              onChange={(v) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, answer: v } : x)))}
            />
            <p className="text-xs text-ink-soft">
              {f.answer.en.split(/\s+/).filter(Boolean).length} words (EN)
              <Button
                variant="danger"
                size="sm"
                className="ms-2"
                onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-3.5" /> Remove
              </Button>
            </p>
          </div>
        ))}
      </Card>

      <div className="sticky bottom-4 flex items-center gap-3">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
        {save.isSuccess ? (
          <span className="text-sm text-ok">Saved. Live on the public page.</span>
        ) : null}
        <ErrorNote error={save.error} />
      </div>
    </div>
  );
}
