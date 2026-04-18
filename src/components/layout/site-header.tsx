import Link from "next/link";

const authLinks = [
  {
    href: "/login",
    label: "Login",
  },
  {
    href: "/register",
    label: "Register",
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-[rgba(3,16,28,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-6 sm:px-8 lg:px-10">
        <Link
          className="text-lg font-semibold tracking-[-0.02em] text-[#7ad3c4] transition hover:text-[color:var(--color-foreground)]"
          href="/"
        >
          TinyNotes
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2">
          {authLinks.map((link) => {
            const isPrimary = link.href === "/register";

            return (
              <Link
                key={link.href}
                className={
                  isPrimary
                    ? "rounded-full bg-[color:var(--color-accent-strong)] px-4 py-2 text-sm font-medium text-[#04111c] shadow-[0_12px_30px_rgba(47,207,197,0.22)] transition hover:bg-[color:var(--color-accent)]"
                    : "rounded-full px-4 py-2 text-sm font-medium text-[#7ad3c4] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-foreground)]"
                }
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
