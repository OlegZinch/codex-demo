import Link from "next/link";

import { RouteHeader } from "@/src/components/ui/route-header";

type AuthMode = "login" | "register";

type AuthModeContent = {
  eyebrow: string;
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  submitLabel: string;
  switchHref: string;
  switchLabel: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
};

const authModeContent = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to keep writing without friction.",
    description:
      "Access TinyNotes with a focused email and password flow that keeps the entry point simple.",
    formTitle: "Login",
    formDescription: "Use the demo form below. Authentication wiring lands in the next pass.",
    submitLabel: "Sign in",
    switchHref: "/register",
    switchLabel: "Create account",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Enter your password",
  },
  register: {
    eyebrow: "New account",
    title: "Create an account and start capturing notes.",
    description:
      "Register with the same straightforward credentials flow. No extra providers, no reset detours.",
    formTitle: "Register",
    formDescription: "This is the UI scaffold for account creation. Auth logic still needs wiring.",
    submitLabel: "Create account",
    switchHref: "/login",
    switchLabel: "Back to login",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Choose a password",
  },
} satisfies Record<AuthMode, AuthModeContent>;

const authHighlights = [
  {
    title: "Email-first",
    description: "A single credentials path keeps access predictable and easy to scan.",
  },
  {
    title: "No detours",
    description: "There is no password reset or third-party provider branch in this flow.",
  },
  {
    title: "Ready to wire",
    description: "The layout is prepared for validation, server actions, and sessions next.",
  },
] as const;

const inputClassName =
  "w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition placeholder:text-[color:var(--color-foreground-muted)] focus:border-[color:var(--color-accent-strong)] focus:ring-4 focus:ring-[rgba(24,143,131,0.12)]";

type AuthCredentialsFormProps = {
  mode: AuthMode;
};

export function AuthCredentialsForm({ mode }: AuthCredentialsFormProps) {
  const content = authModeContent[mode];
  const fields = [
    {
      id: `${mode}-email`,
      label: "Email",
      name: "email",
      type: "email",
      autoComplete: "email",
      placeholder: content.emailPlaceholder,
    },
    {
      id: `${mode}-password`,
      label: "Password",
      name: "password",
      type: "password",
      autoComplete: mode === "login" ? "current-password" : "new-password",
      placeholder: content.passwordPlaceholder,
    },
  ] as const;

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
      <div className="grid gap-8">
        <RouteHeader
          description={content.description}
          eyebrow={content.eyebrow}
          title={content.title}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {authHighlights.map((highlight) => (
            <div
              key={highlight.title}
              className="rounded-[22px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.54)] p-4"
            >
              <p className="text-sm font-semibold tracking-[-0.01em] text-[color:var(--color-foreground)]">
                {highlight.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-foreground-muted)]">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[26px] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_24px_60px_rgba(13,59,57,0.12)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
              {content.formTitle}
            </p>
            <p className="max-w-xs text-sm leading-6 text-[color:var(--color-foreground-muted)]">
              {content.formDescription}
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent-strong)] hover:text-[color:var(--color-accent-strong)]"
            href={content.switchHref}
          >
            {content.switchLabel}
          </Link>
        </div>

        <form className="grid gap-5 pt-6">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-2">
              <label
                className="text-sm font-medium tracking-[-0.01em] text-[color:var(--color-foreground)]"
                htmlFor={field.id}
              >
                {field.label}
              </label>
              <input
                autoComplete={field.autoComplete}
                className={inputClassName}
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                required
                type={field.type}
              />
            </div>
          ))}

          <button
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent-strong)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(24,143,131,0.28)] transition hover:bg-[color:var(--color-foreground)]"
            type="button"
          >
            {content.submitLabel}
          </button>

          <p className="text-xs leading-6 text-[color:var(--color-foreground-muted)]">
            UI scaffold only for now. Validation, session handling, and persistence will be wired in
            the next pass.
          </p>
        </form>
      </div>
    </section>
  );
}
