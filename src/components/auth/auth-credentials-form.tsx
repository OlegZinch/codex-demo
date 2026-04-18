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
  "w-full rounded-2xl border border-[color:var(--color-border)] bg-[rgba(4,18,31,0.82)] px-4 py-3 text-sm text-[color:var(--color-foreground)] outline-none transition placeholder:text-[rgba(191,211,223,0.78)] focus:border-[color:var(--color-accent-strong)] focus:bg-[rgba(7,24,41,0.98)] focus:ring-4 focus:ring-[rgba(122,211,196,0.16)]";

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
    <section className="relative isolate w-full overflow-hidden rounded-[32px] border border-[color:var(--color-border-strong)] bg-[linear-gradient(145deg,rgba(9,29,45,0.98),rgba(3,14,24,1))] shadow-[0_40px_120px_rgba(1,9,18,0.58)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(122,211,196,0.2),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(61,122,255,0.16),_transparent_32%)]" />

      <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,420px)] lg:items-center lg:gap-12 lg:p-10">
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
                className="rounded-[22px] border border-[color:var(--color-border)] bg-[rgba(6,22,36,0.72)] p-4 backdrop-blur-md"
              >
                <p className="text-sm font-semibold tracking-[-0.01em] text-[color:var(--color-foreground)]">
                  {highlight.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[rgba(223,239,247,0.82)]">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[color:var(--color-border)] bg-[rgba(3,16,28,0.86)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                {content.formTitle}
              </p>
              <p className="max-w-xs text-sm leading-6 text-[rgba(223,239,247,0.82)]">
                {content.formDescription}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-[#7ad3c4] transition hover:border-[color:var(--color-accent-strong)] hover:text-[color:var(--color-foreground)]"
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
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent-strong)] px-5 py-3 text-sm font-semibold text-[#04111c] shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-[color:var(--color-accent)]"
              type="button"
            >
              {content.submitLabel}
            </button>

            <p className="text-xs leading-6 text-[color:var(--color-foreground-muted)]">
              UI scaffold only for now. Validation, session handling, and persistence will be wired
              in the next pass.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
