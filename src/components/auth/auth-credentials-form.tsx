"use client";

import Link from "next/link";
import { useActionState } from "react";

import { RouteHeader } from "@/src/components/ui/route-header";
import {
  type AuthFieldName,
  type AuthFormState,
  loginAction,
  registerAction,
} from "@/src/lib/auth-actions";

type AuthMode = "login" | "register";

type AuthModeContent = {
  eyebrow: string;
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  submitLabel: string;
  pendingLabel: string;
  switchHref: string;
  switchLabel: string;
  namePlaceholder?: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
};

const authModeContent: Record<AuthMode, AuthModeContent> = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to keep writing without friction.",
    description:
      "Access TinyNotes with a focused email and password flow that keeps the entry point simple.",
    formTitle: "Login",
    formDescription: "Use your email and password to continue to your notes.",
    submitLabel: "Sign in",
    pendingLabel: "Signing in...",
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
    formDescription: "Create a TinyNotes account with a name, email, and password.",
    submitLabel: "Create account",
    pendingLabel: "Creating account...",
    switchHref: "/login",
    switchLabel: "Back to login",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Choose a password",
  },
};

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
    title: "Session-backed",
    description: "Secure cookies keep signed-in users connected to their private notes.",
  },
] as const;

const inputClassName =
  "w-full rounded-2xl border border-border bg-[rgba(4,18,31,0.82)] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-[rgba(191,211,223,0.78)] focus:border-accent-strong focus:bg-[rgba(7,24,41,0.98)] focus:ring-4 focus:ring-[rgba(122,211,196,0.16)]";

const initialAuthFormState: AuthFormState = {
  message: null,
  fieldErrors: {},
  values: {},
};

type FieldConfig = {
  id: string;
  label: string;
  name: AuthFieldName;
  type: "email" | "password" | "text";
  autoComplete: string;
  placeholder: string;
};

type AuthCredentialsFormProps = {
  mode: AuthMode;
};

export function AuthCredentialsForm({ mode }: AuthCredentialsFormProps) {
  const content = authModeContent[mode];
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, isPending] = useActionState(action, initialAuthFormState);
  const fields: FieldConfig[] = [
    ...(mode === "register"
      ? [
          {
            id: `${mode}-name`,
            label: "Name",
            name: "name" as const,
            type: "text" as const,
            autoComplete: "name",
            placeholder: content.namePlaceholder ?? "Your name",
          },
        ]
      : []),
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
  ];

  return (
    <section className="relative isolate w-full overflow-hidden rounded-[32px] border border-border-strong bg-[linear-gradient(145deg,rgba(9,29,45,0.98),rgba(3,14,24,1))] shadow-[0_40px_120px_rgba(1,9,18,0.58)]">
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
                className="rounded-[22px] border border-border bg-[rgba(6,22,36,0.72)] p-4 backdrop-blur-md"
              >
                <p className="text-sm font-semibold text-foreground">{highlight.title}</p>
                <p className="mt-2 text-sm leading-6 text-[rgba(223,239,247,0.82)]">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-[rgba(3,16,28,0.86)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-accent">{content.formTitle}</p>
              <p className="max-w-xs text-sm leading-6 text-[rgba(223,239,247,0.82)]">
                {content.formDescription}
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-border-strong bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-accent transition hover:border-accent-strong hover:text-foreground"
              href={content.switchHref}
            >
              {content.switchLabel}
            </Link>
          </div>

          <form action={formAction} className="grid gap-5 pt-6">
            {fields.map((field) => (
              <div key={field.id} className="grid gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor={field.id}>
                  {field.label}
                </label>
                <input
                  aria-describedby={
                    state.fieldErrors[field.name] === undefined ? undefined : `${field.id}-error`
                  }
                  aria-invalid={state.fieldErrors[field.name] === undefined ? undefined : true}
                  autoComplete={field.autoComplete}
                  className={inputClassName}
                  defaultValue={
                    field.name === "password" ? undefined : (state.values[field.name] ?? "")
                  }
                  disabled={isPending}
                  id={field.id}
                  name={field.name}
                  placeholder={field.placeholder}
                  required
                  type={field.type}
                />
                {state.fieldErrors[field.name] === undefined ? null : (
                  <p
                    className="text-sm leading-6 text-[#ffb4a8]"
                    id={`${field.id}-error`}
                    role="alert"
                  >
                    {state.fieldErrors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {state.message === null ? null : (
              <p
                aria-live="polite"
                className="rounded-2xl border border-[rgba(255,180,168,0.34)] bg-[rgba(81,23,20,0.32)] px-4 py-3 text-sm leading-6 text-[#ffd6ce]"
                role="alert"
              >
                {state.message}
              </p>
            )}

            <button
              className="mt-2 inline-flex items-center justify-center rounded-full bg-accent-strong px-5 py-3 text-sm font-semibold text-background shadow-[0_18px_34px_rgba(47,207,197,0.2)] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isPending}
              type="submit"
            >
              {isPending ? content.pendingLabel : content.submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
