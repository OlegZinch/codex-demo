import Link from "next/link";

import { logoutAction } from "@/src/lib/auth-actions";
import { getCurrentSession } from "@/src/lib/session";

const linkClassName =
  "rounded-full px-4 py-2 text-sm font-medium text-[#7ad3c4] transition hover:bg-[color:var(--color-surface-muted)] hover:text-[color:var(--color-foreground)]";

const primaryLinkClassName =
  "rounded-full bg-[color:var(--color-accent-strong)] px-4 py-2 text-sm font-medium text-[#04111c] shadow-[0_12px_30px_rgba(47,207,197,0.22)] transition hover:bg-[color:var(--color-accent)]";

const logoutButtonClassName =
  "rounded-full border border-[color:var(--color-border-strong)] bg-[rgba(7,24,41,0.84)] px-4 py-2 text-sm font-medium text-[#7ad3c4] transition hover:border-[color:var(--color-accent-strong)] hover:text-[color:var(--color-foreground)]";

export async function SiteHeader() {
  const session = await getCurrentSession();
  const isLoggedIn = session !== null;

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
          {isLoggedIn ? (
            <>
              <Link className={primaryLinkClassName} href="/notes">
                Notes
              </Link>
              <form action={logoutAction}>
                <button className={logoutButtonClassName} type="submit">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className={linkClassName} href="/login">
                Login
              </Link>
              <Link className={primaryLinkClassName} href="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
