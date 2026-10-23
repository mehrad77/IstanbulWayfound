import clsx from "clsx";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "accent" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        variant === "primary" && "bg-cobalt-700 text-white hover:bg-cobalt-800",
        variant === "accent" && "bg-terracotta-500 text-white hover:bg-terracotta-600",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-paper-deep",
        variant === "ghost" && "text-cobalt-700 hover:bg-cobalt-50",
        variant === "danger" && "text-bad hover:bg-bad-soft",
        className,
      )}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("card", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-cobalt-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control is passed in as children
    <label className={clsx("grid gap-1", className)}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("field", props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={clsx("field", props.className)} />;
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "ok" | "warn" | "bad" | "info";
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-paper-deep text-ink-soft",
        tone === "ok" && "bg-ok-soft text-ok",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "bad" && "bg-bad-soft text-bad",
        tone === "info" && "bg-cobalt-50 text-cobalt-700",
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="label">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-soft">{hint}</p> : null}
    </Card>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}

export function Spinner() {
  return <div className="p-8 text-center text-sm text-ink-soft">Loading…</div>;
}

export function ErrorNote({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p className="rounded-lg bg-bad-soft p-3 text-sm text-bad">
      {error instanceof Error ? error.message : String(error)}
    </p>
  );
}

/** EN and TR side by side for one field. */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline,
  onSuggest,
}: {
  label: string;
  value: { en: string; tr: string };
  onChange: (v: { en: string; tr: string }) => void;
  multiline?: boolean;
  onSuggest?: (from: "en" | "tr", to: "en" | "tr") => void;
}) {
  const Control = multiline ? Textarea : Input;
  return (
    <div className="grid gap-1">
      <span className="label">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["en", "tr"] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute end-2 top-2 rounded bg-paper-deep px-1 text-[10px] font-bold text-ink-soft">
              {lang.toUpperCase()}
            </span>
            <Control
              aria-label={`${label} (${lang.toUpperCase()})`}
              value={value[lang]}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              className="pe-10"
              lang={lang}
            />
            {onSuggest && !value[lang] && value[lang === "en" ? "tr" : "en"] ? (
              <button
                type="button"
                className="mt-1 text-xs font-semibold text-cobalt-700"
                onClick={() => onSuggest(lang === "en" ? "tr" : "en", lang)}
              >
                ✦ Suggest translation (mock)
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
