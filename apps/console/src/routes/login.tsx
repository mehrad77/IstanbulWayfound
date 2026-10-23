import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { BRAND } from "@wayfound/core";
import { useState } from "react";
import { Button, Card, ErrorNote, Input } from "../components/ui.tsx";
import { api } from "../lib/api.ts";

export function LoginPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState<{ devLink?: string } | null>(null);
  const [error, setError] = useState<unknown>(
    search.error === "link"
      ? new Error("That sign-in link has expired or was already used.")
      : null,
  );
  const demo = useQuery({
    queryKey: ["demo-accounts"],
    queryFn: () =>
      api<{
        enabled: boolean;
        agencyNeedsCode: boolean;
        accounts: { account: string; label: string; role: string }[];
      }>("/auth/demo-accounts"),
  });

  async function demoSignIn(account: string) {
    setError(null);
    try {
      await api("/auth/demo", {
        method: "POST",
        json: { account, code: account === "agency" ? code : undefined },
      });
      await qc.invalidateQueries();
      navigate({ to: "/" });
    } catch (e) {
      setError(e);
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setSent(await api<{ devLink?: string }>("/auth/magic", { method: "POST", json: { email } }));
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-cobalt-700 font-serif text-2xl font-bold text-white">
            W
          </span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-cobalt-900">
            {BRAND.name} Console
          </h1>
          <p className="mt-1 text-sm text-ink-soft">For business owners and the agency team</p>
        </div>
        <Card className="p-6">
          <ErrorNote error={error} />
          {demo.data?.enabled ? (
            <div className="mb-6">
              <p className="label">Demo accounts</p>
              <div className="mt-2 grid gap-2">
                {demo.data.accounts.map((a) => (
                  <Button
                    key={a.account}
                    variant={a.role === "agency" ? "primary" : "secondary"}
                    className="justify-between"
                    onClick={() => demoSignIn(a.account)}
                  >
                    <span>{a.label}</span>
                    <span aria-hidden="true">→</span>
                  </Button>
                ))}
              </div>
              {demo.data.agencyNeedsCode ? (
                <Input
                  className="mt-2"
                  type="password"
                  autoComplete="off"
                  aria-label="Agency passcode"
                  placeholder="Agency passcode (for the agency team only)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              ) : null}
            </div>
          ) : null}
          <form onSubmit={sendLink} className="grid gap-2">
            <p className="label">Email sign-in link</p>
            <Input
              type="email"
              required
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              Send me a link
            </Button>
          </form>
          {sent ? (
            <div className="mt-3 rounded-lg bg-cobalt-50 p-3 text-sm text-cobalt-800">
              If that address has an account, a sign-in link is on its way.
              {sent.devLink ? (
                <>
                  <br />
                  <span className="text-xs text-ink-soft">
                    Demo mode: email isn't sent, so here's the link.
                  </span>{" "}
                  <a className="font-semibold underline" href={sent.devLink}>
                    Open sign-in link
                  </a>
                </>
              ) : null}
            </div>
          ) : null}
        </Card>
        <p className="mt-4 text-center text-xs text-ink-soft">
          Agency staff sign in through Cloudflare Access in production.
        </p>
      </div>
    </div>
  );
}
